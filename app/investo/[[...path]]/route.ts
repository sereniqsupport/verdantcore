import { NextResponse, type NextRequest } from "next/server";

type InvestoPublicRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function buildInvestoDestination(
  request: NextRequest,
  pathSegments: string[] | undefined,
) {
  const destination = request.nextUrl.clone();
  const safeSegments = pathSegments ?? [];

  destination.pathname =
    safeSegments.length > 0
      ? `/v2/${safeSegments.map(encodeURIComponent).join("/")}`
      : "/v2";

  return destination;
}

export async function GET(
  request: NextRequest,
  context: InvestoPublicRouteContext,
) {
  const { path } = await context.params;

  return NextResponse.redirect(buildInvestoDestination(request, path), 307);
}

export async function HEAD(
  request: NextRequest,
  context: InvestoPublicRouteContext,
) {
  const { path } = await context.params;

  return NextResponse.redirect(buildInvestoDestination(request, path), 307);
}
