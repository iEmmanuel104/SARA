// src/ai/streaming/streaming-service.ts
import { Injectable } from '@nestjs/common';
import { LangChainStream } from 'ai';

@Injectable()
export class StreamingService {
    /**
     * Creates a streaming handler for AI responses
     */
    createStream() {
        return LangChainStream();
    }
}