"use client";

import { useState } from "react";
import EventForm from "./EventForm";

export default function ManageModal({ event, onClose, onChanged }) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [prefill, setPrefill] = useState(null); // set once verified
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      const res = await fetch(`/api/events/${event.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "That code didn't work.");
        return;
      }
      setPrefill(data.event);
    } finally {
      setVerifying(false);
    }
  }

  async function handleSave(values) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save changes.");
        return;
      }
      onChanged();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelEvent() {
    if (!confirm("Cancel and permanently delete this event?")) return;
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't cancel this event.");
        return;
      }
      onChanged();
      onClose();
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-deep/60 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-heading text-2xl text-plum-deep">
            {prefill ? `Manage: ${event.title}` : "Manage this event"}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-plum-deep" aria-label="Close">
            ✕
          </button>
        </div>

        {!prefill ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              Enter this event&apos;s passcode (or the admin password) to edit or cancel it.
            </p>
            <input
              type="password"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-mauve/50 px-3 py-2"
              placeholder="Passcode"
            />
            {error && <p className="text-sm text-muted">{error}</p>}
            <button
              type="submit"
              disabled={verifying}
              className="self-start rounded-full bg-plum-deep px-6 py-2 text-white hover:bg-plum transition disabled:opacity-50"
            >
              {verifying ? "Checking…" : "Continue"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <EventForm
              mode="edit"
              initialValues={prefill}
              onSubmit={handleSave}
              submitLabel="Save changes"
              submitting={saving}
              serverError={error}
            />
            <div className="border-t border-mauve/30 pt-4">
              <button
                type="button"
                onClick={handleCancelEvent}
                disabled={cancelling}
                className="rounded-full border border-muted px-6 py-2 text-sm text-muted hover:bg-blush transition disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel this event"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
