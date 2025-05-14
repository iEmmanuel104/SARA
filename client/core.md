# DWELLR Project Knowledge Base

## Project Overview

DWELLR (Shortlet Apartment Realtor Agent) is an AI-powered rental platform centered around a revolutionary conversational AI interface that transforms how users discover and book short-term accommodations. Unlike traditional rental platforms that rely on complex search filters and extensive browsing, DWELLR's intelligent chat interface acts as a personal rental agent, understanding users' needs through natural conversation and delivering highly personalized recommendations.

The platform leverages cutting-edge AI technology through Vercel AI SDK and Coinbase Agent Kit to create an intuitive, conversational experience that simplifies the entire rental process from discovery to booking.

## Core AI Chat Experience

The conversational AI interface is DWELLR's defining feature, serving as the primary interaction method throughout the platform:

- **Natural Language Search**: Users describe their ideal accommodation in plain language rather than adjusting filters
- **Contextual Understanding**: The AI remembers preferences and previous interactions
- **Personalized Recommendations**: Properties are suggested based on stated and inferred preferences
- **Seamless Booking Assistance**: The AI guides users through the entire booking process
- **Real-time Streaming Responses**: Vercel AI SDK enables fluid, human-like conversation with immediate feedback

The AI chat interface is prominently featured throughout the application, including:
- Embedded on the homepage for instant engagement
- Available via a persistent chat button across all pages
- As a dedicated full-screen chat experience

## Technology Stack

### AI Technologies

- **Vercel AI SDK**: Powers the streaming chat interface with real-time LLM responses
  - Enables responsive, typewriter-style message rendering
  - Manages message state and history
  - Handles streaming connection management
  - Provides optimized React hooks for UI integration

- **Coinbase Agent Kit**: Orchestrates the AI agent system
  - Implements tool-calling capabilities for property search and booking
  - Manages conversation context and memory
  - Enables structured reasoning for complex tasks
  - Coordinates between multiple specialized sub-agents

### Frontend Technologies

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5+ with strict type checking
- **Styling**: Tailwind CSS + Shadcn UI component library
- **Animation**: Framer Motion
- **State Management**:
  - Zustand for client-state management
  - React Query for server state and data fetching
- **Authentication**: Privy for wallet-based authentication
- **Media Management**: Cloudinary for image storage and optimization

### Backend Technologies

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Search**: Elasticsearch
- **Vector Database**: Pinecone or Postgres pgvector
- **Cache**: Redis
- **Message Broker**: RabbitMQ (optional for Phase 1)

## AI Architecture

DWELLR's conversational AI system is built with a sophisticated architecture using Vercel AI SDK for the frontend experience and Coinbase Agent Kit for backend orchestration:

### Vercel AI SDK Implementation

The Vercel AI SDK provides the core streaming chat experience:

```typescript
// app/chat/page.tsx (core chat implementation)
'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ChatMessage } from '@/components/chat/chat-message';
import { PropertyRecommendation } from '@/components/chat/property-recommendation';
import { parseAIResponse } from '@/lib/ai-parser';

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Vercel AI SDK hook for managing chat state and streaming
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    // Enable streaming for real-time responses
    onFinish: (message) => {
      // Process final message for side effects
      if (message.content.includes('BOOKING_INITIATED:')) {
        // Handle booking initiation
      }
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat messages area with smooth animations */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const parsedContent = parseAIResponse(message.content);
          
          // Check if message contains property recommendations
          if (parsedContent.type === 'property') {
            return (
              <ChatMessage key={message.id} role={message.role}>
                <div>{parsedContent.text}</div>
                <PropertyRecommendation property={parsedContent.property} />
              </ChatMessage>
            );
          }
          
          return (
            <ChatMessage key={message.id} role={message.role}>
              {message.content}
            </ChatMessage>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Describe your ideal stay..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Thinking...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

### Coinbase Agent Kit Backend

The AI agent system is implemented with Coinbase Agent Kit:

```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'coinbase-agent-kit';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StreamingTextResponse } from 'ai';
import { getMemoryManager } from '@/lib/memory';
import { createTools } from '@/lib/tools';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const userMessage = messages[messages.length - 1].content;
  
  // Set up the AI model with streaming capabilities
  const model = new ChatOpenAI({
    modelName: "gpt-4-turbo",
    temperature: 0.7,
    streaming: true,
  });
  
  // Create specialized tools for property search and booking
  const tools = createTools({
    propertySearch: true,
    availabilityCheck: true,
    bookingCreation: true,
    locationInfo: true,
  });
  
  // Set up the DWELLR agent with detailed prompt
  const prompt = PromptTemplate.fromTemplate(`
    You are DWELLR, an AI-powered Shortlet Apartment Realtor Agent.
    
    Your primary goal is to help users find the perfect short-term accommodation
    through friendly, conversational interaction. Ask clarifying questions to
    understand their needs, and provide personalized recommendations.
    
    Current conversation:
    {chat_history}
    
    User preferences:
    {user_preferences}
    
    User: {input}
    
    AI:
  `);
  
  // Create the agent with Coinbase Agent Kit
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  });
  
  const executor = AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    verbose: true,
    maxIterations: 5,
  });
  
  // Handle memory and context
  const memoryManager = await getMemoryManager();
  const chatHistory = await memoryManager.getConversationString();
  const userPreferences = await memoryManager.getUserPreferences();
  
  // Process the message with streaming
  const stream = await executor.stream({
    input: userMessage,
    chat_history: chatHistory,
    user_preferences: JSON.stringify(userPreferences),
  });
  
  // Save message to history (don't await to avoid blocking)
  memoryManager.saveMessage('user', userMessage);
  
  // Return streaming response to client
  return new StreamingTextResponse(stream);
}
```

## Client Application Structure

```
client/
├── app/                      # App Router pages
│   ├── page.tsx              # Homepage with featured AI chat
│   ├── chat/                 # Dedicated AI chat experience
│   ├── properties/           # Property listings & details
│   ├── api/                  # API routes including AI endpoints
│   └── layout.tsx            # Root layout with persistent chat button
├── components/               # Reusable components
│   ├── ui/                   # Shadcn UI components
│   ├── chat/                 # Chat-specific components
│   │   ├── chat-interface.tsx    # Main chat UI component
│   │   ├── chat-bubble.tsx       # Individual message bubble
│   │   ├── chat-input.tsx        # Chat input with suggestions
│   │   ├── property-card.tsx     # Property card for recommendations
│   │   └── typing-indicator.tsx  # Animated typing indicator
├── lib/                      # Utility functions
│   ├── ai-parser.ts          # AI response parsing utilities
│   ├── memory-manager.ts     # Conversation memory management
│   └── tools/                # AI tool implementations
│       ├── property-search.ts    # Property search tool
│       ├── availability-check.ts # Availability checking tool
│       └── booking-creation.ts   # Booking creation tool
└── stores/                   # Zustand state management
    └── chat-store.ts         # Chat-related state management
