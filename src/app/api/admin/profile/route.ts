import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cookieToken = req.cookies.get("token")?.value;

    let token = cookieToken;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token)
      return NextResponse.json(
        { success: false, error: "Failed to locate verified admin session" },
        { status: 401 },
      );

    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!firebaseApiKey)
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      );
    const verifyResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
      {
        method: "POST",
        body: JSON.stringify({ idToken: token }),
        headers: { "Content-Type": "application/json" },
      },
    );
    const decoded = await verifyResponse.json();
    const firebaseUser = decoded.users?.[0];
    const userEmail = firebaseUser?.email;

    if (!userEmail)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    // Extract real name from Firebase profile
    const firebaseDisplayName =
      firebaseUser?.displayName ||
      userEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

    // Lookup in `employees` table natively matching this email
    let result = await query(`SELECT * FROM employees WHERE email = $1`, [
      userEmail,
    ]);

    // Auto-provision a record if they are logging in via Admin Portal (firebase) for the first time
    if (result.rowCount === 0) {
      result = await query(
        `INSERT INTO employees (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *`,
        [firebaseDisplayName, userEmail, "firebase_auth_stub", "admin"],
      );
    } else if (result.rows[0].name === "Super Admin" && firebaseDisplayName !== "Super Admin") {
      // Update the placeholder name with the real Firebase display name
      await query(`UPDATE employees SET name = $1 WHERE email = $2`, [
        firebaseDisplayName,
        userEmail,
      ]);
      result.rows[0].name = firebaseDisplayName;
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
