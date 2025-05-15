// client/app/api/chat/route.ts - API Route for Chat to proxy to the backend

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { StreamingTextResponse } from 'ai';

// This is the API route that the client will call using Vercel AI SDK
export async function POST(req: NextRequest) {
    try {
        // Get authentication token
        const token = cookies().get('token')?.value;

        if (!token) {
            // Redirect to login if not authenticated
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Parse the request body
        const body = await req.json();
        const { messages } = body;

        // Get the latest message
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage || lastMessage.role !== 'user') {
            return NextResponse.json(
                { error: 'Invalid message format' },
                { status: 400 }
            );
        }

        // Forward the request to the backend
        const serverUrl = process.env.API_URL || 'http://localhost:3001/api/v1';

        const response = await fetch(`${serverUrl}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                message: lastMessage.content,
                sessionId: body.sessionId || 'default',
            }),
        });

        // Handle errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || 'Failed to get response from AI' },
                { status: response.status }
            );
        }

        // Forward the streaming response
        return new StreamingTextResponse(response.body as ReadableStream);

    } catch (error) {
        console.error('Error in chat API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}