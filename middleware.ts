import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_ORIGIN = "https://alamatracks.serow.app";

export function middleware(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") {
    return NextResponse.next();
  }

  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const canonicalHost = new URL(CANONICAL_ORIGIN).host;

  if (host === canonicalHost) {
    return NextResponse.next();
  }

  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    CANONICAL_ORIGIN,
  );

  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
