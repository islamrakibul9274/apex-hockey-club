import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    await connectToDatabase();
    await Inquiry.create({
      name,
      email,
      phone: phone || "",
      subject: subject || "General Inquiry",
      message,
      status: "unread",
    }).catch((err) => console.warn("Inquiry DB save skipped:", err.message));

    // Send email notification via Resend if available
    if (resend) {
      try {
        await resend.emails.send({
          from: "Apex Hockey <onboarding@resend.dev>",
          to: ["islamrakibul9274@gmail.com"],
          subject: `[New Inquiry] ${subject || "Contact Form"}: from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nMessage:\n${message}`,
        });
      } catch (emailErr) {
        console.warn("Resend notification dispatch:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been received and our team will get in touch shortly.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process message";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
