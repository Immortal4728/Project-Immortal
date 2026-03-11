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
            `SELECT * FROM employees
             WHERE email = $1
             AND password = $2
             AND active = true`,
            [normalizedEmail, password]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const employee = result.rows[0];

        // ─── Create session cookie ───
        const sessionPayload = JSON.stringify({
            id: employee.id,
            name: employee.name,
            role: employee.role,
            email: employee.email,
        });
        const sessionToken = Buffer.from(sessionPayload).toString("base64");

        const response = NextResponse.json(
            { success: true },
            { status: 200 }
        );

        // Set HTTP-only cookie for session
        response.cookies.set("employee_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (err: any) {
        console.error("Employee login error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
