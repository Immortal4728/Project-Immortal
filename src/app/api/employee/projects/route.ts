import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("employee_session")?.value;

        if (!sessionCookie) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const result = await query(
            `SELECT id, name, email, project_title, domain, status, order_id, created_at
             FROM project_requests
             WHERE status = 'approved'
             ORDER BY created_at DESC`
        );

        return NextResponse.json(
            { success: true, data: result.rows },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("Fetch employee projects error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
