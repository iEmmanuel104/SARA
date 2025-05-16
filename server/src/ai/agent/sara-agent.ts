import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
    AgentKit,
    ActionProvider,
    Action,
    Network,
    PrivyWalletProvider,
    cdpApiActionProvider,
    PrivyWalletConfig,
    PrivyEvmWalletProvider
} from '@coinbase/agentkit';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { Tool } from '@langchain/core/tools';
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { PropertySearchTool } from '../tools/property-search.tool';
import { BookingCheckTool } from '../tools/booking-check.tool';
import { UserPreferencesTool } from '../tools/user-preferences.tool';
import { NLPSearchTool } from '../tools/nlp-search.tool';
import { PropertyRecommendationsTool } from '../tools/property-recommendations.tool';
import { z } from 'zod';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { Hex } from 'viem';
import * as fs from 'fs';

// Custom action provider for SARA tools
class SaraActionProvider extends ActionProvider {
    constructor(
        private readonly propertySearchTool: PropertySearchTool,
        private readonly bookingCheckTool: BookingCheckTool,
        private readonly userPreferencesTool: UserPreferencesTool,
        private readonly nlpSearchTool: NLPSearchTool,
        private readonly propertyRecommendationsTool: PropertyRecommendationsTool
    ) {
        super('sara-tools', []);
    }

    getActions(): Action[] {
        return [
            {
                name: 'property_search',
                description: this.propertySearchTool.description,
                schema: z.object({
                    location: z.string(),
                    checkIn: z.string(),
                    checkOut: z.string(),
                    guests: z.number(),
                    priceMin: z.number().optional(),
                    priceMax: z.number().optional(),
                    propertyTypes: z.array(z.string()).optional(),
                    amenities: z.array(z.string()).optional(),
                    page: z.number().optional(),
                    pageSize: z.number().optional()
                }),
                invoke: async (args) => {
                    const result = await this.propertySearchTool.execute(JSON.stringify(args));
                    return typeof result === 'string' ? result : JSON.stringify(result);
                }
            },
            {
                name: 'booking_check',
                description: this.bookingCheckTool.description,
                schema: z.object({
                    propertyId: z.string(),
                    checkIn: z.string(),
                    checkOut: z.string(),
                    guests: z.number()
                }),
                invoke: async (args) => {
                    const result = await this.bookingCheckTool.execute(JSON.stringify(args));
                    return typeof result === 'string' ? result : JSON.stringify(result);
                }
            },
            {
                name: 'user_preferences',
                description: this.userPreferencesTool.description,
                schema: z.object({
                    userId: z.string(),
                    action: z.enum(['get', 'update']),
                    preferences: z.record(z.any()).optional()
                }),
                invoke: async (args) => {
                    const result = await this.userPreferencesTool.execute(JSON.stringify(args));
                    return typeof result === 'string' ? result : JSON.stringify(result);
                }
            },
            {
                name: 'nlp_search',
                description: this.nlpSearchTool.description,
                schema: z.object({
                    query: z.string(),
                    userId: z.string().optional(),
                    context: z.record(z.any()).optional()
                }),
                invoke: async (args) => {
                    const result = await this.nlpSearchTool.execute(JSON.stringify(args));
                    return typeof result === 'string' ? result : JSON.stringify(result);
                }
            },
            {
                name: 'property_recommendations',
                description: this.propertyRecommendationsTool.description,
                schema: z.object({
                    userId: z.string(),
                    limit: z.number().optional(),
                    context: z.object({
                        searchCriteria: z.record(z.any()).optional(),
                        sessionId: z.string().optional()
                    }).optional()
                }),
                invoke: async (args) => {
                    const result = await this.propertyRecommendationsTool.execute(JSON.stringify(args));
                    return typeof result === 'string' ? result : JSON.stringify(result);
                }
            }
        ];
    }

    supportsNetwork(_network: Network): boolean {
        // Since our tools don't depend on any specific network, we can support all networks
        // The Network type from AgentKit doesn't have a name property, so we'll just return true
        return true;
    }
}

