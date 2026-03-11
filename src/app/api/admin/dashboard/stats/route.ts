import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const statsQuery = await query(`
            SELECT 
                COUNT(*)::int as total,
                COUNT(*) FILTER (WHERE LOWER(status) = 'pending' OR status IS NULL)::int as pending,
                COUNT(*) FILTER (WHERE LOWER(status) = 'approved')::int as approved,
                COUNT(*) FILTER (WHERE LOWER(status) = 'rejected')::int as rejected
            FROM project_requests
        `);

        const stats = statsQuery.rows[0];

        const data = {
            total: stats?.total || 0,
            pending: stats?.pending || 0,
            approved: stats?.approved || 0,
            rejected: stats?.rejected || 0
        };

        if (process.env.NODE_ENV === "development") {
            console.log("Dashboard API Response [Counts]:", {
                "total submissions": data.total,
                "pending submissions": data.pending,
                "approved submissions": data.approved,
                "rejected submissions": data.rejected
            });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Dashboard stats query error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch aggregated dashboard counts" },
            { status: 500 }
        );
    }
}
