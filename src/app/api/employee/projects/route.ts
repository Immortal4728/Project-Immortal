import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

/* ─── In-memory cache (15s TTL) ─── */
let cachedResponse: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 15_000; // 15 seconds

export async function GET() {
    const startTime = Date.now();

    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("employee_session")?.value;

        if (!sessionCookie) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        // ─── Check cache ───
        if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
            console.log(`[Employee Projects] Cache hit (age: ${Date.now() - cachedResponse.timestamp}ms)`);
            return NextResponse.json(cachedResponse.data);
        }

        const dbStart = Date.now();

        // ─── Fetch projects + files in parallel (2 queries, NOT N+1) ───
        const [projectsResult, filesResult] = await Promise.all([
            query(
                `SELECT id, name, email, project_title, domain, status, order_id, created_at
                 FROM project_requests
                 WHERE status = 'approved'
                 ORDER BY created_at DESC`
            ),
            // Fetch ALL files for approved projects in ONE query
            query(
                `SELECT pf.id, pf.project_id, pf.document_type
                 FROM project_files pf
                 INNER JOIN project_requests pr ON pf.project_id = pr.id
                 WHERE pr.status = 'approved'
                 ORDER BY pf.uploaded_at DESC`
            ).catch(() => ({ rows: [], rowCount: 0 })) // Non-fatal if table doesn't exist
        ]);

        const dbTime = Date.now() - dbStart;

        // ─── Attach files to their respective projects in memory ───
        const filesByProject = new Map<string, any[]>();
        for (const file of filesResult.rows) {
            const pid = file.project_id;
            if (!filesByProject.has(pid)) filesByProject.set(pid, []);
            filesByProject.get(pid)!.push(file);
        }

        const projectsWithFiles = projectsResult.rows.map((project: any) => ({
            ...project,
            files: filesByProject.get(project.id) || [],
        }));

        const response = { success: true, data: projectsWithFiles };

        // ─── Update cache ───
        cachedResponse = { data: response, timestamp: Date.now() };

        const totalTime = Date.now() - startTime;
        console.log(`[Employee Projects] projects=${projectsResult.rowCount} files=${filesResult.rows.length} dbMs=${dbTime} totalMs=${totalTime}`);

        return NextResponse.json(response, { status: 200 });

    } catch (err: any) {
        console.error("[Employee Projects] Error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
