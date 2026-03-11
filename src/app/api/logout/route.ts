import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true });

    response.cookies.set("student_session", "", { maxAge: 0 });
    response.cookies.set("employee_session", "", { maxAge: 0 });
    response.cookies.set("admin_session", "", { maxAge: 0 });
    response.cookies.set("token", "", { maxAge: 0 }); // Admin token

    return response;
}
