import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT id, name, email, account_active, last_login, created_at, project_title, domain, status, meeting_date, meeting_time, meeting_link, profile_picture, student_profile_photo
             FROM project_requests 
             WHERE student_account_created = true 
             ORDER BY created_at DESC`,
    );

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
