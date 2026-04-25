import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { insforge } from "@/lib/insforge";

/* ─── In-memory cache (15s TTL) ─── */
let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15_000; // 15 seconds

export async function GET() {
    const startTime = Date.now();

    try {
        // ── Serve from cache if fresh ──
        if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
            console.log(`[Dashboard API] Served from cache (age: ${Date.now() - lastFetchTime}ms)`);
            return NextResponse.json({ success: true, data: cachedData, cached: true });
        }

        // ── 1. Stats aggregate (single row, fast) ──
        const t1 = Date.now();
        const statsQuery = query(`
            SELECT 
                COUNT(*)::int as total,
                COUNT(*) FILTER (WHERE LOWER(status) = 'pending' OR status IS NULL)::int as pending,
                COUNT(*) FILTER (WHERE LOWER(status) = 'approved')::int as approved,
                COUNT(*) FILTER (WHERE LOWER(status) = 'rejected')::int as rejected
            FROM project_requests
        `);

        // ── 2. Recent 20 submissions (deterministic order) ──
        const recentSubmissionsQuery = insforge.database
            .from("project_requests")
            .select("id, name, email, phone, domain, project_title, status, created_at")
            .order("created_at", { ascending: false })
            .order("id", { ascending: false })
            .limit(20);

        // ── 3. Domain distribution (aggregated in DB) ──
        const domainQuery = query(`
            SELECT COALESCE(domain, 'Other') as name, COUNT(*)::int as value
            FROM project_requests
            GROUP BY COALESCE(domain, 'Other')
            ORDER BY value DESC
        `);

        // ── 4. Timeline (last 30 days, aggregated in DB) ──
        const timelineQuery = query(`
            SELECT TO_CHAR(created_at, 'Mon DD') as date, COUNT(*)::int as submissions
            FROM project_requests
            WHERE created_at IS NOT NULL
            GROUP BY TO_CHAR(created_at, 'Mon DD'), DATE(created_at)
            ORDER BY DATE(created_at) ASC
            LIMIT 30
        `);

        // ── Execute all 4 queries in parallel ──
        const [statsResult, recentRes, domainResult, timelineResult] = await Promise.all([
            statsQuery,
            recentSubmissionsQuery,
            domainQuery,
            timelineQuery
        ]);
        const dbTime = Date.now() - t1;

        if (recentRes.error) {
            throw recentRes.error;
        }

        const stats = statsResult.rows[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };

        // Derive status distribution from the aggregate — no extra query needed
        const statusData = [
            { name: "Pending", value: stats.pending },
            { name: "Approved", value: stats.approved },
            { name: "Rejected", value: stats.rejected }
        ].filter(d => d.value > 0);

        const data = {
            stats: {
                total: stats.total || 0,
                pending: stats.pending || 0,
                approved: stats.approved || 0,
                rejected: stats.rejected || 0
            },
            recentSubmissions: recentRes.data || [],
            domainDistribution: domainResult.rows || [],
            statusDistribution: statusData,
            timelineData: timelineResult.rows || []
        };

        // ── Update cache ──
        cachedData = data;
        lastFetchTime = Date.now();

        const totalTime = Date.now() - startTime;
        console.log(`[Dashboard API] recent=${(recentRes.data || []).length} dbMs=${dbTime} totalMs=${totalTime}`);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[Dashboard API] Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