@Injectable()
export class SaraAgent {
    private model: ChatOpenAI;
    private agentKit: AgentKit;
    private tools: Tool[];
    private agentWallet: PrivyEvmWalletProvider;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private propertySearchTool: PropertySearchTool,
        private bookingCheckTool: BookingCheckTool,
        private userPreferencesTool: UserPreferencesTool,
        private nlpSearchTool: NLPSearchTool,
        private propertyRecommendationsTool: PropertyRecommendationsTool,
    ) {
        // Initialize OpenAI model
        this.model = new ChatOpenAI({
            modelName: this.configService.get<string>('OPENAI_MODEL_NAME', 'gpt-4-turbo'),
            temperature: 0.7,
            openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
            streaming: true,
        });

        // Initialize tools
        this.tools = [
            this.propertySearchTool,
            this.bookingCheckTool,
            this.userPreferencesTool,
            this.nlpSearchTool,
            this.propertyRecommendationsTool,
        ];

        // Initialize AgentKit
        this.initializeAgentKit();
    }

    private async initializeAgentKit() {
        try {
            const saraActionProvider = new SaraActionProvider(
                this.propertySearchTool,
                this.bookingCheckTool,
                this.userPreferencesTool,
                this.nlpSearchTool,
                this.propertyRecommendationsTool
            );

            // Configure Agent's Wallet Provider
            const config: PrivyWalletConfig = {
                appId: this.configService.get<string>('PRIVY_APP_ID'),
                appSecret: this.configService.get<string>('PRIVY_APP_SECRET'),
                chainId: this.configService.get<string>('CHAIN_ID', '84532'), // base-sepolia
                // walletId: this.configService.get<string>('PRIVY_WALLET_ID'),
                // authorizationPrivateKey: this.configService.get<string>('PRIVY_WALLET_AUTHORIZATION_PRIVATE_KEY'),
                // authorizationKeyId: this.configService.get<string>('PRIVY_WALLET_AUTHORIZATION_KEY_ID'),
            };

            // Initialize the agent's wallet
            this.agentWallet = await PrivyWalletProvider.configureWithWallet(config);

            // Initialize AgentKit with the agent's wallet
            this.agentKit = await AgentKit.from({
                walletProvider: this.agentWallet,
                actionProviders: [
                    saraActionProvider,
                    cdpApiActionProvider({
                        apiKeyName: this.configService.get<string>('CDP_API_KEY_NAME'),
                        apiKeyPrivateKey: this.configService.get<string>('CDP_API_KEY_PRIVATE_KEY'),
                    }),
                ],
            });

            // Log the agent's wallet address for reference
            const agentAddress = await this.agentWallet.getAddress();
            console.log(`SARA Agent Wallet Address: ${agentAddress}`);

        } catch (error) {
            console.error('Failed to initialize AgentKit:', error);
            throw error;
        }
    }

    /**
     * Get the agent's wallet address
     */
    async getAgentWalletAddress(): Promise<string> {
        return await this.agentWallet.getAddress();
    }

    /**
     * Process a transaction between user and agent
     */
    async processTransaction(userWalletId: string, amount: string, description: string) {
        try {
            // Here you would implement the logic to:
            // 1. Verify the user's wallet
            // 2. Process the transaction
            // 3. Update the database
            // 4. Return transaction details
            return {
                success: true,
                message: 'Transaction processed successfully',
                // Add more transaction details as needed
            };
        } catch (error) {
            console.error('Error processing transaction:', error);
            throw error;
        }
    }

    /**
     * Creates an agent executor with specified tools
     */
    async createAgentExecutor(systemPrompt?: string) {
        const defaultSystemPrompt = `
            You are SARA (Shortlet Apartment Realtor Agent), an AI-powered assistant specialized in helping users find and book short-term accommodations.
            Your primary goal is to assist users through friendly, conversational interaction.
            
            You should:
            1. Help users find properties that match their needs and preferences
            2. Answer questions about properties, locations, and booking processes
            3. Guide users through the booking flow
            4. Provide personalized recommendations based on user preferences
            5. Remember user preferences and conversation context
            
            When helping users find properties, ask clarifying questions to understand their needs regarding:
            - Location
            - Dates of stay
            - Number of guests
            - Budget range
            - Required amenities
            - Special needs (accessibility, pet-friendly, etc.)
            
            Be concise yet helpful, and proactively offer useful information.
        `;

        // Store buffered conversation history in memory
        const memory = new MemorySaver();
        const agentConfig = { configurable: { thread_id: "SARA Agent Chat" } };

        // Create React Agent using the LLM and tools
        const agent = createReactAgent({
            llm: this.model,
            tools: this.tools,
            checkpointSaver: memory,
            messageModifier: systemPrompt || defaultSystemPrompt,
        });

        return { agent, config: agentConfig };
    }

    /**
     * Processes a user message and returns a streaming response
     */
    async processMessage(
        userId: string,
        sessionId: string,
        message: string,
        agent: any,
        config: any,
        chatHistory: string,
        userPreferences: string,
        handlers: any,
    ) {
        try {
            // Convert chat history to proper message format
            const messages = [
                new SystemMessage(this.buildSystemMessage()),
                new HumanMessage(message),
            ];

            // Execute the agent
            const stream = await agent.stream(
                { messages },
                config,
                { callbacks: handlers }
            );

            let result = '';
            for await (const chunk of stream) {
                if ("agent" in chunk) {
                    result += chunk.agent.messages[0].content;
                }
            }

            // Save the conversation to the database
            await this.saveConversation(userId, sessionId, message, result);

            return { output: result };
        } catch (error) {
            console.error('Error processing message:', error);
            throw error;
        }
    }

    /**
     * Analyzes an image and provides insights
     */
    async analyzeImage(imageUrl: string) {
        const messages = this.convertToBaseMessages([
            {
                role: 'system',
                content: 'You are an expert in property analysis. Analyze the property image and provide insights about the space, design, and potential improvements.'
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Please analyze this property image and provide insights about the space, design, and potential improvements.'
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: imageUrl,
                            detail: 'auto'
                        }
                    }
                ]
            }
        ]);

        const response = await this.model.invoke(messages);
        return {
            analysis: typeof response.content === 'string' ? response.content : response.content.toString()
        };
    }

    /**
     * Saves conversation to the database
     */
    private async saveConversation(
        userId: string,
        sessionId: string,
        userMessage: string,
        aiMessage: string,
    ) {
        try {
            // First, find or create the conversation
            const conversation = await this.prisma.aiConversation.upsert({
                where: {
                    id: `${userId}_${sessionId}`,
                },
                update: {
                    lastUserMessage: userMessage,
                    lastAiMessage: aiMessage,
                    updatedAt: new Date(),
                },
                create: {
                    id: `${userId}_${sessionId}`,
                    userId,
                    sessionId,
                    lastUserMessage: userMessage,
                    lastAiMessage: aiMessage,
                    conversationState: {},
                    extractedPreferences: {},
                },
            });

            // Then add the messages
            await Promise.all([
                this.prisma.aiMessage.create({
                    data: {
                        conversationId: conversation.id,
                        messageRole: 'user',
                        messageText: userMessage,
                    },
                }),
                this.prisma.aiMessage.create({
                    data: {
                        conversationId: conversation.id,
                        messageRole: 'ai',
                        messageText: aiMessage,
                    },
                }),
            ]);
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    }

    /**
     * Helper to extract string from MessageContent or MessageContentComplex[]
     */
    private extractContentString(content: any): string {
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
            return content.map(part => typeof part === 'string' ? part : part.text || '').join(' ');
        }
        if (typeof content === 'object' && content.text) return content.text;
        return '';
    }

    /**
     * Analyzes sentiment of text
     */
    async analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative'> {
        const messages = this.convertToBaseMessages([
            {
                role: 'system',
                content: 'Analyze the sentiment of the following text and respond with only one word: positive, neutral, or negative.'
            },
            {
                role: 'user',
                content: text
            }
        ]);

        const response = await this.model.invoke(messages);
        const content = this.extractContentString(response.content);
        return content.toLowerCase() as 'positive' | 'neutral' | 'negative';
    }

    /**
     * Generates property insights
     */
    async generatePropertyInsights(data: {
        property: any;
        reviews: any[];
        bookings: any[];
        amenities: any[];
    }) {
        const messages = this.convertToBaseMessages([
            {
                role: 'system',
                content: 'You are an expert property analyst. Provide detailed insights about the property based on the data provided.'
            },
            {
                role: 'user',
                content: this.buildPropertyInsightsPrompt(data)
            }
        ]);

        const response = await this.model.invoke(messages);
        const content = this.extractContentString(response.content);
        return this.parseAIResponse(content);
    }

    /**
     * Generates pricing recommendations
     */
    async generatePricingRecommendation(data: {
        property: any;
        marketData: any[];
        bookings: any[];
        reviews: any[];
    }) {
        const messages = this.convertToBaseMessages([
            {
                role: 'system',
                content: 'You are an expert in property pricing and market analysis. Provide detailed pricing recommendations based on the data provided.'
            },
            {
                role: 'user',
                content: this.buildPricingRecommendationPrompt(data)
            }
        ]);

        const response = await this.model.invoke(messages);
        const content = this.extractContentString(response.content);
        return this.parseAIResponse(content);
    }

    /**
     * Generates hosting tips
     */
    async generateHostingTips(data: {
        host: any;
        properties: any[];
    }) {
        const messages = this.convertToBaseMessages([
            {
                role: 'system',
                content: 'You are an expert property host advisor. Provide personalized hosting tips based on the host profile and property data.'
            },
            {
                role: 'user',
                content: this.buildHostingTipsPrompt(data)
            }
        ]);

        const response = await this.model.invoke(messages);
        const content = this.extractContentString(response.content);
        return this.parseAIResponse(content);
    }

    /**
     * Generates property improvement suggestions
     */
    async generatePropertyImprovementSuggestions(data: {
        property: any;
        reviews: any[];
        bookings: any[];
        amenities: any[];
    }) {
        const messages = this.convertToBaseMessages([
            {
                role: 'system',
                content: 'You are an expert in property improvement and guest experience optimization. Provide detailed suggestions for improving the property based on the data provided.'
            },
            {
                role: 'user',
                content: this.buildPropertyImprovementPrompt(data)
            }
        ]);

        const response = await this.model.invoke(messages);
        return this.parseAIResponse(this.extractContentString(response.content));
    }

    /**
     * Generates property recommendations based on user preferences and context
     */
    async generatePropertyRecommendations(data: {
        userId: string;
        limit?: number;
        context?: {
            searchCriteria?: Record<string, any>;
            sessionId?: string;
            userPreferences?: Record<string, any>;
        };
    }) {
        try {
            // First, get user preferences
            const userPreferences = await this.userPreferencesTool.execute(JSON.stringify({
                userId: data.userId,
                action: 'get'
            }));

            // Then, use the property recommendations tool
            const recommendations = await this.propertyRecommendationsTool.execute(JSON.stringify({
                userId: data.userId,
                limit: data.limit || 5,
                context: {
                    ...data.context,
                    userPreferences: typeof userPreferences === 'string' ? JSON.parse(userPreferences) : userPreferences
                }
            }));

            // Format the response
            const messages = this.convertToBaseMessages([
                {
                    role: 'system',
                    content: 'You are an expert in property recommendations. Format the recommendations in a clear and structured way.'
                },
                {
                    role: 'user',
                    content: this.buildPropertyRecommendationsPrompt({
                        ...data,
                        recommendations: typeof recommendations === 'string' ? JSON.parse(recommendations) : recommendations
                    })
                }
            ]);

            const response = await this.model.invoke(messages);
            const content = this.extractContentString(response.content);
            return this.parseAIResponse(content);
        } catch (error) {
            console.error('Error generating property recommendations:', error);
            throw error;
        }
    }

    private buildPropertyInsightsPrompt(data: {
        property: any;
        reviews: any[];
        bookings: any[];
        amenities: any[];
    }): string {
        return `
            Property Details:
            - Type: ${data.property.propertyType}
            - Location: ${data.property.address?.city}
            - Base Price: ${data.property.basePrice}
            - Amenities: ${data.amenities.map(a => a.amenity.name).join(', ')}
            
            Reviews Summary:
            - Total Reviews: ${data.reviews.length}
            - Average Rating: ${this.calculateAverageRating(data.reviews)}
            - Recent Feedback: ${this.getRecentFeedback(data.reviews)}
            
            Booking Statistics:
            - Total Bookings: ${data.bookings.length}
            - Occupancy Rate: ${this.calculateOccupancyRate(data.bookings)}
            
            Please provide insights about:
            1. Property Performance
            2. Guest Satisfaction
            3. Market Position
            4. Areas of Excellence
            5. Potential Concerns
        `;
    }

    private buildPricingRecommendationPrompt(data: {
        property: any;
        marketData: any[];
        bookings: any[];
        reviews: any[];
    }): string {
        return `
            Current Property:
            - Type: ${data.property.propertyType}
            - Location: ${data.property.address?.city}
            - Current Price: ${data.property.basePrice}
            - Amenities: ${data.property.amenities?.map(a => a.amenity.name).join(', ')}
            
            Market Data:
            - Similar Properties: ${data.marketData.length}
            - Average Price: ${this.calculateAverageMarketPrice(data.marketData)}
            - Price Range: ${this.calculatePriceRange(data.marketData)}
            
            Performance Data:
            - Booking Rate: ${this.calculateBookingRate(data.bookings)}
            - Guest Ratings: ${this.calculateAverageRating(data.reviews)}
            
            Please provide:
            1. Recommended Price Range
            2. Pricing Strategy
            3. Seasonal Adjustments
            4. Competitive Analysis
            5. Revenue Optimization Tips
        `;
    }

    private buildHostingTipsPrompt(data: {
        host: any;
        properties: any[];
    }): string {
        return `
            Host Profile:
            - Experience: ${this.calculateHostExperience(data.properties)}
            - Total Properties: ${data.properties.length}
            - Property Types: ${this.getPropertyTypes(data.properties)}
            
            Property Performance:
            ${this.getPropertyPerformanceSummary(data.properties)}
            
            Please provide:
            1. Best Practices
            2. Guest Communication Tips
            3. Property Management Advice
            4. Revenue Optimization Strategies
            5. Guest Experience Enhancement Tips
        `;
    }

    private buildPropertyImprovementPrompt(data: {
        property: any;
        reviews: any[];
        bookings: any[];
        amenities: any[];
    }): string {
        const averageRating = this.calculateAverageRating(data.reviews);
        return `
            Property Details:
            ${JSON.stringify(data.property, null, 2)}
            
            Average Rating: ${averageRating}
            Number of Reviews: ${data.reviews.length}
            Number of Bookings: ${data.bookings.length}
            Amenities: ${JSON.stringify(data.amenities, null, 2)}
            
            Please provide detailed suggestions for improving this property based on the data above.
        `;
    }

    private buildPropertyRecommendationsPrompt(data: {
        userId: string;
        limit?: number;
        context?: {
            searchCriteria?: Record<string, any>;
            sessionId?: string;
        };
        recommendations?: any;
    }): string {
        return `
            User ID: ${data.userId}
            Recommendation Limit: ${data.limit || 5}
            
            Context:
            ${data.context ? `
                Search Criteria: ${JSON.stringify(data.context.searchCriteria || {}, null, 2)}
                Session ID: ${data.context.sessionId || 'N/A'}
            ` : 'No additional context provided'}
            
            Recommendations:
            ${data.recommendations ? JSON.stringify(data.recommendations, null, 2) : 'No recommendations available'}
            
            Please provide:
            1. A summary of the recommendations
            2. Key features that match user preferences
            3. Potential benefits for the user
            4. Any special considerations or notes
            5. Next steps or suggested actions
        `;
    }

    private parseAIResponse(response: string) {
        try {
            return JSON.parse(response);
        } catch {
            return response.split('\n').filter(line => line.trim());
        }
    }

    private calculateAverageRating(reviews: any[]): number {
        if (!reviews.length) return 0;
        return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    }

    private getRecentFeedback(reviews: any[]): string {
        const recentReviews = reviews
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 3);
        return recentReviews.map(review => review.comment).join(' | ');
    }

    private calculateOccupancyRate(bookings: any[]): number {
        if (!bookings.length) return 0;
        const totalDays = bookings.reduce((days, b) => {
            const start = new Date(b.checkInDate);
            const end = new Date(b.checkOutDate);
            return days + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        return totalDays / (365 * bookings.length);
    }

    private calculateAverageMarketPrice(marketData: any[]): number {
        if (!marketData.length) return 0;
        return marketData.reduce((sum, property) => sum + Number(property.basePrice), 0) / marketData.length;
    }

    private calculatePriceRange(marketData: any[]): string {
        if (!marketData.length) return 'N/A';
        const prices = marketData.map(property => Number(property.basePrice));
        return `${Math.min(...prices)} - ${Math.max(...prices)}`;
    }

    private calculateBookingRate(bookings: any[]): number {
        if (!bookings.length) return 0;
        const totalDays = bookings.reduce((days, b) => {
            const start = new Date(b.checkInDate);
            const end = new Date(b.checkOutDate);
            return days + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        return totalDays / (365 * bookings.length);
    }

    private calculateHostExperience(properties: any[]): string {
        if (!properties.length) return 'New Host';
        const oldestProperty = properties.reduce((oldest, property) => {
            return property.createdAt < oldest.createdAt ? property : oldest;
        });
        const years = Math.floor((Date.now() - oldestProperty.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365));
        return `${years} year${years !== 1 ? 's' : ''}`;
    }

    private getPropertyTypes(properties: any[]): string {
        const types = new Set(properties.map(property => property.propertyType));
        return Array.from(types).join(', ');
    }

    private getPropertyPerformanceSummary(properties: any[]): string {
        return properties.map(property => `
            ${property.propertyName}:
            - Bookings: ${property.bookings?.length || 0}
            - Average Rating: ${this.calculateAverageRating(property.reviews || [])}
            - Revenue: ${this.calculatePropertyRevenue(property.bookings || [])}
        `).join('\n');
    }

    private calculatePropertyRevenue(bookings: any[]): number {
        return bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
    }

    private buildSystemMessage(): string {
        return `
            You are SARA (Shortlet Apartment Realtor Agent), an AI-powered assistant specialized in helping users find and book short-term accommodations.
            Your primary goal is to assist users through friendly, conversational interaction.
            
            You should:
            1. Help users find properties that match their needs and preferences
            2. Answer questions about properties, locations, and booking processes
            3. Guide users through the booking flow
            4. Provide personalized recommendations based on user preferences
            5. Remember user preferences and conversation context
            
            When helping users find properties, ask clarifying questions to understand their needs regarding:
            - Location
            - Dates of stay
            - Number of guests
            - Budget range
            - Required amenities
            - Special needs (accessibility, pet-friendly, etc.)
            
            Be concise yet helpful, and proactively offer useful information.
        `;
    }

    private convertToBaseMessages(messages: any[]): BaseMessage[] {
        return messages.map(msg => {
            if (msg.role === 'system') {
                return new SystemMessage(msg.content);
            } else if (msg.role === 'assistant') {
                return new AIMessage(msg.content);
            } else {
                return new HumanMessage(msg.content);
            }
        });
    }
}
