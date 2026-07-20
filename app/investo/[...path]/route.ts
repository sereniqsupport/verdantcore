import { NextResponse, type NextRequest } from "next/server";

type InvestoSubrouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function buildPrivateDestination(request: NextRequest, pathSegments: string[]) {
  const destination = request.nextUrl.clone();

  destination.pathname = `/v2/${pathSegments
    .map(encodeURIComponent)
    .join("/")}`;

  return destination;
}

export async function GET(
  request: NextRequest,
  context: InvestoSubrouteContext,
) {
  const { path } = await context.params;

  return NextResponse.redirect(buildPrivateDestination(request, path), 307);
}

export async function HEAD(
  request: NextRequest,
  context: InvestoSubrouteContext,
) {
  const { path } = await context.params;

  return NextResponse.redirect(buildPrivateDestination(request, path), 307);
}
