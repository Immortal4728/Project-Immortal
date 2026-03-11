import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/admin');
    const isPageRoute = request.nextUrl.pathname.startsWith('/admin') && !isApiRoute;

    // --- Employee Routes ---
    const isEmployeeRoute = request.nextUrl.pathname.startsWith('/employee');
    const isEmployeeApiRoute = request.nextUrl.pathname.startsWith('/api/employee');

    if (isEmployeeRoute || isEmployeeApiRoute) {
        // Exclude login paths from protection
        if (request.nextUrl.pathname === '/employee/login' || request.nextUrl.pathname === '/api/employee/login') {
            return NextResponse.next();
        }

        const employeeToken = request.cookies.get('employee_session')?.value;

        if (!employeeToken) {
            if (isEmployeeApiRoute) {
                return NextResponse.json({ success: false, error: 'Unauthorized: Missing employee session' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/employee/login', request.url));
        }

        // Token exists. Further validation (e.g. database lookup) can happen at the API layer 
        //, but its presence allows them past the middleware.
        return NextResponse.next();
    }

    // 1. Get the token from either the Authorization header or the cookies
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('token')?.value;

    let token = cookieToken;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (isApiRoute || isPageRoute) {
        if (!token) {
            if (isApiRoute) {
                return NextResponse.json({ success: false, error: 'Unauthorized: Missing token' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // 2. Verify the Firebase ID token cryptographically using the core Identity Toolkit API
        // This validates the token string is not expired and is authentically minted by Firebase
        try {
            const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
            if (!firebaseApiKey) {
                console.error("NEXT_PUBLIC_FIREBASE_API_KEY is not set");
                return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
            }

            const verifyTokenResponse = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken: token })
                }
            );

            const decodedTokenData = await verifyTokenResponse.json();

            // 3. Reject invalid tokens
            if (!verifyTokenResponse.ok || decodedTokenData.error || !decodedTokenData.users || decodedTokenData.users.length === 0) {
                if (isApiRoute) {
                    return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
                }
                // If it's a page and token is bad, delete the stale cookie and redirect
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('token');
                return response;
            }

            // 4. Admin Email Whitelist Check
            const userEmail = decodedTokenData.users[0]?.email;

            const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);

            if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
                if (isApiRoute) {
                    return NextResponse.json({ success: false, error: 'Forbidden: User is not an admin' }, { status: 403 });
                }
                // If unauthorized user tries to access a page, redirect and clear their cookies
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('token');
                return response;
            }
        } catch (error) {
            console.error("Middleware token verification error:", error);
            if (isApiRoute) {
                return NextResponse.json({ success: false, error: 'Unauthorized: Token validation failed' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Continue to the requested route
    return NextResponse.next();
}

// Configuration to precisely match ONLY admin UI and API routes
export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/employee/:path*', '/api/employee/:path*'],
};
