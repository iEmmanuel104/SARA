import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that should be accessible without authentication
const publicPaths = ['/', '/login', '/signup', '/chat', '/explore', '/about', '/dashboard', '/privacy-policy', '/terms-of-service'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is public
    const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith('/api/'));

    // Get the token from cookies
    const token = request.cookies.get('access_token')?.value;

    // If the path is not public and there's no token, redirect to home
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If the path is public and there's a token, allow access
    if (isPublicPath) {
        return NextResponse.next();
    }

    // For protected routes, verify the token
    if (token) {
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
}; 