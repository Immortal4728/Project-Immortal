import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
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

        // ─── Query database for matching credentials ───
        const result = await query(
            `SELECT * FROM project_requests
             WHERE email = $1
             AND student_password = $2
             AND student_account_created = true`,
            [normalizedEmail, password]
        );

        if (result.rowCount === 0) {
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

        // ─── Update last_login ───
        await query(
            `UPDATE project_requests SET last_login = NOW() WHERE id = $1`,
            [student.id]
        );

        // ─── Create session cookie ───
        // Store email and order_id in a simple base64 token
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

        return response;

    } catch (err: any) {
        console.error("Student login error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
