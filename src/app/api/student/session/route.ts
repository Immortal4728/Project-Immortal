import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

/* ─── In-memory cache for session data (10s TTL) ─── */
const sessionCache = new Map<string, { data: any; timestamp: number }>();
const SESSION_CACHE_TTL = 10_000; // 10 seconds

export async function GET() {
    const startTime = Date.now();

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

        // ─── Check cache ───
        const cacheKey = `${session.email}:${session.orderId}`;
        const cached = sessionCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < SESSION_CACHE_TTL) {
            console.log(`[Student Session] Cache hit for ${cacheKey} (age: ${Date.now() - cached.timestamp}ms)`);
            return NextResponse.json(cached.data);
        }

        // ─── Fetch project + files in PARALLEL (not sequential) ───
        // The project query is needed first to get IDs for the files query,
        // BUT we can avoid this waterfall by using a single JOIN query instead.
        const dbStart = Date.now();

        const result = await query(
            `SELECT
                pr.id, pr.name, pr.email, pr.phone, pr.project_title, pr.domain,
                pr.description, pr.status, pr.payment_status,
                pr.meeting_link, pr.meeting_date, pr.meeting_time,
                pr.order_id, pr.created_at, pr.updated_at,
                pr.student_profile_photo, pr.progress_stage,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', pf.id,
                            'project_id', pf.project_id,
                            'document_type', pf.document_type,
                            'file_name', pf.file_name,
                            'file_url', pf.file_url,
                            'uploaded_at', pf.uploaded_at
                        ) ORDER BY pf.uploaded_at DESC
                    ) FILTER (WHERE pf.id IS NOT NULL),
                    '[]'::json
                ) AS files
             FROM project_requests pr
             LEFT JOIN project_files pf ON pf.project_id = pr.id
             WHERE pr.email = $1 AND pr.order_id = $2
             GROUP BY pr.id
             ORDER BY pr.created_at DESC`,
            [session.email, session.orderId]
        );

        const dbTime = Date.now() - dbStart;

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: "Project not found" },
                { status: 404 }
            );
        }

        const response = { success: true, data: result.rows };

        // ─── Update cache ───
        sessionCache.set(cacheKey, { data: response, timestamp: Date.now() });

        const totalTime = Date.now() - startTime;
        const fileCount = result.rows.reduce((sum: number, r: any) => sum + (Array.isArray(r.files) ? r.files.length : 0), 0);
        console.log(`[Student Session] projects=${result.rowCount} files=${fileCount} dbMs=${dbTime} totalMs=${totalTime}`);

        return NextResponse.json(response, { status: 200 });

    } catch (err: any) {
        console.error("[Student Session] Error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
