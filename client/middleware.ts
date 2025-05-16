import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that should be accessible without authentication
const publicPaths = ['/', '/signin', '/signup', '/about', '/contact', '/dashboard', '/explore', '/chat'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is public
    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    // Check for access token in cookies
    const accessToken = request.cookies.get('access_token');

    // If no access token and trying to access protected route, redirect to login
    if (!accessToken && !publicPaths.includes(pathname)) {
        const url = new URL('/', request.url);
        // url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}; 