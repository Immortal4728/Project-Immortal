import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();

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

        // ─── Fetch project + files in parallel ───
        const dbStart = Date.now();
        const [projectResult, filesResult] = await Promise.all([
            query(
                `SELECT id, name, email, project_title, domain, status, order_id, created_at
                 FROM project_requests
                 WHERE id = $1 AND status = 'approved'`,
                [projectId]
            ),
            query(
                `SELECT id, project_id, document_type, file_name, file_url, uploaded_at
                 FROM project_files
                 WHERE project_id = $1
                 ORDER BY uploaded_at DESC`,
                [projectId]
            ).catch(() => ({ rows: [], rowCount: 0 }))
        ]);
        const dbTime = Date.now() - dbStart;

        if (projectResult.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: "Project not found or not approved" },
                { status: 404 }
            );
        }

        const project = projectResult.rows[0];
        project.files = filesResult.rows;

        const totalTime = Date.now() - startTime;
        console.log(`[Employee Project/${projectId}] files=${filesResult.rows.length} dbMs=${dbTime} totalMs=${totalTime}`);

        return NextResponse.json(
            { success: true, data: project },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("[Employee Project Detail] Error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}

