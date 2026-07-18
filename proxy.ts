import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function hasSupabaseConfiguration() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isInvestoRoute = pathname === "/v2" || pathname.startsWith("/v2/");
  const isLoginRoute = pathname === "/v2/login";
  const isCallbackRoute = pathname.startsWith("/v2/auth/callback");
  const isHealthRoute = pathname.startsWith("/v2/api/health");

  if (!isInvestoRoute || isCallbackRoute || isHealthRoute) {
    return NextResponse.next();
  }

  if (!hasSupabaseConfiguration()) {
    if (isLoginRoute) {
      return NextResponse.next();
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/v2/login";
    loginUrl.searchParams.set("configuration", "missing");

    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({
            request,
          });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLoginRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/v2/login";
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginRoute) {
    const investoUrl = request.nextUrl.clone();
    investoUrl.pathname = "/v2";
    investoUrl.search = "";

    return NextResponse.redirect(investoUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/v2",
    "/v2/:path*",
  ],
};
