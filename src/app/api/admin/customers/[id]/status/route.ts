import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { active } = await req.json();

        if (typeof active !== "boolean") {
            return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
        }

        const result = await query(
            `UPDATE project_requests 
             SET account_active = $1 
             WHERE id = $2
             RETURNING id, account_active`,
            [active, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
    } catch (error: any) {
        console.error("Error updating customer status:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
