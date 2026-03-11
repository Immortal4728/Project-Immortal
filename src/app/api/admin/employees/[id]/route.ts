import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Root admin accounts are identified by role = 'admin' (the super admin role).
// These are Firebase-authenticated platform owners who must never be modified from the Users page.
const PROTECTED_ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

async function isRootAdmin(id: string): Promise<boolean> {
  const result = await query(
    `SELECT role, email FROM employees WHERE id = $1`,
    [id],
  );
  if (result.rowCount === 0) return false;
  const employee = result.rows[0];
  // Protected if role is 'admin' AND email is in the protected whitelist
  return (
    employee.role === "admin" &&
    PROTECTED_ADMIN_EMAILS.includes(employee.email?.toLowerCase())
  );
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { action } = await req.json(); // "activate" or "deactivate"
    const { id } = await params;

    // ─── Root Admin Protection ───
    if (await isRootAdmin(id)) {
      return NextResponse.json(
        { success: false, error: "Root admin account cannot be modified" },
        { status: 403 },
      );
    }

    if (!["activate", "deactivate"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 },
      );
    }

    const active = action === "activate";
    const result = await query(
      `UPDATE employees SET active = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
      [active, id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating employee status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // ─── Root Admin Protection ───
    if (await isRootAdmin(id)) {
      return NextResponse.json(
        { success: false, error: "Root admin account cannot be modified" },
        { status: 403 },
      );
    }

    const result = await query(
      `DELETE FROM employees WHERE id = $1 RETURNING id`,
      [id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
