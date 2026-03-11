import { insforge } from "@/lib/insforge";

export async function GET() {
    try {
        const { data, error } = await insforge.database
            .from("project_requests")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Failed to fetch submissions:", error);
            return Response.json(
                { success: false, error: "Failed to fetch submissions" },
                { status: 500 }
            );
        }

        return Response.json({ success: true, data: data || [] });
    } catch (error) {
        console.error("Submissions API error:", error);
        return Response.json(
            { success: false, error: "Failed to fetch submissions" },
            { status: 500 }
        );
    }
}
