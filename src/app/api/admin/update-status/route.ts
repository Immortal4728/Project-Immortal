import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

// ─── Helper: Generate a secure random 8-character password ───
function generatePassword(): string {
    return crypto.randomBytes(6).toString("base64url").slice(0, 8);
}

// ─── Helper: Generate a unique order ID in format IMM-XXXXXXXX ───
function generateOrderId(): string {
    const timestamp = Date.now().toString().slice(-4);
    const random = crypto.randomInt(1000, 9999).toString();
    return `IMM-${timestamp}${random}`;
}

// ─── Helper: Send approval email via Nodemailer + Gmail SMTP ───
async function sendApprovalEmail(params: {
    name: string;
    email: string;
    projectTitle: string;
    studentPassword: string;
    orderId: string;
}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Project Immortal" <${process.env.EMAIL_USER}>`,
        to: params.email,
        subject: "Project Immortal – Your Project Has Been Approved",
        text: `Hello ${params.name},

Your project request "${params.projectTitle}" has been approved.

Login here:
https://project-immortal.vercel.app/student-login

Credentials:

Email: ${params.email}
Password: ${params.studentPassword}
Order ID: ${params.orderId}

Regards
Project Immortal Team`,
    };

    await transporter.sendMail(mailOptions);
}

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
        console.log(`[update-status] Received request: id=${id}, status=${normalizedStatus}`);

        if (normalizedStatus !== "approved" && normalizedStatus !== "rejected" && normalizedStatus !== "pending") {
            return NextResponse.json(
                { success: false, error: "Status must be either 'pending', 'approved', or 'rejected'" },
                { status: 400 }
            );
        }

        // ─── Approval Flow ───
        if (normalizedStatus === "approved") {
            const studentPassword = generatePassword();
            const orderId = generateOrderId();

            // Fetch the student's info for the email
            const fetchResult = await query(
                "SELECT name, email, project_title FROM project_requests WHERE id = $1",
                [id]
            );

            if (fetchResult.rowCount === 0) {
                return NextResponse.json(
                    { success: false, error: "Submission not found" },
                    { status: 404 }
                );
            }

            const submission = fetchResult.rows[0];

            // Update all fields in ONE SQL query
            const updateResult = await query(
                `UPDATE project_requests
                 SET status = 'approved',
                     student_password = $1,
                     student_account_created = true,
                     order_id = $2
                 WHERE id = $3`,
                [studentPassword, orderId, id]
            );

            console.log(`[update-status] SQL UPDATE result: rowCount=${updateResult.rowCount}`);

            if (updateResult.rowCount === 0) {
                return NextResponse.json(
                    { success: false, error: "Failed to update submission" },
                    { status: 500 }
                );
            }

            // Send approval email
            try {
                await sendApprovalEmail({
                    name: submission.name,
                    email: submission.email,
                    projectTitle: submission.project_title || "Untitled Project",
                    studentPassword,
                    orderId,
                });
            } catch (emailError: any) {
                console.error("Email send error:", emailError);
                // DB update succeeded, email failed
                return NextResponse.json(
                    { success: true, data: { status: normalizedStatus }, warning: "Status updated but email failed to send." },
                    { status: 200 }
                );
            }

            console.log(`[update-status] Approval complete for id=${id}, orderId=${orderId}`);
            return NextResponse.json({ success: true, data: { status: normalizedStatus } }, { status: 200 });
        }

        // ─── Non-approval: only update status ───
        const updateResult = await query(
            "UPDATE project_requests SET status = $1 WHERE id = $2",
            [normalizedStatus, id]
        );

        if (updateResult.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: "Submission not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: { status: normalizedStatus } }, { status: 200 });

    } catch (err: any) {
        console.error("API route error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