```

## Key AI-Powered Experiences

### Conversational Property Search

DWELLR allows users to describe their ideal property in natural language:

- "I need a beachfront apartment for 4 people in Miami next month"
- "Looking for a pet-friendly cabin in the mountains with a hot tub"
- "Find me something walking distance to downtown with a kitchen under $150/night"

The AI parses these requests, extracts key parameters, and returns personalized recommendations with explanations of why each property matches the user's criteria.

### AI-Guided Booking Flow

The AI guides users through the entire booking process conversationally:

1. User expresses interest in a property
2. DWELLR checks availability for requested dates
3. AI suggests alternatives if unavailable
4. DWELLR helps with booking options and add-ons
5. AI assists with payment method selection
6. DWELLR confirms booking details and finalizes reservation

### Intelligent Recommendation System

DWELLR provides recommendations based on multiple factors:

- Explicit user preferences stated in conversation
- Implicit preferences derived from behavior
- Seasonal relevance and availability
- Similar properties to those the user has shown interest in
- Unique features that match user's travel style

### Persistent Context Memory

The AI maintains conversation context across sessions:

- Remembers user preferences over time
- Recalls previous stays and feedback
- Updates recommendations based on changing preferences
- Maintains conversation history for contextual understanding

## UI Implementation

### Chat Component Architecture

The chat interface follows a component-based architecture:

1. **ChatContainer**: The main container managing layout and scroll behavior
2. **ChatMessage**: Renders individual messages with proper styling
3. **ChatInput**: Handles user input with suggestions and auto-complete
4. **TypingIndicator**: Shows when the AI is generating a response
5. **PropertyRecommendation**: Displays property recommendations in chat

### Streaming Response Implementation

The streaming response creates a more engaging, human-like experience:

```typescript
// components/chat/chat-interface.tsx
export function ChatInterface() {
  // Vercel AI SDK integration
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    // Enable message streaming
    onStartStreaming: () => {
      setIsAiTyping(true);
    },
    onFinishStreaming: () => {
      setIsAiTyping(false);
    },
  });
  
  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Show typing indicator during streaming */}
        {isLoading && (
          <div className="ai-message-container">
            <TypingIndicator />
          </div>
        )}
      </div>
      
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isDisabled={isLoading}
      />
    </div>
  );
}
```

### Mobile-Optimized Experience

The chat interface is optimized for mobile devices:

- Full-screen chat mode on smaller devices
- Touch-friendly interface with larger tap targets
- Persistent chat button accessible from any page
- Keyboard-aware input that adjusts for mobile keyboards

## Development Phases

The AI chat feature is developed across all project phases:

1. **Phase 1: Foundation**
   - Basic chat UI implementation
   - Simple prompt-based responses
   - Core message streaming capabilities

2. **Phase 2: Enhanced Search**
   - Integration with property search
   - Basic recommendation capabilities
   - Simple preference tracking

3. **Phase 3: Advanced AI**
   - Full Coinbase Agent Kit implementation
   - Tool-based interaction for complex tasks
   - Memory management for conversation context
   - Personalization engine integration

4. **Phase 4: Complete Experience**
   - End-to-end booking through conversation
   - Payment processing via chat
   - Advanced personalization and learning
   - Multi-modal capabilities (image recognition, etc.)

## Conclusion

DWELLR's AI chat interface powered by Vercel AI SDK and Coinbase Agent Kit represents the core innovation of the platform. By focusing on a conversational, agent-based approach rather than traditional search filters, DWELLR delivers a more intuitive, personalized experience that helps users find their ideal accommodations with minimal effort.

This natural language interface acts as both the entry point to the platform and a persistent helper throughout the user journey, transforming the entire short-term rental experience from search to stay.