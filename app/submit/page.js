"use client";

import { useState } from "react";
import Link from "next/link";
import EventForm from "../components/EventForm";
import { SECTIONS } from "@/lib/constants";

export default function SubmitPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(values) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, section: SECTIONS.MEMBER }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-10 flex-1">
      <Link href="/" className="text-sm text-muted hover:text-plum-deep">
        ← Back to calendar
      </Link>
      <h1 className="font-heading text-4xl text-plum-deep mt-3 mb-1">Submit an event</h1>
      <p className="text-muted mb-8">
        Your event will appear under &quot;Member Hosted Events&quot; once submitted.
      </p>

      {done ? (
        <div className="rounded-2xl border border-gold/60 bg-white p-8">
          <p className="font-heading text-2xl text-plum-deep mb-2">You&apos;re all set!</p>
          <p className="text-muted mb-4">
            Your event is live on the calendar. Keep your passcode somewhere safe — you&apos;ll
            need it to edit or cancel this event later, via &quot;Manage this event&quot; on its
            card.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-plum-deep px-6 py-2 text-white hover:bg-plum transition"
          >
            View calendar
          </Link>
        </div>
      ) : (
        <EventForm
          mode="create-member"
          onSubmit={handleSubmit}
          submitLabel="Submit event"
          submitting={submitting}
          serverError={error}
        />
      )}
    </div>
  );
}
