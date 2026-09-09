import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pool } from '../shared/db/pool';

const MIGRATIONS_DIR = resolve(__dirname, '../../db/migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function getApplied(): Promise<Set<string>> {
  const { rows } = await pool.query<{ name: string }>('SELECT name FROM schema_migrations');
  return new Set(rows.map((row) => row.name));
}

async function run() {
  await ensureMigrationsTable();
  const applied = await getApplied();

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const pending = files.filter((file) => !applied.has(file));

  if (pending.length === 0) {
    console.log('[migrate] nothing to apply, database is up to date');
    return;
  }

  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      // Each migration is atomic: a failure halfway through leaves no partial schema.
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`[migrate] applied ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`[migrate] failed on ${file}`);
      throw error;
    } finally {
      client.release();
    }
  }

  console.log(`[migrate] done, ${pending.length} migration(s) applied`);
}

run()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
