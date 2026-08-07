import { createEvent } from "ics";
import { DateTime } from "luxon";

// Builds a working .ics file (as a string) for one event. Uses the stored
// UTC instant so the resulting file is correct regardless of which
// calendar app / timezone opens it.
export function buildIcsForEvent(event) {
  const dt = DateTime.fromISO(event.event_at, { zone: "utc" });

  const { error, value } = createEvent({
    start: [dt.year, dt.month, dt.day, dt.hour, dt.minute],
    startInputType: "utc",
    startOutputType: "utc",
    duration: { hours: 1 },
    title: event.title,
    description: event.description || "",
    location:
      event.location_type === "virtual" ? "Virtual" : event.location_text || "",
    url: event.event_link || undefined,
    organizer: { name: event.hosted_by || "The Collective" },
    uid: `${event.id}@possible-woman.com`,
  });

  if (error) throw error;
  return value;
}
