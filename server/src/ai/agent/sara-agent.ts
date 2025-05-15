// src/ai/agent/sara-agent.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { Tool } from '@langchain/core/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';

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

        // Store buffered conversation history in memory
        const memory = new MemorySaver();
        const agentConfig = { configurable: { thread_id: "SARA Agent Chat" } };

        // Create React Agent using the LLM and tools
        const agent = createReactAgent({
            llm: this.model,
            tools,
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
            // Execute the agent
            const stream = await agent.stream(
                {
                    messages: [{ role: "user", content: message }],
                    chat_history: chatHistory,
                    user_preferences: userPreferences,
                },
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