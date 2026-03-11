import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("employee_session")?.value;

        if (!sessionCookie) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const projectId = id;

        const result = await query(
            `SELECT id, name, email, project_title, domain, status, order_id, created_at
             FROM project_requests
             WHERE id = $1 AND status = 'approved'`,
            [projectId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: "Project not found or not approved" },
                { status: 404 }
            );
        }

        const project = result.rows[0];

        // Fetch associated files
        let files: any[] = [];
        try {
            const filesResult = await query(
                `SELECT * FROM project_files WHERE project_id = $1 ORDER BY uploaded_at DESC`,
                [projectId]
            );
            files = filesResult.rows;
        } catch {
            // ignore
        }

        project.files = files;

        return NextResponse.json(
            { success: true, data: project },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("Fetch employee project error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
