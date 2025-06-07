import { NextRequest, NextResponse } from "next/server";

// Import route configurations
// const PUBLIC_ROUTES = ["/", "/login", "/signup", "/select-role"];

const AUTH_ROUTES_ALLOW_INCOMPLETE = ["/complete-profile"];

const PROTECTED_ROUTES = ["/dashboard"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Get auth token from cookies
	const authToken = request.cookies.get("authToken")?.value;

	// Check if current path is public
	// const isPublicRoute = PUBLIC_ROUTES.some(
	// 	(route) => pathname === route || pathname.startsWith(route + "/")
	// );

	// Check if current path allows incomplete profiles
	const isAuthRouteAllowIncomplete = AUTH_ROUTES_ALLOW_INCOMPLETE.some(
		(route) => pathname === route || pathname.startsWith(route + "/")
	);

	// Check if current path requires completed profile
	const isProtectedRoute = PROTECTED_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(route + "/")
	);

	// If no auth token and trying to access protected routes
	if (!authToken && (isProtectedRoute || isAuthRouteAllowIncomplete)) {
		const loginUrl = new URL("/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	// If has auth token and trying to access login/signup page, redirect to dashboard
	if (authToken && (pathname === "/login" || pathname === "/signup")) {
		const dashboardUrl = new URL("/dashboard/home", request.url);
		return NextResponse.redirect(dashboardUrl);
	}

	// Allow the request to continue
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (images, etc.)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
