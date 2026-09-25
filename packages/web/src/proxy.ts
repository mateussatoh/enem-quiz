import { NextResponse, type NextRequest } from "next/server";

/**
 * Exposes the requested admin path to Server Components, so the admin layout can send an
 * unauthenticated visitor to the login and back to the page they asked for.
 * Authentication itself is not decided here.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/admin/:path*"] };
