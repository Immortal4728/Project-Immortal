import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Instead of outright deleting the project request, we only completely obliterate the customer account
        // effectively unlinking their credentials without physically destroying business data logic 
        const result = await query(
            `UPDATE project_requests 
             SET student_account_created = false, 
                 student_password = NULL,
                 account_active = true 
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting customer access:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
