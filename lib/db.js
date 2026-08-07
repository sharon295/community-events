import { Pool } from "pg";

let pool;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set.");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export function query(text, params) {
  return getPool().query(text, params);
}

let schemaReadyPromise;

// Idempotent table creation, run lazily on first query so there's no
// separate migration step to remember before deploying.
export function ensureSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY,
        section TEXT NOT NULL CHECK (section IN ('collective', 'member')),
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        banner_image_url TEXT,
        event_at TIMESTAMPTZ NOT NULL,
        timezone TEXT NOT NULL,
        location_type TEXT NOT NULL CHECK (location_type IN ('in_person', 'virtual')),
        location_text TEXT NOT NULL DEFAULT '',
        event_link TEXT,
        rsvp_by DATE,
        hosted_by TEXT NOT NULL,
        category_tags TEXT[] NOT NULL DEFAULT '{}',
        passcode_hash TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS events_section_idx ON events (section);
      CREATE INDEX IF NOT EXISTS events_event_at_idx ON events (event_at);
    `);
  }
  return schemaReadyPromise;
}
