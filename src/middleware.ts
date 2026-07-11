import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const pathname = request.nextUrl.pathname;
  const sessionUserId = request.cookies.get("tabletap_session_user_id")?.value;

  // Identify auth-required routes
  const isDashboardRoute = pathname.startsWith("/dashboard") || host.startsWith("dashboard.");
  const isAdminRoute = pathname.startsWith("/admin") || host.startsWith("admin.");

  // If session cookie is missing and route requires auth, redirect to main domain's sign-in
  if ((isDashboardRoute || isAdminRoute) && !sessionUserId) {
    const mainOrigin = request.nextUrl.origin.replace(/(dashboard\.|admin\.)/, "");
    return NextResponse.redirect(`${mainOrigin}/sign-in`);
  }

  // Handle subdomain rewrites
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
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api)(.*)"]
};
