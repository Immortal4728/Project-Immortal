import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { status } = await req.json();

        if (!status) {
            return NextResponse.json({ success: false, error: "Missing required status" }, { status: 400 });
        }

        const result = await query(
            `UPDATE project_requests 
             SET status = $1 
             WHERE id = $2
             RETURNING id, status`,
            [status, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
    } catch (error: any) {
        console.error("Error updating progress:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
