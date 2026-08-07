import { DateTime } from "luxon";

// Combines a civil date + time entered in a specific IANA zone into a UTC
// instant to store in the database. This is the one place we need real
// timezone-arithmetic (native Date can't reliably do "6pm in Denver").
export function localToUtcIso(dateStr, timeStr, zone) {
  const dt = DateTime.fromISO(`${dateStr}T${timeStr}`, { zone });
  if (!dt.isValid) {
    throw new Error(`Invalid date/time/timezone: ${dt.invalidReason}`);
  }
  return dt.toUTC().toISO();
}

// Splits a stored UTC ISO instant back into the {date, time} pair for a
// given zone, used to prefill the edit form with the organizer's original
// local values.
export function utcIsoToLocalParts(utcIso, zone) {
  const dt = DateTime.fromISO(utcIso, { zone: "utc" }).setZone(zone);
  return {
    date: dt.toFormat("yyyy-MM-dd"),
    time: dt.toFormat("HH:mm"),
  };
}
