"use client";

import { useState } from "react";
import Link from "next/link";
import EventForm from "../components/EventForm";
import { SECTIONS } from "@/lib/constants";

// Deliberately not linked from the public nav — reachable only by URL,
// and every submission is checked against ADMIN_PASSWORD server-side.
export default function CollectiveAdminPage() {
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
        body: JSON.stringify({ ...values, section: SECTIONS.COLLECTIVE }),
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
      <h1 className="font-heading text-4xl text-plum-deep mt-3 mb-1">Post a Collective event</h1>
      <p className="text-muted mb-8">
        Requires the admin password. This posts under &quot;Collective Events&quot;.
      </p>

      {done ? (
        <div className="rounded-2xl border border-gold/60 bg-white p-8">
          <p className="font-heading text-2xl text-plum-deep mb-2">Posted!</p>
          <Link
            href="/"
            className="inline-block rounded-full bg-plum-deep px-6 py-2 text-white hover:bg-plum transition"
          >
            View calendar
          </Link>
        </div>
      ) : (
        <EventForm
          mode="create-collective"
          onSubmit={handleSubmit}
          submitLabel="Post event"
          submitting={submitting}
          serverError={error}
        />
      )}
    </div>
  );
}
