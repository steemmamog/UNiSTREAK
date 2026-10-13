import { getPool } from "@/infrastructure/db/pool";

export const runtime = "nodejs"; // the pg driver needs Node, not the Edge runtime
export const dynamic = "force-dynamic"; // never cache a health check

export async function GET() {
  const startedAt = Date.now();

  try {
    const { rows } = await getPool().query<{ now: Date }>("SELECT now() AS now");
    return Response.json({
      status: "ok",
      database: "reachable",
      databaseTime: rows[0].now,
      responseMs: Date.now() - startedAt,
    });
  } catch (error) {
    // The details go to the server log, never to the caller.
    console.error("Health check failed", error);
    return Response.json(
      { status: "error", database: "unreachable" },
      { status: 503 }
    );
  }
}