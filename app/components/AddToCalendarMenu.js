"use client";

import { useEffect, useRef, useState } from "react";

// Google/Yahoo want a compact UTC stamp: YYYYMMDDTHHMMSSZ
function formatCompactUtc(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Matches the fixed 1-hour duration used in the downloadable .ics file
// (lib/ics.js) — the event's actual end time isn't collected in the form.
const DURATION_MS = 60 * 60 * 1000;

export default function AddToCalendarMenu({ event }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  // The event card clips its own content (overflow-hidden, to round its
  // corners around the banner image), which would cut off a dropdown
  // positioned relative to it. Using position: fixed anchored to the
  // button's on-screen coordinates lets the menu escape that clipping.
  function toggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

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
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className="rounded-full border border-plum-deep px-4 py-1.5 text-sm text-plum-deep hover:bg-blush transition"
      >
        Add to calendar
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            style={{ position: "fixed", top: coords.top, left: coords.left }}
            className="z-50 w-52 overflow-hidden rounded-lg border border-mauve/40 bg-white shadow-lg"
          >
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
