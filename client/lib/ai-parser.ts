// Helper function to parse AI responses
export function parseAIResponse(content: string) {
    // Check if the message contains a property recommendation
    if (content.includes("PROPERTY:")) {
        const parts = content.split("PROPERTY:")
        const textContent = parts[0]

        try {
            // Extract the JSON property data
            const propertyMatch = parts[1].match(/{[\s\S]*?}/)
            const propertyData = propertyMatch ? JSON.parse(propertyMatch[0]) : null

            return {
                type: "property",
                text: textContent,
                property: propertyData,
                remainingText: parts[1].replace(propertyMatch?.[0] || "", ""),
            }
        } catch (e) {
            // If parsing fails, just return the original content
            return { type: "text", text: content }
        }
    }

    // Check if the message contains a booking confirmation
    if (content.includes("BOOKING_CONFIRMATION:")) {
        const parts = content.split("BOOKING_CONFIRMATION:")
        const textContent = parts[0]

        try {
            // Extract the JSON booking data
            const bookingMatch = parts[1].match(/{[\s\S]*?}/)
            const bookingData = bookingMatch ? JSON.parse(bookingMatch[0]) : null

            return {
                type: "booking",
                text: textContent,
                booking: bookingData,
                remainingText: parts[1].replace(bookingMatch?.[0] || "", ""),
            }
        } catch (e) {
            return { type: "text", text: content }
        }
    }

    // Default to text type
    return { type: "text", text: content }
}
