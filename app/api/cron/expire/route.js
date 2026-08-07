import { NextResponse } from "next/server";
import { expireEvents } from "@/lib/events";
import { checkCronSecret } from "@/lib/auth";

// Triggered daily by a Render Cron Job (see README) so expired events get
// deleted reliably even if the web service is asleep or no one has visited
// the site that day. Also runs in-process on an hourly timer as a backup —
// see lib/scheduler.js — but that only helps while the server is awake.
export async function POST(request) {
  const secret = request.headers.get("x-cron-secret");
  if (!checkCronSecret(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deletedIds = await expireEvents();
  return NextResponse.json({ deleted: deletedIds.length, ids: deletedIds });
}
