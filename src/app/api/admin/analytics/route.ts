import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        // Run parallel queries
        const [
            usersRes,
            submissionsRes,
            dailySubmissionsRes,
            weeklyUsersRes,
            dbStatusRes
        ] = await Promise.all([
            // User statistics
            query(`
                SELECT 
                    COUNT(*)::int as total_users,
                    COUNT(*) FILTER (WHERE account_active = true)::int as active_users,
                    COUNT(*) FILTER (WHERE DATE(created_at) = current_date)::int as new_users_today
                FROM project_requests
                WHERE student_account_created = true
            `),
            // Submission metrics
            query(`
                SELECT 
                    COUNT(*)::int as total_submissions,
                    COUNT(*) FILTER (WHERE DATE(created_at) = current_date)::int as submissions_today,
                    COUNT(*) FILTER (WHERE status = 'pending')::int as pending_review,
                    COUNT(*) FILTER (WHERE status = 'approved')::int as approved_submissions
                FROM project_requests
            `),
            // Daily submissions for the last 30 days
            query(`
                WITH dates AS (
                    SELECT generate_series(current_date - interval '29 days', current_date, '1 day'::interval)::date as d
                )
                SELECT 
                    TO_CHAR(d, 'Mon DD') as date,
                    COUNT(p.id)::int as _count
                FROM dates d
                LEFT JOIN project_requests p ON DATE(p.created_at) = d.d
                GROUP BY d.d
                ORDER BY d.d ASC
            `),
            // New users per week for the last 4 weeks
            query(`
                WITH weeks AS (
                    SELECT generate_series(
                        DATE_TRUNC('week', current_date - interval '3 weeks'), 
                        DATE_TRUNC('week', current_date), 
                        '1 week'::interval
                    )::date as w
                )
                SELECT 
                    TO_CHAR(w.w, 'Mon DD') as week,
                    COUNT(p.id)::int as _count
                FROM weeks w
                LEFT JOIN project_requests p 
                    ON DATE_TRUNC('week', p.created_at)::date = w.w 
                    AND p.student_account_created = true
                GROUP BY w.w
                ORDER BY w.w ASC
            `),
            // Database status
            query(`SELECT 1 as is_online`)
        ]);

        const userStats = usersRes.rows[0];
        const submissionStats = submissionsRes.rows[0];

        // Mocking daily visits
        const baseTrafficMultiplier = 15;
        const totalUsers = userStats.total_users || 0;
        const baseDailyVisits = (totalUsers || 10) * baseTrafficMultiplier;

        const platformTraffic = {
            dailyVisits: baseDailyVisits + Math.floor(Math.random() * 50),
            weeklyVisits: (baseDailyVisits * 7) + Math.floor(Math.random() * 200),
            monthlyVisits: (baseDailyVisits * 30) + Math.floor(Math.random() * 1000)
        };

        const dbStatus = dbStatusRes.rows.length > 0 ? "Online" : "Degraded";

        return NextResponse.json({
            success: true,
            data: {
                users: {
                    totalUsers: userStats.total_users || 0,
                    activeUsers: userStats.active_users || 0,
                    newUsersToday: userStats.new_users_today || 0
                },
                submissions: {
                    totalSubmissions: submissionStats.total_submissions || 0,
                    submissionsToday: submissionStats.submissions_today || 0,
                    pendingReview: submissionStats.pending_review || 0,
                    approvedSubmissions: submissionStats.approved_submissions || 0
                },
                traffic: platformTraffic,
                charts: {
                    dailySubmissions: dailySubmissionsRes.rows.map(r => ({ date: r.date, count: r._count || 0 })),
                    weeklyUsers: weeklyUsersRes.rows.map(r => ({ week: r.week, count: r._count || 0 }))
                },
                health: {
                    apiStatus: "Online",
                    databaseStatus: dbStatus,
                    serverUptime: process.uptime()
                }
            }
        });
    } catch (error) {
        console.error("Analytics fetch error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
