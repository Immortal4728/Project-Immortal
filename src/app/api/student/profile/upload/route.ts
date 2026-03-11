import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("student_session")?.value;

        if (!sessionCookie) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        let session: { email: string; orderId: string };
        try {
            session = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid session" },
                { status: 401 }
            );
        }

        if (!session.email) {
            return NextResponse.json(
                { success: false, error: "Invalid session data" },
                { status: 401 }
            );
        }

        const { image } = await req.json();

        if (!image) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 },
            );
        }

        const res = await query(
            `UPDATE project_requests SET student_profile_photo = $1 WHERE email = $2 RETURNING id`,
            [image, session.email],
        );

        if (res.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: "Student not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, url: image });
    } catch (error) {
        console.error("Upload profile error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
