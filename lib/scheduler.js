import { expireEvents } from "./events";

const HOUR_MS = 60 * 60 * 1000;

// In-process safety net: if the server happens to be awake, sweep expired
// events hourly so they don't linger between daily cron runs. This is NOT
// the primary mechanism — Render's free/starter web services can sleep or
// restart, so the real guarantee comes from the external Render Cron Job
// calling POST /api/cron/expire once a day. See README for setup.
if (!globalThis.__collectiveExpireSchedulerStarted) {
  globalThis.__collectiveExpireSchedulerStarted = true;

  const run = () => {
    expireEvents().catch((err) => {
      console.error("[scheduler] expireEvents failed:", err.message);
    });
  };

  setTimeout(run, 15_000);
  setInterval(run, HOUR_MS);
}
