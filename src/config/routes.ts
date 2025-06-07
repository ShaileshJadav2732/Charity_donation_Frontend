// Route configuration for the application

export const ROUTES = {
	// Public routes
	HOME: "/",
	LOGIN: "/login",
	SIGNUP: "/signup",
	SELECT_ROLE: "/select-role",

	// Auth routes (require authentication but allow incomplete profiles)
	COMPLETE_PROFILE: "/complete-profile",

	// Protected routes (require authentication and completed profile)
	DASHBOARD: {
		HOME: "/dashboard/home",
		CAUSES: "/dashboard/causes",
		DONATIONS: "/dashboard/donations",
		CAMPAIGNS: "/dashboard/campaigns",
		DONORS: "/dashboard/donors",
		MESSAGES: "/dashboard/messages",
		ANALYTICS: "/dashboard/analytics",
		PROFILE: "/dashboard/profile",
	},
} as const;

// Route arrays for middleware and guards
export const PUBLIC_ROUTES = [
	ROUTES.HOME,
	ROUTES.LOGIN,
	ROUTES.SIGNUP,
	ROUTES.SELECT_ROLE,
];

export const AUTH_ROUTES_ALLOW_INCOMPLETE = [ROUTES.COMPLETE_PROFILE];

export const PROTECTED_ROUTES = ["/dashboard"];

// Helper functions
export const isPublicRoute = (pathname: string): boolean => {
	return PUBLIC_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(route + "/")
	);
};

export const isAuthRouteAllowIncomplete = (pathname: string): boolean => {
	return AUTH_ROUTES_ALLOW_INCOMPLETE.some(
		(route) => pathname === route || pathname.startsWith(route + "/")
	);
};

export const isProtectedRoute = (pathname: string): boolean => {
	return PROTECTED_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(route + "/")
	);
};

export const getDefaultDashboardRoute = (
	userRole: "donor" | "organization"
): string => {
	return ROUTES.DASHBOARD.HOME;
};

export const getRedirectAfterLogin = (
	userRole: "donor" | "organization",
	profileCompleted: boolean
): string => {
	if (!profileCompleted) {
		return ROUTES.COMPLETE_PROFILE;
	}
	return getDefaultDashboardRoute(userRole);
};
