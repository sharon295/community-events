"use client";

import { useEffect, useState } from "react";

// Renders the viewer's local date/time for a UTC instant, plus a note of
// the timezone the organizer originally entered it in. Computed client-side
// only (after mount) since "viewer's local timezone" is a browser fact the
// server can't know — avoids a server/client render mismatch.
export default function EventDateTime({ eventAt, timezone }) {
  const [text, setText] = useState(null);

  useEffect(() => {
    const date = new Date(eventAt);
    const local = date.toLocaleString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    let originalNote = "";
    try {
      const originalTzShort = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "short",
      })
        .formatToParts(date)
        .find((p) => p.type === "timeZoneName")?.value;

      const viewerTzShort = new Intl.DateTimeFormat("en-US", {
        timeZoneName: "short",
      })
        .formatToParts(date)
        .find((p) => p.type === "timeZoneName")?.value;

      if (originalTzShort && originalTzShort !== viewerTzShort) {
        originalNote = ` (${originalTzShort})`;
      }
    } catch {
      // Intl quirk on an unusual zone string — just skip the note.
    }

    setText(`${local}${originalNote}`);
  }, [eventAt, timezone]);

  return <p className="text-sm text-plum">{text || "Loading date…"}</p>;
}
