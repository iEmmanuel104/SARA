import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface AIAgentConfig {
    apiKey: string;
    model: string;
    baseUrl?: string;
}

@Injectable()
export class AIAgent {
    private readonly openai: OpenAI;

    constructor(config: AIAgentConfig) {
        this.openai = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl
        });
    }

    async analyzeSentiment(text: string) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Analyze the sentiment of the following text and respond with only one word: positive, neutral, or negative.'
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.3
        });

        return {
            sentiment: response.choices[0].message.content.toLowerCase() as 'positive' | 'neutral' | 'negative'
        };
    }

    async generateInsights(prompt: string) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert property analyst. Provide detailed insights about the property based on the data provided.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        });

        return {
            content: response.choices[0].message.content
        };
    }

    async generateRecommendation(prompt: string) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert in property pricing and market analysis. Provide detailed pricing recommendations based on the data provided.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.5
        });

        return {
            content: response.choices[0].message.content
        };
    }

    async generateTips(prompt: string) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert property host advisor. Provide personalized hosting tips based on the host profile and property data.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        });

        return {
            content: response.choices[0].message.content
        };
    }

    async generateSuggestions(prompt: string) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert in property improvement and guest experience optimization. Provide detailed suggestions for improving the property based on the data provided.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        });

        return {
            content: response.choices[0].message.content
        };
    }

    async processMessage(options: {
        userId: string;
        message: string;
        systemMessage: string;
        context?: any;
        conversationHistory?: any[];
    }) {
        const messages = [
            { role: 'system', content: options.systemMessage },
            ...(options.conversationHistory || []).map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: options.message }
        ];

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages,
            temperature: 0.7
        });

        return {
            content: response.choices[0].message.content
        };
    }

    async analyzeImage(imageUrl: string) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [
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
            ],
            max_tokens: 500
        });

        return {
            analysis: response.choices[0].message.content
        };
    }

    async generatePropertyInsights(data: {
        property: any;
        imageAnalyses: any[];
        reviews: any[];
        bookings: any[];
    }) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert property analyst. Provide comprehensive insights about the property based on the provided data.'
                },
                {
                    role: 'user',
                    content: JSON.stringify(data)
                }
            ],
            temperature: 0.7
        });

        return {
            insights: response.choices[0].message.content,
            imageAnalyses: data.imageAnalyses
        };
    }

    async generateRecommendations(data: {
        userId: string;
        searchCriteria: any;
    }) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert in property recommendations. Analyze the search criteria and provide personalized property recommendations.'
                },
                {
                    role: 'user',
                    content: JSON.stringify(data)
                }
            ],
            temperature: 0.7
        });

        return {
            recommendations: response.choices[0].message.content
        };
    }
} 