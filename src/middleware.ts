import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
	"/dashboard/home",
	"/complete-profile",
	"/dashboard/profile",
	"/dashboard/donations",
	"/dashboard/donations/new",
	"/dashboard/donors",
	"/dashboard/organizations",
	"/dashboard/causes",
	"/dashboard/campaigns",
	"/dashboard/reports",
];
const publicRoutes = ["/", "/login", "/signup", "/select-role"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	console.log(`Middleware: Processing request for ${pathname}`);

	// Get token from cookies
	const token = request.cookies.get("token")?.value;
	const authToken = request.cookies.get("authToken")?.value;

	// Use either token, with preference for the JWT token
	const activeToken = token || authToken;

	console.log(`Middleware: Token ${activeToken ? "present" : "missing"}`);

	// Check if the route is protected
	if (protectedRoutes.some((route) => pathname.startsWith(route))) {
		if (!activeToken) {
			console.log(
				`Middleware: Token missing for ${pathname}, redirecting to /login`
			);
			return NextResponse.redirect(new URL("/login", request.url));
		}

		// For performance reasons, we'll just check if the token exists
		// The actual verification will happen in the API calls
		console.log(`Middleware: Token exists for ${pathname}, allowing access`);
		return NextResponse.next();
	}

	// Check if user is already logged in and trying to access public routes
	if (publicRoutes.some((route) => pathname === route) && activeToken) {
		// For login and select-role pages, redirect to dashboard if already logged in
		// Explicitly exclude signup page from this redirect
		if (["/login", "/select-role"].includes(pathname)) {
			console.log(
				`Middleware: User already logged in, redirecting from ${pathname} to /dashboard`
			);
			return NextResponse.redirect(
				new URL("/dashboard/campaigns", request.url)
			);
		}
	}

	console.log(`Middleware: Allowing access to ${pathname}`);
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/",
		"/login",
		"/signup",
		"/select-role",
		"/dashboard/:path*",
		"/complete-profile",
	],
};
