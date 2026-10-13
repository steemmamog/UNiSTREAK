import { Pool } from "pg";

// Next.js re-runs modules on every hot reload in development. Without this,
// each save would create a brand new pool and leak connections. Keeping the
// pool on globalThis makes sure there is only ever one per process.
declare global {
  // eslint-disable-next-line no-var
  var __unistreakPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Check your .env.local file.");
  }

  const pool = new Pool({
    connectionString,
    max: 5, // serverless processes multiply, so each one stays small
    idleTimeoutMillis: 30_000, // close connections that sit unused
    connectionTimeoutMillis: 5_000, // give up if a connection cannot be made
  });

  // An idle connection can break (database restart, network drop). Without a
  // listener, that error would crash the whole process.
  pool.on("error", (err) => {
    console.error("Unexpected database pool error", err);
  });

  return pool;
}

// The pool is created on first use, not on import, so merely importing this
// file never fails when the environment is not ready (for example during a build).
export function getPool(): Pool {
  if (!globalThis.__unistreakPool) {
    globalThis.__unistreakPool = createPool();
  }
  return globalThis.__unistreakPool;
}