import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
import { Client } from "pg";

config({ path: ".env.local" });

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

type AppliedMigration = { name: string; checksum: string };

// A fingerprint of the file's contents. Line endings are normalised first so
// the same file gives the same fingerprint on Windows (CRLF) and Linux (LF).
function checksumOf(sql: string): string {
  const normalised = sql.replace(/\r\n/g, "\n");
  return createHash("sha256").update(normalised).digest("hex");
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Check your .env.local file.");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    // 1. The history table: one row per migration that has run.
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       text PRIMARY KEY,
        checksum   text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // 2. The migration files on disk, in order (0001 before 0002, and so on).
    const files = (await readdir(MIGRATIONS_DIR))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // 3. What the database says has already run.
    const { rows: applied } = await client.query<AppliedMigration>(
      "SELECT name, checksum FROM schema_migrations ORDER BY name"
    );
    const appliedNames = new Set(applied.map((m) => m.name));

    // 4. History must be intact: nothing deleted, nothing edited.
    for (const migration of applied) {
      if (!files.includes(migration.name)) {
        throw new Error(
          `Applied migration "${migration.name}" is missing from the migrations folder.`
        );
      }
      const sql = await readFile(path.join(MIGRATIONS_DIR, migration.name), "utf8");
      if (checksumOf(sql) !== migration.checksum) {
        throw new Error(
          `Applied migration "${migration.name}" was edited after it ran. ` +
            `Never edit an applied migration; write a new one instead.`
        );
      }
    }

    // 5. Run whatever has not run yet, each one all-or-nothing.
    const pending = files.filter((file) => !appliedNames.has(file));
    if (pending.length === 0) {
      console.log("Nothing to do. Database is up to date.");
      return;
    }

    for (const name of pending) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, name), "utf8");
      console.log(`Applying ${name} ...`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)",
          [name, checksumOf(sql)]
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        const reason = err instanceof Error ? err.message : String(err);
        throw new Error(`Migration ${name} failed and was rolled back: ${reason}`);
      }
    }

    console.log(`Done. Applied ${pending.length} migration(s).`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
