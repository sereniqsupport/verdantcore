import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const required = ["name", "email", "company", "message"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing ${field}` }, { status: 400 });
      }
    }

    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || "hello@verdantcore.com";

    if (resendKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "VerdantCore <onboarding@resend.dev>",
          to: [toEmail],
          subject: `New VerdantCore quote request from ${body.company}`,
          text: `
Name: ${body.name}
Email: ${body.email}
Company: ${body.company}
Phone: ${body.phone || "Not provided"}
Office Size: ${body.officeSize || "Not provided"}
Frequency: ${body.frequency || "Not provided"}

Message:
${body.message}
          `,
        }),
      });

      if (!response.ok) {
        return NextResponse.json({ error: "Email failed" }, { status: 500 });
      }
    }

    console.log("VerdantCore contact request:", body);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
