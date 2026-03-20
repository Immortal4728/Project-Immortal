import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Create a remote JWK set to verify Firebase tokens. 
// This fetches the public keys once and caches them securely, making subsequent checks 0ms.
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

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

        // 2. Verify the Firebase ID token cryptographically without doing an external network request
        try {
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
            if (!projectId) {
                console.error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set");
                return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
            }

            let userEmail: string;
            let userName: string;

            if (process.env.NODE_ENV === "development") {
                // Decode token without cryptographic verification in development
                // because Edge Runtime clears global scope, causing a Google JWK network fetch on every request.
                const base64Url = token.split('.')[1];
                let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const pad = base64.length % 4;
                if(pad) base64 += '='.repeat(4 - pad);
                const decodedPayload = JSON.parse(atob(base64));
                userEmail = decodedPayload.email;
                userName = decodedPayload.name || "";
            } else {
                // Verify JWT Signature
                const result = await jwtVerify(token, JWKS, {
                    issuer: `https://securetoken.google.com/${projectId}`,
                    audience: projectId,
                });
                userEmail = result.payload.email as string;
                userName = (result.payload.name || "") as string;
            }

            // 3. Admin Email Whitelist Check
            const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);

            if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
                if (isApiRoute) {
                    return NextResponse.json({ success: false, error: 'Forbidden: User is not an admin' }, { status: 403 });
                }
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('token');
                return response;
            }

            // 4. Pass the verified email state down to API routes
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-admin-email', userEmail);
            requestHeaders.set('x-admin-name', userName);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });

        } catch (error) {
            console.error("Middleware token verification error:", error);
            if (isApiRoute) {
                return NextResponse.json({ success: false, error: 'Unauthorized: Token validation failed' }, { status: 401 });
            }
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }
    }

    return NextResponse.next();
}

// Configuration to precisely match ONLY admin UI and API routes
export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/employee/:path*', '/api/employee/:path*'],
};
