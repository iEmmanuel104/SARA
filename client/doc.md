# SARA Project Knowledge Base

## Project Overview

SARA (Shortlet Apartment Realtor Agent) is an AI-powered rental platform centered around a revolutionary conversational AI interface that transforms how users discover and book short-term accommodations. Unlike traditional rental platforms that rely on complex search filters and extensive browsing, SARA's intelligent chat interface acts as a personal rental agent, understanding users' needs through natural conversation and delivering highly personalized recommendations.

The platform leverages cutting-edge AI technology through Vercel AI SDK and Coinbase Agent Kit to create an intuitive, conversational experience that simplifies the entire rental process from discovery to booking.

## Core AI Chat Experience

The conversational AI interface is SARA's defining feature, serving as the primary interaction method throughout the platform:

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

## Client Application Structure

```
client/
├── app/                      # App Router pages
│   ├── (auth)/               # Authentication routes (grouped)
│   │   ├── signin/           # Sign in page
│   │   ├── signup/           # Sign up page
│   │   ├── wallet-connect/   # Crypto wallet connection
│   │   └── layout.tsx        # Auth layout
│   ├── (dashboard)/          # Dashboard routes (grouped)
│   │   ├── dashboard/        # Main dashboard
│   │   ├── bookings/         # User bookings
│   │   ├── saved/            # Saved properties
│   │   └── layout.tsx        # Dashboard layout
│   ├── chat/                 # AI chat interface
│   ├── properties/           # Property listings & details
│   │   ├── [id]/             # Property details page
│   │   │   ├── page.tsx      # Property details
│   │   │   ├── gallery/      # Photo gallery
│   │   │   ├── book/         # Booking page
│   │   │   └── reviews/      # Property reviews
│   │   └── page.tsx          # Properties listing
│   ├── search/               # Search functionality
│   ├── api/                  # API routes
│   │   ├── auth/             # Auth API endpoints
│   │   ├── chat/             # Chat API endpoints
│   │   ├── properties/       # Properties API endpoints
│   │   └── upload/           # Media upload endpoints
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage with featured AI chat
├── components/               # Reusable components
│   ├── ui/                   # Shadcn UI components
│   ├── forms/                # Form components
│   ├── property/             # Property-related components
│   ├── chat/                 # Chat-related components
│   │   ├── chat-interface.tsx    # Main chat UI component
│   │   ├── chat-bubble.tsx       # Individual message bubble
│   │   ├── chat-input.tsx        # Chat input with suggestions
│   │   ├── property-card.tsx     # Property card for recommendations
│   │   └── typing-indicator.tsx  # Animated typing indicator
│   ├── booking/              # Booking-related components
│   └── [feature]/            # Feature-specific components
├── hooks/                    # Custom React hooks
│   ├── use-auth.ts           # Authentication hook
│   ├── use-properties.ts     # Properties data hook
│   └── use-bookings.ts       # Bookings data hook
├── lib/                      # Utility functions
│   ├── utils.ts              # General utilities
│   ├── ai-parser.ts          # AI response parsing utilities
│   ├── api.ts                # API client
│   ├── cloudinary.ts         # Cloudinary integration
│   ├── memory-manager.ts     # Conversation memory management
│   └── tools/                # AI tool implementations
│       ├── property-search.ts    # Property search tool
│       ├── availability-check.ts # Availability checking tool
│       └── booking-creation.ts   # Booking creation tool
├── stores/                   # Zustand store definitions
│   ├── auth-store.ts         # Authentication state
│   ├── ui-store.ts           # UI state (modals, drawers, etc.)
│   ├── filters-store.ts      # Search filters state
│   └── chat-store.ts         # Chat-related state management
├── types/                    # TypeScript type definitions
├── public/                   # Static assets
└── styles/                   # Global styles
```

## AI Architecture

