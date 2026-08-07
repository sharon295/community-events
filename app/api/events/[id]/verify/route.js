import { NextResponse } from "next/server";
import { getEventRaw } from "@/lib/events";
import { canManageEvent } from "@/lib/auth";
import { utcIsoToLocalParts } from "@/lib/timezone";

// Checks a passcode/admin-password against one event and, if it matches,
// returns the full editable fields for prefilling the manage form. Doesn't
// issue a session — the caller re-sends the same code on the follow-up
// PATCH/DELETE, which keeps this stateless.
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const row = await getEventRaw(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = await canManageEvent(row, body.code);
  if (!allowed) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }

  const { date, time } = utcIsoToLocalParts(row.event_at, row.timezone);

  return NextResponse.json({
    event: {
      id: row.id,
      section: row.section,
      title: row.title,
      description: row.description,
      bannerImageUrl: row.banner_image_url,
      date,
      time,
      timezone: row.timezone,
      locationType: row.location_type,
      locationText: row.location_text,
      eventLink: row.event_link,
      rsvpBy: row.rsvp_by,
      hostedBy: row.hosted_by,
      categoryTags: row.category_tags || [],
    },
  });
}
