import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const pathname = request.nextUrl.pathname;

  if (host.startsWith("menu.") && !pathname.startsWith("/menu")) {
    const url = request.nextUrl.clone();
    url.pathname = `/menu${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (host.startsWith("dashboard.") && !pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = `/dashboard${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  if (host.startsWith("admin.") && !pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // APIs remain shared across all hosts; only page requests are subdomain-rewritten.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
