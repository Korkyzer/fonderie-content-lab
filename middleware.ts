import { NextRequest, NextResponse } from "next/server";

const AUTH_BYPASS_ENABLED = process.env.AUTH_BYPASS === "true";

function hasSessionCookie(request: NextRequest) {
  return Boolean(
    request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value,
  );
}

export default function middleware(request: NextRequest) {
  if (AUTH_BYPASS_ENABLED) {
    return NextResponse.next();
  }

  const isLoggedIn = hasSessionCookie(request);
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
