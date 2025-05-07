# SARA Project Knowledge Base

## Project Overview

SARA (Shortlet Apartment Realtor Agent) is an AI-powered rental platform that revolutionizes the shortlet accommodation search experience through a conversational interface and personalized recommendations. The platform combines AI technology with a comprehensive property management system to deliver an intuitive, user-friendly experience for finding and booking short-term accommodations.

The application follows a client-server architecture, with a Next.js frontend and NestJS backend, leveraging advanced AI capabilities through Vercel AI SDK and Coinbase Agent Kit.

## Key Features

- AI-powered conversational interface for property search
- Personalized property recommendations
- Comprehensive property listing and management
- Crypto wallet authentication with Privy
- Integrated booking and payment system
- Real-time messaging between guests and hosts
- Rich media management with Cloudinary

## Technology Stack

### Frontend Technologies

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5+ with strict type checking
- **Styling**: Tailwind CSS + Shadcn UI component library
- **Animation**: Framer Motion
- **State Management**:
  - Zustand for client-state management
  - React Query for server state and data fetching
- **AI Integration**:
  - Vercel AI SDK for streaming responses
  - Coinbase Agent Kit for AI agent implementation
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
│   └── page.tsx              # Homepage
├── components/               # Reusable components
│   ├── ui/                   # Shadcn UI components
│   ├── forms/                # Form components
│   ├── property/             # Property-related components
│   ├── chat/                 # Chat-related components
│   ├── booking/              # Booking-related components
│   └── [feature]/            # Feature-specific components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions
├── stores/                   # Zustand store definitions
├── types/                    # TypeScript type definitions
└── public/                   # Static assets
```

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

## AI Architecture

SARA's AI capabilities are built using a combination of Vercel AI SDK and Coinbase Agent Kit:

1. **Vercel AI SDK**:
   - Provides streaming UI capabilities
   - Handles token streaming from LLMs
   - Manages chat state and history
   - Offers React hooks for easy integration

2. **Coinbase Agent Kit**:
   - Implements tool-based AI agents
   - Orchestrates complex task flows
   - Manages context and state
   - Provides structured output capabilities

The AI system is structured around specialized agents:

- **SearchAgent**: Handles property discovery and filtering
- **BookingAgent**: Manages the booking process
- **SupportAgent**: Provides assistance and answers questions

Each agent has access to tools like:
- PropertySearchTool
- AvailabilityCheckTool
- PriceEstimatorTool
- RecommendationEngine

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

2. **Phase 2: Property Management & Basic Search**
   - Implement property CRUD operations
   - Create search functionality
   - Develop host management features
   - Build media upload capabilities

3. **Phase 3: AI Integration & Personalization**
   - Integrate Vercel AI SDK
   - Implement Coinbase Agent Kit
   - Create recommendation engine
   - Develop personalization features

4. **Phase 4: Booking, Payments & User Experience**
   - Implement booking system
   - Create payment processing
   - Develop messaging system
   - Optimize user experience

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
   - RootLayout
   - AuthLayout
   - DashboardLayout

2. **Page Components**: Implement specific pages
   - HomePage
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

The SARA project combines cutting-edge technologies to create a next-generation short-term rental platform. By leveraging AI, crypto authentication, and modern web development practices, SARA offers an unparalleled user experience for both guests and hosts.

This knowledge base serves as a comprehensive guide for understanding the project architecture, implementation approach, and development workflow.