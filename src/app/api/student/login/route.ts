import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
    const startTime = Date.now();

    try {
        const body = await req.json();
        const { email, password } = body;

        // ─── Validate inputs ───
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email and password are required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // ─── Auth query: fetch ONLY the columns needed for authentication ───
        const dbStart = Date.now();
        const result = await query(
            `SELECT id, email, name, order_id, account_active
             FROM project_requests
             WHERE email = $1
               AND student_password = $2
               AND student_account_created = true
             LIMIT 1`,
            [normalizedEmail, password]
        );
        const dbTime = Date.now() - dbStart;

        if (result.rowCount === 0) {
            console.log(`[Student Login] Failed for ${normalizedEmail} dbMs=${dbTime}`);
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const student = result.rows[0];

        if (student.account_active === false) {
            return NextResponse.json(
                { success: false, error: "Account disabled. Please contact support." },
                { status: 403 }
            );
        }

        // ─── Fire-and-forget: update last_login without blocking the response ───
        query(
            `UPDATE project_requests SET last_login = NOW() WHERE id = $1`,
            [student.id]
        ).catch((err) => console.error("[Student Login] last_login update failed:", err));

        // ─── Create session cookie ───
        const sessionPayload = JSON.stringify({
            email: student.email,
            orderId: student.order_id,
            name: student.name,
            id: student.id,
        });
        const sessionToken = Buffer.from(sessionPayload).toString("base64");

        const response = NextResponse.json(
            { success: true },
            { status: 200 }
        );

        // Set HTTP-only cookie for session
        response.cookies.set("student_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        const totalTime = Date.now() - startTime;
        console.log(`[Student Login] OK for ${normalizedEmail} dbMs=${dbTime} totalMs=${totalTime}`);

        return response;

    } catch (err: any) {
        console.error("[Student Login] Error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
