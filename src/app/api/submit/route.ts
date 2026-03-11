import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

export async function POST(request: Request) {
    try {
        const insforge = createClient({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
            anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        });

        const body = await request.json();
        const { name, email, phone, college, domain, description } = body;

        if (!name || typeof name !== 'string' || name.length < 3 || name.length > 80) {
            return NextResponse.json(
                { success: false, error: 'Name must be between 3 and 80 characters' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || typeof email !== 'string' || email.length > 254 || !emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Valid email under 254 characters is required' },
                { status: 400 }
            );
        }

        if (!description || typeof description !== 'string' || description.length < 20 || description.length > 2000) {
            return NextResponse.json(
                { success: false, error: 'Project description must be between 20 and 2000 characters' },
                { status: 400 }
            );
        }

        const { data: submission, error } = await insforge.database
            .from('project_submissions')
            .insert({
                name,
                email,
                phone,
                college,
                domain,
                description,
                status: 'PENDING'
            })
            .select()
            .single();

        if (error) {
            console.error('Database error inserting submission:', error);
            return NextResponse.json(
                { success: false, error: error.message || 'Error saving submission' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: submission
        }, { status: 201 });

    } catch (err: any) {
        console.error('API route error:', err);
        return NextResponse.json(
            { success: false, error: err.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
