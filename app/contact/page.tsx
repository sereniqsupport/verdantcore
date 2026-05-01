"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries())),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      setStatus("success");
      form.reset();
    } else {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-6 py-12 text-[#10281d] lg:px-12">
      <section className="mx-auto max-w-6xl rounded-[2rem] bg-white p-8 shadow-[0_24px_80px_rgba(16,40,29,0.10)] lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:p-12">
        <div className="mb-10 lg:mb-0">
          <a href="/" className="text-sm font-bold text-[#637f4e]">← Back to Home</a>

          <p className="mt-10 text-xs font-bold uppercase tracking-[0.32em] text-[#6d8455]">
            Request a Quote
          </p>

          <h1 className="mt-4 font-serif text-5xl leading-tight tracking-[-0.04em] lg:text-6xl">
            Let’s elevate your workspace.
          </h1>

          <p className="mt-6 text-lg leading-8 text-[#4d594f]">
            Tell us about your office, cleaning needs, and preferred schedule.
            VerdantCore will respond with a tailored eco-conscious cleaning plan.
          </p>

          <div className="mt-10 rounded-3xl bg-[#062615] p-6 text-white">
            <h2 className="font-serif text-2xl">What we can support</h2>
            <div className="mt-5 space-y-3 text-sm text-white/75">
              <p>✓ Routine office cleaning</p>
              <p>✓ Deep reset and quarterly cleaning</p>
              <p>✓ High-touch sanitation</p>
              <p>✓ Custom plans by size, traffic, and frequency</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Full Name
              <input name="name" required className="rounded-2xl border border-[#dce2d5] px-4 py-3 outline-none focus:border-[#637f4e]" />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Work Email
              <input name="email" type="email" required className="rounded-2xl border border-[#dce2d5] px-4 py-3 outline-none focus:border-[#637f4e]" />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Company
              <input name="company" required className="rounded-2xl border border-[#dce2d5] px-4 py-3 outline-none focus:border-[#637f4e]" />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Phone
              <input name="phone" className="rounded-2xl border border-[#dce2d5] px-4 py-3 outline-none focus:border-[#637f4e]" />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Office Size
              <select name="officeSize" className="rounded-2xl border border-[#dce2d5] px-4 py-3 outline-none focus:border-[#637f4e]">
                <option>Under 2,500 sq ft</option>
                <option>2,500 to 7,500 sq ft</option>
                <option>7,500 to 15,000 sq ft</option>
                <option>15,000+ sq ft</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Cleaning Frequency
              <select name="frequency" className="rounded-2xl border border-[#dce2d5] px-4 py-3 outline-none focus:border-[#637f4e]">
                <option>Weekly</option>
                <option>2 to 3 times per week</option>
                <option>Daily</option>
                <option>One-time deep clean</option>
                <option>Custom schedule</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold">
            What do you need help with?
            <textarea name="message" required rows={6} className="rounded-2xl border border-[#dce2d5] px-4 py-3 outline-none focus:border-[#637f4e]" />
          </label>

          <button disabled={status === "sending"} className="rounded-full bg-[#637f4e] px-8 py-4 text-sm font-bold text-white shadow-xl disabled:opacity-60">
            {status === "sending" ? "Sending..." : "Request My Quote"}
          </button>

          {status === "success" && <p className="text-sm font-semibold text-[#637f4e]">Thank you. Your request has been received.</p>}
          {status === "error" && <p className="text-sm font-semibold text-red-700">Something went wrong. Please email hello@verdantcore.com.</p>}
        </form>
      </section>
    </main>
  );
}
