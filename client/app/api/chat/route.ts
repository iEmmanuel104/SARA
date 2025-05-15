// client/app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { StreamingTextResponse } from 'ai';

export async function POST(req: NextRequest) {
    try {
        // Get authentication token
        const accessToken = cookies().get('access_token')?.value;

        if (!accessToken) {
            return new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Parse the request body
        const body = await req.json();
        const { messages } = body;
        const lastMessage = messages[messages.length - 1];

        // Forward the request to the backend
        const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        const response = await fetch(`${serverUrl}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                message: lastMessage.content,
                sessionId: body.sessionId || 'default',
            }),
        });

        // Return streaming response
        return new StreamingTextResponse(response.body);
    } catch (error) {
        console.error('Error in chat API route:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}