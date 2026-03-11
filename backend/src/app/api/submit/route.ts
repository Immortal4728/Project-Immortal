import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

export async function POST(request: Request) {
  try {
    // 1. Initialize the InsForge backend client using the environment variables
    const insforge = createClient({
      baseUrl: process.env.API_BASE_URL || 'https://9cr29wh5.us-east.insforge.app',
      anonKey: process.env.INSFORGE_API_KEY || '', 
    });

    // 2. Parse the POST JSON body
    const body = await request.json();
    
    // De-structure variables to ensure only expected fields are processed (prevents mass-assignment)
    const { name, email, phone, college, domain, description } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3. Insert into project_submissions
    // The InsForge SDK uses PostgREST which natively uses parameterized SQL statements
    // to prevent SQL injection payloads being executed.
    const { data: submission, error } = await insforge.database
      .from('project_submissions')
      .insert({
        name,
        email,
        phone,
        college,
        domain,
        description,
        status: 'PENDING' // Setting a default status
      })
      .select()
      .single();

    // 4. Handle errors properly
    if (error) {
      console.error('Database error inserting submission:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Error saving submission' },
        { status: 500 }
      );
    }

    // 5. Return clean JSON response on success
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
