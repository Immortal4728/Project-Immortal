import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: id and status" },
                { status: 400 }
            );
        }

        const normalizedStatus = status.toLowerCase();

        const updateResult = await query(
            "UPDATE project_requests SET status = $1 WHERE id = $2 RETURNING *",
            [normalizedStatus, id]
        );

        if (updateResult.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: "Submission not found or update failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Submission update error:", error);
        return NextResponse.json(
            { success: false, error: "Update failed" },
            { status: 500 }
        );
    }
}
