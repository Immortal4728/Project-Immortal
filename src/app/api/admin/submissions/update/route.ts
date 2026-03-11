import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

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

        const { data, error } = await insforge.database
            .from("project_requests")
            .update({ status: normalizedStatus })
            .eq("id", id)
            .select();

        if (error) {
            console.error("Submission update error:", error);
            return NextResponse.json(
                { success: false, error: "Update failed" },
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
