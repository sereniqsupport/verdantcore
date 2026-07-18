import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      application: "Investo",
      version: "v2",
      visibility: "private",
      executionMode: "human-approved",
      status: "operational",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
