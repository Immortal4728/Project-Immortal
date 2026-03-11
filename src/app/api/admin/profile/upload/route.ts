import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, type, image } = await req.json();

    if (!id || !type || !image) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (type === "admin") {
      const res = await query(
        `UPDATE employees SET profile_picture = $1 WHERE id = $2 RETURNING id`,
        [image, id],
      );
      if (res.rowCount === 0)
        return NextResponse.json(
          { success: false, error: "Admin not found" },
          { status: 404 },
        );
    } else if (type === "customer") {
      const res = await query(
        `UPDATE project_requests SET profile_picture = $1 WHERE id = $2 RETURNING id`,
        [image, id],
      );
      if (res.rowCount === 0)
        return NextResponse.json(
          { success: false, error: "Customer not found" },
          { status: 404 },
        );
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid type" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, url: image });
  } catch (error) {
    console.error("Upload profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
