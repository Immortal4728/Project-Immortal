import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp();
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);

export async function verifyAdmin(request: Request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        };
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (!decodedToken.email || !ADMIN_EMAILS.includes(decodedToken.email)) {
            return {
                authorized: false,
                response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            };
        }

        return {
            authorized: true,
            user: decodedToken
        };
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        };
    }
}
