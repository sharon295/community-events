"use client";

import { useState } from "react";

// Google/Yahoo want a compact UTC stamp: YYYYMMDDTHHMMSSZ
function formatCompactUtc(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Matches the fixed 1-hour duration used in the downloadable .ics file
// (lib/ics.js) — the event's actual end time isn't collected in the form.
const DURATION_MS = 60 * 60 * 1000;

export default function AddToCalendarMenu({ event }) {
  const [open, setOpen] = useState(false);

  const start = new Date(event.eventAt);
  const end = new Date(start.getTime() + DURATION_MS);
  const location = event.locationType === "virtual" ? "Virtual" : event.locationText || "";
  const details = event.description || "";

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${formatCompactUtc(start)}/${formatCompactUtc(end)}&details=${encodeURIComponent(
    details
  )}&location=${encodeURIComponent(location)}`;

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${start.toISOString()}&enddt=${end.toISOString()}&subject=${encodeURIComponent(
    event.title
  )}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

  const yahooUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(
    event.title
  )}&st=${formatCompactUtc(start)}&dur=0100&desc=${encodeURIComponent(
    details
  )}&in_loc=${encodeURIComponent(location)}`;

  const icsUrl = `/api/events/${event.id}/ics`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-plum-deep px-4 py-1.5 text-sm text-plum-deep hover:bg-blush transition"
      >
        Add to calendar
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-lg border border-mauve/40 bg-white shadow-lg">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-plum-deep hover:bg-blush"
              onClick={() => setOpen(false)}
            >
              Google Calendar
            </a>
            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-plum-deep hover:bg-blush"
              onClick={() => setOpen(false)}
            >
              Outlook.com
            </a>
            <a
              href={yahooUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-plum-deep hover:bg-blush"
              onClick={() => setOpen(false)}
            >
              Yahoo Calendar
            </a>
            <a
              href={icsUrl}
              className="block px-4 py-2 text-sm text-plum-deep hover:bg-blush"
              onClick={() => setOpen(false)}
            >
              Apple / other (.ics file)
            </a>
          </div>
        </>
      )}
    </div>
  );
}
