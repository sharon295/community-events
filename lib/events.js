import { randomUUID } from "crypto";
import { query, ensureSchema } from "./db";
import { hashPasscode } from "./auth";
import { deleteUploadedImage } from "./uploads";
import { MAX_CATEGORY_TAGS, SECTIONS } from "./constants";

function rowToEvent(row) {
  return {
    id: row.id,
    section: row.section,
    title: row.title,
    description: row.description,
    bannerImageUrl: row.banner_image_url,
    eventAt: row.event_at instanceof Date ? row.event_at.toISOString() : row.event_at,
    timezone: row.timezone,
    locationType: row.location_type,
    locationText: row.location_text,
    eventLink: row.event_link,
    rsvpBy: row.rsvp_by,
    hostedBy: row.hosted_by,
    categoryTags: row.category_tags || [],
    hasPasscode: Boolean(row.passcode_hash),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listEvents({ section, category } = {}) {
  await ensureSchema();
  const conditions = ["event_at >= now()"];
  const params = [];

  if (section) {
    params.push(section);
    conditions.push(`section = $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`$${params.length} = ANY(category_tags)`);
  }

  const sql = `SELECT * FROM events WHERE ${conditions.join(" AND ")} ORDER BY event_at ASC`;
  const { rows } = await query(sql, params);
  return rows.map(rowToEvent);
}

export async function getEventRaw(id) {
  await ensureSchema();
  const { rows } = await query("SELECT * FROM events WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function getEvent(id) {
  const row = await getEventRaw(id);
  return row ? rowToEvent(row) : null;
}

function validate(data) {
  const errors = [];
  if (!data.title || !data.title.trim()) errors.push("Title is required.");
  if (!data.eventAtUtc) errors.push("Date, time, and timezone are required.");
  if (!data.timezone) errors.push("Timezone is required.");
  if (![SECTIONS.COLLECTIVE, SECTIONS.MEMBER].includes(data.section)) {
    errors.push("Invalid section.");
  }
  if (!["in_person", "virtual"].includes(data.locationType)) {
    errors.push("Location type is required.");
  }
  if (!data.hostedBy || !data.hostedBy.trim()) errors.push("Hosted-by name is required.");
  if (!Array.isArray(data.categoryTags) || data.categoryTags.length === 0) {
    errors.push("Pick at least one category tag.");
  }
  if (Array.isArray(data.categoryTags) && data.categoryTags.length > MAX_CATEGORY_TAGS) {
    errors.push(`Pick at most ${MAX_CATEGORY_TAGS} category tags.`);
  }
  if (data.eventLink && !/^https?:\/\//i.test(data.eventLink)) {
    errors.push("Event link must start with http:// or https://");
  }
  return errors;
}

export async function createEvent(data) {
  await ensureSchema();
  const errors = validate(data);
  if (errors.length) {
    const err = new Error(errors.join(" "));
    err.validation = errors;
    throw err;
  }

  const id = randomUUID();
  const passcodeHash = data.passcode ? await hashPasscode(data.passcode) : null;

  await query(
    `INSERT INTO events (
      id, section, title, description, banner_image_url, event_at, timezone,
      location_type, location_text, event_link, rsvp_by, hosted_by,
      category_tags, passcode_hash
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      id,
      data.section,
      data.title.trim(),
      data.description || "",
      data.bannerImageUrl || null,
      data.eventAtUtc,
      data.timezone,
      data.locationType,
      data.locationText || "",
      data.eventLink || null,
      data.rsvpBy || null,
      data.hostedBy.trim(),
      data.categoryTags,
      passcodeHash,
    ]
  );

  return getEvent(id);
}

export async function updateEvent(id, data) {
  await ensureSchema();
  const existing = await getEventRaw(id);
  if (!existing) return null;

  const errors = validate({ ...data, section: existing.section });
  if (errors.length) {
    const err = new Error(errors.join(" "));
    err.validation = errors;
    throw err;
  }

  // A new banner replaces the old file; only delete the old one once the
  // new row has been written successfully-ish (best effort here is fine,
  // an orphaned file on disk is harmless).
  if (data.bannerImageUrl && existing.banner_image_url && data.bannerImageUrl !== existing.banner_image_url) {
    deleteUploadedImage(existing.banner_image_url);
  }

  await query(
    `UPDATE events SET
      title = $1, description = $2, banner_image_url = $3, event_at = $4,
      timezone = $5, location_type = $6, location_text = $7, event_link = $8,
      rsvp_by = $9, hosted_by = $10, category_tags = $11, updated_at = now()
    WHERE id = $12`,
    [
      data.title.trim(),
      data.description || "",
      data.bannerImageUrl ?? existing.banner_image_url,
      data.eventAtUtc,
      data.timezone,
      data.locationType,
      data.locationText || "",
      data.eventLink || null,
      data.rsvpBy || null,
      data.hostedBy.trim(),
      data.categoryTags,
      id,
    ]
  );

  return getEvent(id);
}

export async function deleteEvent(id) {
  await ensureSchema();
  const existing = await getEventRaw(id);
  if (!existing) return false;
  await query("DELETE FROM events WHERE id = $1", [id]);
  if (existing.banner_image_url) deleteUploadedImage(existing.banner_image_url);
  return true;
}

// Deletes every event whose start time has already passed. Called by the
// daily Render Cron Job hitting /api/cron/expire, and as an in-process
// safety net (see lib/scheduler.js) for whenever the server happens to be
// awake between cron runs.
export async function expireEvents() {
  await ensureSchema();
  const { rows } = await query(
    "DELETE FROM events WHERE event_at < now() RETURNING id, banner_image_url"
  );
  for (const row of rows) {
    if (row.banner_image_url) deleteUploadedImage(row.banner_image_url);
  }
  return rows.map((r) => r.id);
}
