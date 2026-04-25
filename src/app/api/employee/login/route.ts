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
            `SELECT id, name, email, role
             FROM employees
             WHERE email = $1
               AND password = $2
               AND active = true
             LIMIT 1`,
            [normalizedEmail, password]
        );
        const dbTime = Date.now() - dbStart;

        if (result.rowCount === 0) {
            console.log(`[Employee Login] Failed for ${normalizedEmail} dbMs=${dbTime}`);
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

        const totalTime = Date.now() - startTime;
        console.log(`[Employee Login] OK for ${normalizedEmail} dbMs=${dbTime} totalMs=${totalTime}`);

        return response;

    } catch (err: any) {
        console.error("[Employee Login] Error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
