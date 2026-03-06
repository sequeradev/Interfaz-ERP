import sql from "@/src/lib/db";

export async function GET() {
  try {
    const result = await sql`SELECT NOW()`;

    return Response.json({ success: true, result });
  } catch (error) {
    console.error("Database connection failed:", error);

    return Response.json(
      {
        success: false,
        error: "Database is not reachable. Check DATABASE_URL and Neon status."
      },
      { status: 500 }
    );
  }
}
