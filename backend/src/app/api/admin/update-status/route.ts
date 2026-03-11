import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

export async function PATCH(request: Request) {
    try {
        // 1. Initialize the InsForge backend client
        const insforge = createClient({
            baseUrl: process.env.API_BASE_URL || 'https://9cr29wh5.us-east.insforge.app',
            anonKey: process.env.INSFORGE_API_KEY || '',
        });

        // 2. Parse the PATCH JSON body
        const body = await request.json();
        const { id, status } = body;

        // 3. Validate required fields
        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: id and status' },
                { status: 400 }
            );
        }

        // 4. Validate status enum values
        if (status !== 'Approved' && status !== 'Rejected') {
            return NextResponse.json(
                { success: false, error: 'Status must be either "Approved" or "Rejected"' },
                { status: 400 }
            );
        }

        // 5. Update the corresponding row in 'project_submissions'
        // The InsForge SDK uses PostgREST which natively uses parameterized SQL statements
        const { data: updatedSubmission, error } = await insforge.database
            .from('project_submissions')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        // 6. Handle InsForge specific database errors
        if (error) {
            console.error('Database error updating status:', error);
            return NextResponse.json(
                { success: false, error: error.message || 'Error updating status' },
                { status: 500 }
            );
        }

        // 7. Handle case where no row was found (id didn't match)
        if (!updatedSubmission) {
            return NextResponse.json(
                { success: false, error: 'Submission not found' },
                { status: 404 }
            );
        }

        // 8. Return the updated row
        return NextResponse.json({
            success: true,
            data: updatedSubmission
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
