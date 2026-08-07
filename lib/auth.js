import crypto from "crypto";
import bcrypt from "bcryptjs";

export function checkAdminPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== "string" || candidate.length === 0) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function checkCronSecret(candidate) {
  const expected = process.env.CRON_SECRET;
  if (!expected || typeof candidate !== "string" || candidate.length === 0) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function hashPasscode(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPasscode(plain, hash) {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}

// True if `candidate` unlocks management of `event` — either the admin
// password, or (when the event has one) the passcode its submitter set.
export async function canManageEvent(event, candidate) {
  if (typeof candidate !== "string" || candidate.length === 0) return false;
  if (checkAdminPassword(candidate)) return true;
  if (event.passcode_hash) return verifyPasscode(candidate, event.passcode_hash);
  return false;
}
