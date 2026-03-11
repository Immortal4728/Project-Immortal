import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Fetch the student's project(s) by email
        const { data: projects, error } = await insforge.database
            .from("project_requests")
            .select("*")
            .eq("email", email.toLowerCase().trim())
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Student project lookup error:", error);
            return NextResponse.json(
                { success: false, error: "Failed to fetch project data" },
                { status: 500 }
            );
        }

        if (!projects || projects.length === 0) {
            return NextResponse.json(
                { success: false, error: "No project found for this email address" },
                { status: 404 }
            );
        }

        // Fetch files for each project
        const projectIds = projects.map((p: any) => p.id);
        const { data: files, error: filesError } = await insforge.database
            .from("project_files")
            .select("*")
            .in("project_id", projectIds)
            .order("uploaded_at", { ascending: false });

        if (filesError) {
            console.error("Project files lookup error:", filesError);
            // Non-fatal — continue without files
        }

        // Attach files to their respective projects
        const projectsWithFiles = projects.map((project: any) => ({
            ...project,
            files: (files || []).filter((f: any) => f.project_id === project.id),
        }));

        return NextResponse.json(
            { success: true, data: projectsWithFiles },
            { status: 200 }
        );
    } catch (error) {
        console.error("Student project API error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
