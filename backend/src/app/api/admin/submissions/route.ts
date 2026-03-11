import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

export async function GET(request: Request) {
    try {
        // 1. Initialize the InsForge backend client
        const insforge = createClient({
            baseUrl: process.env.API_BASE_URL || 'https://9cr29wh5.us-east.insforge.app',
            anonKey: process.env.INSFORGE_API_KEY || '',
        });

        // 2. Query the database for all rows in 'project_submissions'
        // 3. Order the results by 'created_at' in descending order (newest first)
        const { data: submissions, error } = await insforge.database
            .from('project_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        // 4. Handle InsForge specific database errors
        if (error) {
            console.error('Database error fetching submissions:', error);
            return NextResponse.json(
                { success: false, error: error.message || 'Error fetching submissions' },
                { status: 500 }
            );
        }

        // 5. Return the subset as a JSON array
        return NextResponse.json({
            success: true,
            data: submissions
        }, { status: 200 });

    } catch (err: any) {
        // Catch generic API side execution exceptions
        console.error('API route error:', err);
        return NextResponse.json(
            { success: false, error: err.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
