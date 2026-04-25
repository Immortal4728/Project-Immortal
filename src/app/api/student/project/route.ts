import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
    const startTime = Date.now();

    try {
        const body = await req.json();
        const { email } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email format" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // ─── Single query: project + files via LEFT JOIN ───
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
             WHERE pr.email = $1
             GROUP BY pr.id
             ORDER BY pr.created_at DESC`,
            [normalizedEmail]
        );
        const dbTime = Date.now() - dbStart;

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: "No project found for this email address" },
                { status: 404 }
            );
        }

        const totalTime = Date.now() - startTime;
        console.log(`[Student Project] email=${normalizedEmail} projects=${result.rowCount} dbMs=${dbTime} totalMs=${totalTime}`);

        return NextResponse.json(
            { success: true, data: result.rows },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("[Student Project] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
