// src/ai/memory/memory-manager.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MemoryManager {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    /**
     * Retrieves the conversation history as a string format suitable for LLM context
     */
    async getConversationString(userId: string, sessionId: string): Promise<string> {
        try {
            // Get the conversation and messages
            const conversation = await this.prisma.aiConversation.findUnique({
                where: {
                    userId_sessionId: {
                        userId,
                        sessionId,
                    },
                },
                include: {
                    messages: {
                        orderBy: {
                            createdAt: 'asc',
                        },
                        take: 20, // Limit to most recent messages to avoid context limits
                    },
                },
            });

            if (!conversation) {
                return '';
            }

            // Format the messages as a string
            const historyString = conversation.messages
                .map(msg => `${msg.messageRole === 'user' ? 'User' : 'AI'}: ${msg.messageText}`)
                .join('\n\n');

            return historyString;
        } catch (error) {
            console.error('Error retrieving conversation history:', error);
            return '';
        }
    }

    /**
     * Gets user preferences formatted for the AI context
     */
    async getUserPreferences(userId: string): Promise<string> {
        try {
            // Get the user preferences
            const preferences = await this.prisma.userPreference.findMany({
                where: { userId },
                select: {
                    preferenceType: true,
                    preferenceValue: true,
                    preferenceWeight: true,
                },
            });

            if (!preferences || preferences.length === 0) {
                return 'No specific preferences found for this user.';
            }

            // Format the preferences
            const formattedPreferences = preferences.map(pref => {
                return `${pref.preferenceType}: ${JSON.stringify(pref.preferenceValue)} (importance: ${pref.preferenceWeight}/10)`;
            }).join('\n');

            return formattedPreferences;
        } catch (error) {
            console.error('Error retrieving user preferences:', error);
            return 'Unable to retrieve user preferences.';
        }
    }

    /**
     * Saves a message to the conversation history
     */
    async saveMessage(
        userId: string,
        sessionId: string,
        role: 'user' | 'ai',
        content: string,
        metadata: any = {}
    ): Promise<void> {
        try {
            // First, ensure the conversation exists
            const conversation = await this.prisma.aiConversation.upsert({
                where: {
                    userId_sessionId: {
                        userId,
                        sessionId,
                    },
                },
                update: {
                    lastActivityAt: new Date(),
                    ...(role === 'user' ? { lastUserMessage: content } : {}),
                    ...(role === 'ai' ? { lastAiMessage: content } : {}),
                },
                create: {
                    userId,
                    sessionId,
                    conversationState: {},
                    extractedPreferences: {},
                    lastUserMessage: role === 'user' ? content : '',
                    lastAiMessage: role === 'ai' ? content : '',
                },
            });

            // Then add the message
            await this.prisma.aiMessage.create({
                data: {
                    conversationId: conversation.id,
                    messageRole: role,
                    messageText: content,
                    entities: metadata.entities || {},
                    intent: metadata.intent || null,
                    sentimentScore: metadata.sentiment || null,
                },
            });
        } catch (error) {
            console.error('Error saving message:', error);
            // Not throwing to avoid breaking the user experience
        }
    }

    /**
     * Updates the extracted preferences from the conversation
     */
    async updateExtractedPreferences(
        userId: string,
        sessionId: string,
        preferences: any
    ): Promise<void> {
        try {
            await this.prisma.aiConversation.update({
                where: {
                    userId_sessionId: {
                        userId,
                        sessionId,
                    },
                },
                data: {
                    extractedPreferences: preferences,
                    updatedAt: new Date(),
                },
            });
        } catch (error) {
            console.error('Error updating extracted preferences:', error);
            // Not throwing to avoid breaking the user experience
        }
    }

    /**
     * Gets the current extracted preferences
     */
    async getExtractedPreferences(userId: string, sessionId: string): Promise<any> {
        try {
            const conversation = await this.prisma.aiConversation.findUnique({
                where: {
                    userId_sessionId: {
                        userId,
                        sessionId,
                    },
                },
                select: {
                    extractedPreferences: true,
                },
            });

            return conversation?.extractedPreferences || {};
        } catch (error) {
            console.error('Error getting extracted preferences:', error);
            return {};
        }
    }

    /**
     * Updates the conversation state
     */
    async updateConversationState(
        userId: string,
        sessionId: string,
        state: any
    ): Promise<void> {
        try {
            await this.prisma.aiConversation.update({
                where: {
                    userId_sessionId: {
                        userId,
                        sessionId,
                    },
                },
                data: {
                    conversationState: state,
                    updatedAt: new Date(),
                },
            });
        } catch (error) {
            console.error('Error updating conversation state:', error);
            // Not throwing to avoid breaking the user experience
        }
    }

    /**
     * Gets the current conversation state
     */
    async getConversationState(userId: string, sessionId: string): Promise<any> {
        try {
            const conversation = await this.prisma.aiConversation.findUnique({
                where: {
                    userId_sessionId: {
                        userId,
                        sessionId,
                    },
                },
                select: {
                    conversationState: true,
                },
            });

            return conversation?.conversationState || {};
        } catch (error) {
            console.error('Error getting conversation state:', error);
            return {};
        }
    }
}