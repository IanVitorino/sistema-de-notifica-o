import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { getToken } from "next-auth/jwt";

let defaultLocale = "pt-br";
let locales = ["pt-br", "en", "bn", "ar"];

// Get the preferred locale, similar to above or using a library
function getLocale(request: Request) {
  const acceptedLanguage = request.headers.get("accept-language") ?? undefined;
  let headers = { "accept-language": acceptedLanguage };
  let languages = new Negotiator({ headers }).languages();

  return match(languages, locales, defaultLocale); // -> 'en-US'
}

export async function middleware(request: any) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(
      new URL(`/${locale}/${pathname}`, request.url)
    );
  }

  // Authentication check
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Public paths that don't require authentication
  const isAuthPage = pathname.includes('/auth/');
  const isPublicPath = pathname.includes('/api/auth') || isAuthPage;

  // If user is not logged in and trying to access protected route
  if (!token && !isPublicPath) {
    const locale = locales.find(l => pathname.startsWith(`/${l}/`)) || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (token && isAuthPage) {
    const locale = locales.find(l => pathname.startsWith(`/${l}/`)) || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, assets, api)
    //"/((?!api|assets|.*\\..*|_next).*)",
    "/((?!api|assets|docs|.*\\..*|_next).*)",
    // Optional: only run on root (/) URL
  ],
};
