// src/ai/agent/sara-agent.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentExecutor, createOpenAIFunctionsAgent } from '@coinbase/agentkit';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { Tool } from '@coinbase/agentkit/tools';

@Injectable()
export class SaraAgent {
    private model: ChatOpenAI;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        // Initialize OpenAI model
        this.model = new ChatOpenAI({
            modelName: this.configService.get<string>('OPENAI_MODEL_NAME', 'gpt-4-turbo'),
            temperature: 0.7,
            openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
            streaming: true,
        });
    }

    /**
     * Creates an agent executor with specified tools
     */
    async createAgentExecutor(tools: Tool[], systemPrompt?: string) {
        // Define the default system prompt if not provided
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

        // Create the prompt template
        const prompt = PromptTemplate.fromTemplate(`
      ${systemPrompt || defaultSystemPrompt}
      
      Current conversation history:
      {chat_history}
      
      User preferences:
      {user_preferences}
      
      User: {input}
      
      AI:
    `);

        // Create the agent with Coinbase Agent Kit
        const agent = await createOpenAIFunctionsAgent({
            llm: this.model,
            tools,
            prompt,
        });

        // Create and return the executor
        return AgentExecutor.fromAgentAndTools({
            agent,
            tools,
            verbose: this.configService.get<string>('NODE_ENV') === 'development',
            maxIterations: 5,
        });
    }

    /**
     * Processes a user message and returns a streaming response
     */
    async processMessage(
        userId: string,
        sessionId: string,
        message: string,
        executor: AgentExecutor,
        chatHistory: string,
        userPreferences: string,
        handlers: any,
    ) {
        try {
            // Execute the agent
            const result = await executor.invoke(
                {
                    input: message,
                    chat_history: chatHistory,
                    user_preferences: userPreferences,
                },
                { callbacks: handlers }
            );

            // Save the conversation to the database
            await this.saveConversation(userId, sessionId, message, result.output);

            return result;
        } catch (error) {
            console.error('Error processing message:', error);
            throw error;
        }
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
                    userId_sessionId: {
                        userId,
                        sessionId,
                    },
                },
                update: {
                    lastUserMessage: userMessage,
                    lastAiMessage: aiMessage,
                    updatedAt: new Date(),
                },
                create: {
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
            // Don't throw here - we don't want to break the user experience
            // if saving fails
        }
    }
}