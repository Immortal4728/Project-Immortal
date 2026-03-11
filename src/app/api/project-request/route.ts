import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { ProjectRequest } from "@/lib/types";

// In-memory rate limiting map
// Key: IP address, Value: { count: number, timestamp: number }
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

function applyRateLimit(ip: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const limit = 5;

    const record = rateLimitMap.get(ip);
    if (!record) {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return true;
    }

    if (now - record.timestamp > windowMs) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    return true;
}

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

        if (!applyRateLimit(ip)) {
            console.error(`Rate limit exceeded for IP: ${ip}`);
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { name, email, phone, project_title, domain, description } = body as Partial<ProjectRequest>;

        // Validation Rules
        const errors: Record<string, string> = {};

        if (!name || name.trim().length < 2) {
            errors.name = "Full name must be at least 2 characters";
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address";
        }
        if (!phone || phone.replace(/\D/g, "").length < 10) {
            errors.phone = "Phone number must contain at least 10 digits";
        }
        if (!project_title || project_title.trim().length < 3) {
            errors.project_title = "Project title must be at least 3 characters";
        }
        if (!domain) {
            errors.domain = "Please select a project domain";
        }
        if (!description || description.trim().length < 20) {
            errors.description = "Project description must be at least 20 characters";
        }

        if (Object.keys(errors).length > 0) {
            console.error("Validation failed:", errors);
            return NextResponse.json(
                { success: false, errors, message: "Validation failed" },
                { status: 400 }
            );
        }

        const projectRequest: ProjectRequest = {
            name: name!,
            email: email!,
            phone: phone!,
            project_title: project_title!,
            domain: domain!,
            description: description!,
            status: "pending",
        };

        const { data, error } = await insforge.database
            .from("project_requests")
            .insert([projectRequest]);

        if (error) {
            console.error("InsForge insert error:", error);
            return NextResponse.json(
                { success: false, error: "Failed to save submission to database" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Project request submitted" },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
