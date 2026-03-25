import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("employee_session")?.value;

        if (!sessionCookie) {
            return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
        }

        let session: { id: string; email: string };
        try {
            session = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
        } catch {
            return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
        }

        const body = await req.json();
        const { project_id, file_name, file_url, document_type } = body;

        if (!project_id || !file_name || !file_url || !document_type) {
            return NextResponse.json({ success: false, error: "Missing file details" }, { status: 400 });
        }

        const validTypes = ["record", "ppt", "viva", "notes"];
        if (!validTypes.includes(document_type)) {
            return NextResponse.json({ success: false, error: "Invalid document type" }, { status: 400 });
        }

        // Insert into project_files
        const result = await query(
            `INSERT INTO project_files (project_id, file_name, file_url, document_type, uploaded_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, uploaded_at as created_at`,
            [project_id, file_name, file_url, document_type, session.email]
        );

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });

    } catch (err: any) {
        console.error("Employee file upload error:", err);
        return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
    }
}
