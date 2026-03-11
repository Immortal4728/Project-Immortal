import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Root admin emails — these accounts are managed via the Admin Profile page,
// not the Users Management page. They are excluded from the employee list.
const PROTECTED_ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

export async function GET() {
  try {
    const placeholders = PROTECTED_ADMIN_EMAILS.map(
      (_, i) => `$${i + 1}`,
    ).join(", ");

    const result = await query(
      `SELECT id, name, email, role, active, profile_picture, created_at, updated_at
             FROM employees
             WHERE LOWER(email) NOT IN (${placeholders})
             ORDER BY created_at DESC`,
      PROTECTED_ADMIN_EMAILS.map((e) => e.toLowerCase()),
    );

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
