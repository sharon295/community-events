import { getEvent } from "@/lib/events";
import { buildIcsForEvent } from "@/lib/ics";

export async function GET(request, { params }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return new Response("Not found", { status: 404 });

  const icsBody = buildIcsForEvent({
    id: event.id,
    title: event.title,
    description: event.description,
    location_type: event.locationType,
    location_text: event.locationText,
    event_link: event.eventLink,
    hosted_by: event.hostedBy,
    event_at: event.eventAt,
  });

  const filename = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;

  return new Response(icsBody, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