SARA's AI capabilities are built using a combination of Vercel AI SDK and Coinbase Agent Kit:

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
  
  // Set up the SARA agent with detailed prompt
  const prompt = PromptTemplate.fromTemplate(`
    You are SARA, an AI-powered Shortlet Apartment Realtor Agent.
    
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

## Key AI-Powered Experiences

### Conversational Property Search

SARA allows users to describe their ideal property in natural language:

- "I need a beachfront apartment for 4 people in Miami next month"
- "Looking for a pet-friendly cabin in the mountains with a hot tub"
- "Find me something walking distance to downtown with a kitchen under $150/night"

The AI parses these requests, extracts key parameters, and returns personalized recommendations with explanations of why each property matches the user's criteria.

### AI-Guided Booking Flow

The AI guides users through the entire booking process conversationally:

1. User expresses interest in a property
2. SARA checks availability for requested dates
3. AI suggests alternatives if unavailable
4. SARA helps with booking options and add-ons
5. AI assists with payment method selection
6. SARA confirms booking details and finalizes reservation

### Intelligent Recommendation System

SARA provides recommendations based on multiple factors:

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

## State Management Strategy

The application uses a dual state management approach:

1. **Zustand** for client-side state:
   - Authentication state (user, tokens)
   - UI state (modals, sidebars, active tabs)
   - User preferences and filters
   - Form state where needed

2. **React Query** for server state:
   - Data fetching, caching, and synchronization
   - Optimistic updates
   - Infinite loading
   - Mutation management

## Authentication System

SARA uses Privy for wallet-based authentication, allowing users to:

- Connect with cryptocurrency wallets (MetaMask, Coinbase Wallet, etc.)
- Sign in with traditional methods (email, social)
- Maintain a unified identity across wallet and email

The authentication flow includes:

1. User initiates sign-in with Privy
2. Privy handles the wallet connection or email verification
3. Backend verifies the Privy token and generates JWT tokens
4. Frontend stores tokens in Zustand and persists them securely

## Media Management

Cloudinary is used for all media management, offering:

- Image uploading and processing
- Automatic optimization and responsiveness
- Transformations (resizing, cropping, effects)
- CDN delivery for fast loading

The media workflow:

1. User selects images for upload
2. Frontend preprocesses images if needed
3. Images are uploaded directly to Cloudinary
4. Cloudinary URLs are stored in the database
5. Images are served optimized through Cloudinary's CDN

## Development Phases

The project is implemented in four phases:

1. **Phase 1: Foundation & Core Infrastructure**
   - Setup Next.js and NestJS projects
   - Implement basic authentication
   - Create database schema and Prisma models
   - Build core UI components
   - Basic chat UI implementation with streaming

2. **Phase 2: Property Management & Basic Search**
   - Implement property CRUD operations
   - Create search functionality
   - Develop host management features
   - Build media upload capabilities
   - Integrate chat with basic property search

3. **Phase 3: AI Integration & Personalization**
   - Enhance Vercel AI SDK integration
   - Implement full Coinbase Agent Kit tooling
   - Create recommendation engine
   - Develop personalization features
   - Memory management for conversation context

4. **Phase 4: Booking, Payments & User Experience**
   - Implement booking system through conversation
   - Create payment processing
   - Develop messaging system
   - Optimize user experience
   - Advanced AI capabilities with multi-modal features

## API Integration

The frontend communicates with the backend through a RESTful API. Key API areas include:

- Authentication (/api/auth/*)
- Property management (/api/properties/*)
- Bookings (/api/bookings/*)
- User profiles (/api/users/*)
- AI chat (/api/chat)
- Media upload (/api/upload)

## Key Pages & Features

### Authentication Pages

- **Sign In**: Email/password and social login options
- **Sign Up**: New user registration
- **Wallet Connect**: Crypto wallet authentication
- **Account Recovery**: Password reset and account recovery

### Property Exploration

- **Property Listing**: Browse available properties with filters
- **Property Details**: Comprehensive information about a property
- **Property Gallery**: Images and virtual tours
- **Map View**: Location-based property discovery

### AI Chat Interface

- **Chat Dashboard**: Main conversation interface with SARA
- **Property Search**: Natural language property search
- **Recommendations**: Personalized property suggestions
- **Booking Assistance**: Help with the booking process

### Booking System

- **Booking Request**: Initiate a booking for a property
- **Booking Confirmation**: Review and confirm booking details
- **Booking Management**: View and manage existing bookings
- **Payment Processing**: Handle payment for bookings

### Host Dashboard

- **Property Management**: Add, edit, and manage properties
- **Booking Calendar**: Manage property availability
- **Host Settings**: Configure host profile and preferences
- **Analytics**: View performance metrics for properties

## Component Architecture

Components follow a hierarchical structure:

1. **Layout Components**: Define the overall page structure
   - RootLayout with persistent chat button
   - AuthLayout
   - DashboardLayout

2. **Page Components**: Implement specific pages
   - HomePage with featured AI chat
   - PropertyListingPage
   - PropertyDetailPage
   - ChatPage

3. **Feature Components**: Implement specific features
   - PropertySearch
   - BookingForm
   - ChatInterface
   - PaymentProcessor

4. **UI Components**: Reusable interface elements
   - Button
   - Card
   - Input
   - Modal

## Implementation Guidelines

### Styling Approach

- Use Tailwind CSS for all styling
- Implement Shadcn UI components for consistent design
- Use CSS variables for theming
- Apply responsive design principles throughout

### Performance Optimization

- Implement code splitting and lazy loading
- Optimize images with Cloudinary
- Use React Query for efficient data fetching
- Apply memoization where appropriate

### Accessibility

- Follow WCAG 2.1 guidelines
- Implement proper semantic HTML
- Ensure keyboard navigation works correctly
- Provide appropriate ARIA attributes

### Testing Strategy

- Unit testing with Jest and React Testing Library
- Component testing with Storybook
- Integration testing with Cypress
- E2E testing for critical flows

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Access the application at http://localhost:3000

## Conclusion

The SARA project combines cutting-edge technologies to create a next-generation short-term rental platform. By placing the AI chat experience at the center of the user journey, SARA reimagines how users discover and book accommodations. The conversational interface powered by Vercel AI SDK and Coinbase Agent Kit provides a more intuitive, personalized experience compared to traditional search interfaces.

This knowledge base serves as a comprehensive guide for understanding the project architecture, implementation approach, and development workflow, with special emphasis on the AI-first design that makes SARA truly innovative in the rental marketplace.