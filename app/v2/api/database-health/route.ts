import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        status: "unauthorized",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const result = await supabase
    .from("investo_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (result.error) {
    return NextResponse.json(
      {
        application: "Investo",
        authentication: "verified",
        database: "unavailable",
        message: result.error.message,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      application: "Investo",
      authentication: "verified",
      database: "available",
      workspace: result.data ? "initialized" : "not_initialized",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
