// src/ai/ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { SaraAgent } from './agent/sara-agent';
import { Property, Review, Booking, Amenity } from '@prisma/client';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

interface ChatOptions {
    role: 'host' | 'guest';
    context?: Record<string, any>;
    conversationHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}

interface PropertyData {
    property: Property;
    reviews: Review[];
    bookings: Booking[];
    amenities: Amenity[];
}

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private agentExecutor: any;
    private agentConfig: any;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly saraAgent: SaraAgent,
    ) {
        this.initializeAgent();
    }

    private async initializeAgent() {
        try {
            const { agent, config } = await this.saraAgent.createAgentExecutor();
            this.agentExecutor = agent;
            this.agentConfig = config;
        } catch (error) {
            this.logger.error('Failed to initialize agent:', error);
            throw error;
        }
    }

    async analyzeSentiment(text: string) {
        try {
            const response = await this.saraAgent.analyzeSentiment(text);
            return { sentiment: response };
        } catch (error) {
            this.logger.error('Error analyzing sentiment:', error);
            throw error;
        }
    }

    async generatePropertyInsights(data: PropertyData) {
        try {
            const response = await this.saraAgent.generatePropertyInsights(data);
            return this.parseAIResponse(response);
        } catch (error) {
            this.logger.error('Error generating property insights:', error);
            throw error;
        }
    }

    async generatePricingRecommendation(data: {
        property: Property;
        marketData: any[];
        bookings: Booking[];
        reviews: Review[];
    }) {
        try {
            const response = await this.saraAgent.generatePricingRecommendation(data);
            return this.parseAIResponse(response);
        } catch (error) {
            this.logger.error('Error generating pricing recommendation:', error);
            throw error;
        }
    }

    async generateHostingTips(data: {
        host: any;
        properties: Property[];
    }) {
        try {
            const response = await this.saraAgent.generateHostingTips(data);
            return this.parseAIResponse(response);
        } catch (error) {
            this.logger.error('Error generating hosting tips:', error);
            throw error;
        }
    }

    async generatePropertyImprovementSuggestions(data: PropertyData) {
        try {
            const response = await this.saraAgent.generatePropertyImprovementSuggestions(data);
            return this.parseAIResponse(response);
        } catch (error) {
            this.logger.error('Error generating property improvement suggestions:', error);
            throw error;
        }
    }

    async processChatMessage(userId: string, message: string, options: ChatOptions) {
        try {
            const systemMessage = this.buildSystemMessage(options.role, options.context);

            // Convert conversation history to proper format
            const messages = [
                new SystemMessage(systemMessage),
                ...(options.conversationHistory || []).map(msg =>
                    msg.role === 'user' ? new HumanMessage(msg.content) : new SystemMessage(msg.content)
                ),
                new HumanMessage(message)
            ];

            const response = await this.saraAgent.processMessage(
                userId,
                'default-session',
                message,
                this.agentExecutor,
                this.agentConfig,
                JSON.stringify(options.conversationHistory || []),
                JSON.stringify(options.context || {}),
                {
                    onToken: (token: string) => {
                        this.logger.debug(`Received token: ${token}`);
                    },
                    onError: (error: Error) => {
                        this.logger.error(`Error in chat processing: ${error.message}`);
                    }
                }
            );

            return response.output;
        } catch (error) {
            this.logger.error(`Error processing chat message: ${error.message}`);
            throw error;
        }
    }

    async analyzePropertyImage(imageUrl: string) {
        try {
            const response = await this.saraAgent.analyzeImage(imageUrl);
            return response.analysis;
        } catch (error) {
            this.logger.error('Error analyzing property image:', error);
            throw error;
        }
    }

    async getPropertyInsights(propertyId: string) {
        try {
            const property = await this.prisma.property.findUnique({
                where: { id: propertyId },
                include: {
                    images: true,
                    amenities: {
                        include: {
                            amenity: true
                        }
                    },
                    reviews: true,
                    bookings: true
                }
            });

            if (!property) {
                throw new Error('Property not found');
            }

            // Analyze property images
            const imageAnalyses = await Promise.all(
                property.images.map(async image => ({
                    imageUrl: image.imageUrl,
                    analysis: await this.analyzePropertyImage(image.imageUrl)
                }))
            );

            const response = await this.saraAgent.generatePropertyInsights({
                property,
                reviews: property.reviews,
                bookings: property.bookings,
                amenities: property.amenities.map(a => a.amenity)
            });

            return {
                insights: response,
                imageAnalyses
            };
        } catch (error) {
            this.logger.error('Error getting property insights:', error);
            throw error;
        }
    }

    async getPropertyRecommendations(userId: string, searchCriteria: Record<string, any>) {
        try {
            const response = await this.saraAgent.generatePropertyRecommendations({
                userId,
                context: {
                    searchCriteria
                }
            });

            return this.parseAIResponse(response);
        } catch (error) {
            this.logger.error('Error getting property recommendations:', error);
            throw error;
        }
    }

    private buildSystemMessage(role: 'host' | 'guest', context?: Record<string, any>): string {
        const baseMessage = `
            You are SARA (Shortlet Apartment Realtor Agent), an AI-powered assistant specialized in helping users find and book short-term accommodations.
            Your primary goal is to assist users through friendly, conversational interaction.
        `;

        const roleSpecificMessage = role === 'host'
            ? `
                As a host assistant, you should:
                1. Help hosts optimize their property listings
                2. Provide insights about guest feedback
                3. Suggest improvements for better guest experience
                4. Guide hosts through property management
                5. Help with pricing and availability management
            `
            : `
                As a guest assistant, you should:
                1. Help guests find properties that match their needs
                2. Answer questions about properties and locations
                3. Guide guests through the booking process
                4. Provide personalized recommendations
                5. Help with any booking-related issues
            `;

        return `${baseMessage}\n${roleSpecificMessage}`;
    }

    private parseAIResponse(response: any): any {
        try {
            if (typeof response === 'string') {
                return JSON.parse(response);
            }
            return response;
        } catch (error) {
            this.logger.warn(`Failed to parse AI response: ${error.message}`);
            return response;
        }
    }
}