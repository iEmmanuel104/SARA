# DWELLR Backend

DWELLR (Shortlet Apartment Realtor Agent) is an AI-powered rental platform that transforms the shortlet accommodation search experience by providing an intelligent conversational interface, personalized recommendations, and end-to-end booking capabilities.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Validation**: class-validator + class-transformer

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL (v14 or later)
- pnpm (recommended) or npm

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-username/dwellr.git
cd dwellr/server
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

4. Set up the database:
```bash
pnpm prisma migrate dev
```

5. Start the development server:
```bash
pnpm start:dev
```

The server will be running at `http://localhost:3000`.

## API Documentation

Once the server is running, you can access the Swagger documentation at `http://localhost:3000/docs`.

## Project Structure

```
src/
├── auth/                 # Authentication module
├── users/               # User management module
├── properties/          # Property management module
├── bookings/           # Booking management module
├── ai/                 # AI integration module
├── prisma/             # Database configuration
└── common/             # Shared utilities and types
```

## Development

### Database Migrations

To create a new migration:
```bash
pnpm prisma migrate dev --name your_migration_name
```

To apply migrations:
```bash
pnpm prisma migrate deploy
```

### Testing

Run unit tests:
```bash
pnpm test
```

Run e2e tests:
```bash
pnpm test:e2e
```

### Code Style

Format code:
```bash
pnpm format
```

Lint code:
```bash
pnpm lint
```

## Deployment

1. Build the application:
```bash
pnpm build
```

2. Start in production mode:
```bash
pnpm start:prod
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRATION`: JWT token expiration time
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Allowed CORS origin

Optional environment variables:

- `REDIS_URL`: Redis connection string (for caching)
- `ELASTICSEARCH_NODE`: Elasticsearch connection URL
- `PINECONE_API_KEY`: Pinecone API key for vector search
- `OPENAI_API_KEY`: OpenAI API key for AI features

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
