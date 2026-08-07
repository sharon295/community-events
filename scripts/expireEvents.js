// Manual/local fallback for the daily cleanup — normally this happens via
// the Render Cron Job hitting POST /api/cron/expire on the live server
// (see README), which is what has access to the deployed image disk.
// Run this with `npm run expire-events`.
require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
  });
  const { rows } = await pool.query(
    "DELETE FROM events WHERE event_at < now() RETURNING id, title"
  );
  console.log(`Deleted ${rows.length} expired event(s).`);
  for (const row of rows) console.log(` - ${row.title} (${row.id})`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
