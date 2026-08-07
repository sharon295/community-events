import { NextResponse } from "next/server";
import { listEvents, createEvent } from "@/lib/events";
import { checkAdminPassword } from "@/lib/auth";
import { localToUtcIso } from "@/lib/timezone";
import { SECTIONS } from "@/lib/constants";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") || undefined;
  const category = searchParams.get("category") || undefined;

  try {
    const events = await listEvents({ section, category });
    return NextResponse.json({ events });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load events." }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();

  if (body.section === SECTIONS.COLLECTIVE) {
    if (!checkAdminPassword(body.adminPassword)) {
      return NextResponse.json({ error: "Incorrect admin password." }, { status: 401 });
    }
  } else if (!body.passcode || !body.passcode.trim()) {
    return NextResponse.json(
      { error: "Set a passcode so you can edit this event later." },
      { status: 400 }
    );
  }

  try {
    const eventAtUtc = localToUtcIso(body.date, body.time, body.timezone);
    const event = await createEvent({
      section: body.section === SECTIONS.COLLECTIVE ? SECTIONS.COLLECTIVE : SECTIONS.MEMBER,
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
      passcode: body.passcode || null,
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to create event." }, { status: 400 });
  }
}
