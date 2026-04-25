import { insforge } from "@/lib/insforge";
import { NextRequest, NextResponse } from "next/server";

/* ─── In-memory cache for page 1 (15s TTL) ─── */
let page1Cache: { data: any; timestamp: number } | null = null;
const PAGE1_CACHE_TTL = 15_000; // 15 seconds

/* ─── Safety cap to prevent abuse ─── */
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
    const startTime = Date.now();

    try {
        const searchParams = request.nextUrl.searchParams;
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        // Clamp limit to [1, MAX_LIMIT] — prevents frontend from requesting 10k rows
        const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // ── Serve page 1 from cache if fresh ──
        if (page === 1 && page1Cache && Date.now() - page1Cache.timestamp < PAGE1_CACHE_TTL) {
            console.log(`[Submissions API] Page 1 served from cache (age: ${Date.now() - page1Cache.timestamp}ms)`);
            return NextResponse.json(page1Cache.data);
        }

        const offset = (page - 1) * limit;

        // ── Query with deterministic ordering ──
        // Secondary sort by id DESC prevents duplicate/missing rows when
        // multiple records share the same created_at timestamp.
        const dbStart = Date.now();
        const { data, error } = await insforge.database
            .from("project_requests")
            .select("id, name, email, phone, domain, project_title, status, created_at")
            .order("created_at", { ascending: false })
            .order("id", { ascending: false })
            .range(offset, offset + limit); // Fetches limit + 1 items for hasMore check
        const dbTime = Date.now() - dbStart;

        if (error) {
            console.error("[Submissions API] DB error:", error);
            return NextResponse.json(
                { success: false, error: "Failed to fetch submissions" },
                { status: 500 }
            );
        }

        const items = data || [];
        const hasMore = items.length > limit;

        // Trim the extra row used for the hasMore check
        const results = hasMore ? items.slice(0, limit) : items;

        const response = {
            success: true,
            data: results,
            page,
            limit,
            hasMore
        };

        // ── Cache page 1 only ──
        if (page === 1) {
            page1Cache = { data: response, timestamp: Date.now() };
        }

        const totalTime = Date.now() - startTime;
        console.log(`[Submissions API] page=${page} limit=${limit} rows=${results.length} hasMore=${hasMore} dbMs=${dbTime} totalMs=${totalTime}`);

        return NextResponse.json(response);
    } catch (error) {
        console.error("[Submissions API] Unhandled error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch submissions" },
            { status: 500 }
        );
    }
}
