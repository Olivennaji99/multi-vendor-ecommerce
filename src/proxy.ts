import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const ADMIN_PREFIX = "/admin";
const SELLER_PREFIX = "/seller";
const CUSTOMER_AUTH_PREFIXES = ["/cart", "/checkout", "/wishlist", "/account", "/orders"];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const isSellerRoute = pathname.startsWith(SELLER_PREFIX);
  const isCustomerAuthRoute = CUSTOMER_AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isProtectedRoute = isAdminRoute || isSellerRoute || isCustomerAuthRoute;

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isSellerRoute && session?.user.role !== "SELLER") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    session?.user.role === "SELLER" &&
    session.user.mustChangePassword &&
    pathname !== "/force-password-change"
  ) {
    return NextResponse.redirect(new URL("/force-password-change", request.url));
  }

  return NextResponse.next();
});

export const config = {
  // Broad matcher (rather than just the protected prefixes referenced above) so the
  // mustChangePassword redirect below still fires no matter which page a seller lands
  // on after login (e.g. "/" is the default post-login redirect and isn't one of the
  // explicitly protected prefixes).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|uploads).*)"],
};
