import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { meeting_date, meeting_time, meeting_link } = await req.json();

        const result = await query(
            `UPDATE project_requests 
             SET meeting_date = $1, meeting_time = $2, meeting_link = $3 
             WHERE id = $4
             RETURNING id`,
            [meeting_date || null, meeting_time || null, meeting_link || null, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
    } catch (error: any) {
        console.error("Error updating meeting:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
