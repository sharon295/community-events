"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { SECTIONS, SECTION_LABELS } from "@/lib/constants";
import EventCard from "./EventCard";
import CategoryFilter from "./CategoryFilter";
import ManageModal from "./ManageModal";

export default function CalendarClient() {
  const [section, setSection] = useState(SECTIONS.COLLECTIVE);
  const [category, setCategory] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managingEvent, setManagingEvent] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ section });
    if (category) params.set("category", category);
    const res = await fetch(`/api/events?${params}`);
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }, [section, category]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 flex-1">
      <header className="mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl text-plum-deep">The Collective</h1>
        <p className="text-muted mt-1">Events Calendar</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {Object.values(SECTIONS).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`rounded-full px-5 py-2 text-sm transition ${
                section === s
                  ? "bg-plum-deep text-white"
                  : "bg-white border border-mauve/50 text-plum-deep hover:border-plum-deep"
              }`}
            >
              {SECTION_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <CategoryFilter value={category} onChange={setCategory} />
          {section === SECTIONS.MEMBER && (
            <Link
              href="/submit"
              className="rounded-full bg-gold px-5 py-2 text-sm text-plum-deep hover:opacity-90 transition whitespace-nowrap"
            >
              Submit an event
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading events…</p>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mauve/50 bg-white/50 p-12 text-center">
          <p className="font-heading text-2xl text-plum-deep mb-2">
            No {SECTION_LABELS[section].toLowerCase()} right now
          </p>
          <p className="text-muted">
            {section === SECTIONS.MEMBER
              ? "Be the first to submit one!"
              : "Check back soon for upcoming events."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onManage={setManagingEvent} />
          ))}
        </div>
      )}

      {managingEvent && (
        <ManageModal
          event={managingEvent}
          onClose={() => setManagingEvent(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
