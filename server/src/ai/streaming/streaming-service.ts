// src/ai/streaming/streaming-service.ts
import { Injectable } from '@nestjs/common';
import { streamText } from 'ai';

@Injectable()
export class StreamingService {
    /**
     * Creates a streaming handler for AI responses
     */
    createStream() {
        const { textStream } = streamText({
            model: null, // This will be set by the agent
            messages: [],
        });

        return {
            stream: textStream,
            handlers: {
                onStart: () => { },
                onToken: () => { },
                onCompletion: () => { },
            }
        };
    }
}