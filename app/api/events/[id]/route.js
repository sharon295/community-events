import { NextResponse } from "next/server";
import { getEventRaw, updateEvent, deleteEvent } from "@/lib/events";
import { canManageEvent } from "@/lib/auth";
import { localToUtcIso } from "@/lib/timezone";

export async function GET(request, { params }) {
  const { id } = await params;
  const row = await getEventRaw(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { passcode_hash, ...safe } = row;
  return NextResponse.json({ event: safe });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const row = await getEventRaw(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = await canManageEvent(row, body.code);
  if (!allowed) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }

  try {
    const eventAtUtc = localToUtcIso(body.date, body.time, body.timezone);
    const event = await updateEvent(id, {
      title: body.title,
      description: body.description,
      bannerImageUrl: body.bannerImageUrl,
      eventAtUtc,
      timezone: body.timezone,
      locationType: body.locationType,
      locationText: body.locationText,
      eventLink: body.eventLink,
      rsvpBy: body.rsvpBy || null,
      hostedBy: body.hostedBy,
      categoryTags: body.categoryTags || [],
    });
    return NextResponse.json({ event });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to update event." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const row = await getEventRaw(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = await canManageEvent(row, body.code);
  if (!allowed) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }

  await deleteEvent(id);
  return NextResponse.json({ ok: true });
}
