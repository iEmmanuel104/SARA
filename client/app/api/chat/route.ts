import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "edge"

// Sample property data
const properties = [
    {
        id: "1",
        title: "Modern Loft in Downtown",
        location: "New York",
        price: "$250",
        description: "Beautiful modern loft with city views, perfect for a weekend getaway.",
        image: "/modern-loft-apartment.png",
        beds: 2,
        baths: 2,
        guests: 4,
        type: "Apartment",
    },
    {
        id: "2",
        title: "Beachfront Villa",
        location: "Miami",
        price: "$350",
        description: "Stunning beachfront villa with private access to the beach.",
        image: "/beachfront-villa.png",
        beds: 3,
        baths: 2,
        guests: 6,
        type: "Villa",
    },
    {
        id: "3",
        title: "Cozy Studio",
        location: "San Francisco",
        price: "$150",
        description: "Charming studio in the heart of the city, close to all attractions.",
        image: "/cozy-studio-apartment.png",
        beds: 1,
        baths: 1,
        guests: 2,
        type: "Studio",
    },
    {
        id: "4",
        title: "Luxury Apartment",
        location: "Los Angeles",
        price: "$200",
        description: "Modern luxury apartment with pool and gym access.",
        image: "/luxury-apartment-interior.png",
        beds: 2,
        baths: 2,
        guests: 4,
        type: "Apartment",
    },
    {
        id: "5",
        title: "Downtown Condo",
        location: "Chicago",
        price: "$180",
        description: "Stylish condo in downtown with amazing city views.",
        image: "/downtown-condo.png",
        beds: 1,
        baths: 1,
        guests: 3,
        type: "Condo",
    },
    {
        id: "6",
        title: "Charming House",
        location: "Austin",
        price: "$220",
        description: "Charming house with a garden, perfect for families.",
        image: "/charming-house.png",
        beds: 3,
        baths: 2,
        guests: 6,
        type: "House",
    },
]

export async function POST(req: Request) {
    const { messages } = await req.json()

    // Get the last user message
    const lastMessage = messages[messages.length - 1]

    // Create a system prompt that explains the assistant's role
    const systemPrompt = `
    You are SARA (Shortlet Apartment Realtor Agent), an AI assistant for Dwellr.xyz.
    Your primary goal is to help users find the perfect short-term rental property.
    
    Be conversational, friendly, and helpful. Ask clarifying questions to understand the user's needs.
    
    When users describe what they're looking for, extract key details like:
    - Location preferences
    - Budget constraints
    - Number of guests
    - Desired amenities
    - Length of stay
    - Special requirements
    
    When recommending properties, format them like this:
    PROPERTY: {
      "title": "Property Name",
      "location": "City, State",
      "price": "$X per night",
      "description": "Brief description",
      "image": "image-url",
      "id": "property-id",
      "beds": number,
      "baths": number,
      "guests": number,
      "type": "Property Type"
    }
    
    When confirming a booking, format it like this:
    BOOKING_CONFIRMATION: {
      "propertyId": "property-id",
      "checkIn": "YYYY-MM-DD",
      "checkOut": "YYYY-MM-DD",
      "guests": number,
      "totalPrice": "$X",
      "bookingId": "booking-id"
    }
    
    Current available properties:
    ${JSON.stringify(properties, null, 2)}
    
    Remember to recommend properties that match the user's criteria. If there are no exact matches, suggest the closest options.
  `

    // Create a formatted prompt with conversation history
    const formattedPreviousMessages = messages
        .slice(0, -1)
        .map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n")

    const prompt = `
    ${formattedPreviousMessages ? `Conversation history:\n${formattedPreviousMessages}\n\n` : ""}
    User: ${lastMessage.content}
    
    Assistant:
  `

    // Use streamText from Vercel AI SDK to generate a streaming response
    const result = streamText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt,
    })

    // Return a StreamingTextResponse, which is a ReadableStream
    return result.toDataStreamResponse()
}
