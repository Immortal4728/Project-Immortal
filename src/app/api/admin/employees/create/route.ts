import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
        }

        const validRoles = ["employee", "admin"];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await query(
            `INSERT INTO employees (name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role, created_at`,
            [name.trim(), normalizedEmail, hashedPassword, role]
        );

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
    } catch (error: any) {
        console.error("Error creating employee:", error);
        // Handle postgres unique constraint violation if email already exists
        if (error.code === '23505') {
            return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
