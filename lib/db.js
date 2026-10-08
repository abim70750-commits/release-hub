import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'release-hub.db');

let db = null;

export function getDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS releases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      changelog TEXT NOT NULL DEFAULT '',
      abi TEXT NOT NULL DEFAULT 'armeabi-v7a + arm64-v8a + x86_64',
      download_url TEXT NOT NULL,
      repo TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      source TEXT NOT NULL DEFAULT 'manual',
      external_id TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_releases_published ON releases(published_at DESC);
  `);

  // Migration for existing DBs — safe to run every start.
  for (const ddl of [
    "ALTER TABLE releases ADD COLUMN source TEXT NOT NULL DEFAULT 'manual'",
    "ALTER TABLE releases ADD COLUMN external_id TEXT"
  ]) {
    try { db.exec(ddl); } catch { /* column already exists */ }
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_gh_external
      ON releases(source, external_id)
      WHERE external_id IS NOT NULL;
  `);

  return db;
}
