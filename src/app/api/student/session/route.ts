import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("student_session")?.value;

        if (!sessionCookie) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        // ─── Decode session ───
        let session: { email: string; orderId: string };
        try {
            session = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid session" },
                { status: 401 }
            );
        }

        if (!session.email || !session.orderId) {
            return NextResponse.json(
                { success: false, error: "Invalid session data" },
                { status: 401 }
            );
        }

        // ─── Fetch student's project data ───
        const result = await query(
            `SELECT id, name, email, phone, project_title, domain, description,
                    status, payment_status, meeting_link, meeting_date, meeting_time,
                    order_id, created_at, updated_at, student_profile_photo, progress_stage
             FROM project_requests
             WHERE email = $1 AND order_id = $2`,
            [session.email, session.orderId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: "Project not found" },
                { status: 404 }
            );
        }

        // ─── Fetch associated files ───
        const projectIds = result.rows.map((r: any) => r.id);

        let files: any[] = [];
        try {
            const filesResult = await query(
                `SELECT * FROM project_files WHERE project_id = ANY($1) ORDER BY uploaded_at DESC`,
                [projectIds]
            );
            files = filesResult.rows;
        } catch {
            // project_files table may not exist or have no data — non-fatal
        }

        // Attach files to projects
        const projectsWithFiles = result.rows.map((project: any) => ({
            ...project,
            files: files.filter((f: any) => f.project_id === project.id),
        }));

        return NextResponse.json(
            { success: true, data: projectsWithFiles },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("Student session error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
