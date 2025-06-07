import {
	createApi,
	fetchBaseQuery,
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { clearCredentials } from "../slices/authSlice";
import AuthUtils from "@/utils/authUtils";

// Enhanced base query with authentication error handling
const baseQueryWithAuth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const baseQuery = fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL,
		prepareHeaders: async (headers) => {
			if (typeof window !== "undefined") {
				// Try to get a valid token (with automatic refresh if needed)
				const validToken = await AuthUtils.getValidToken();

				if (validToken) {
					headers.set("authorization", `Bearer ${validToken}`);
				}
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	});

	const result = await baseQuery(args, api, extraOptions);

	// Handle authentication errors
	if (result.error && result.error.status === 401) {
		// Clear credentials and redirect to login
		api.dispatch(clearCredentials());

		// Only redirect if we're in the browser and not on a public route
		if (typeof window !== "undefined") {
			const currentPath = window.location.pathname;
			const publicRoutes = [
				"/",
				"/login",
				"/signup",
				"/select-role",
				"/about",
				"/contact",
			];

			if (!publicRoutes.includes(currentPath)) {
				window.location.href = "/login";
			}
		}
	}

	return result;
};

// Create API slice with base configuration
export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: baseQueryWithAuth,
	tagTypes: [
		"User",
		"DonorProfile",
		"OrganizationProfile",
		"Dashboard",
		"Feedback",
		"Notifications",
		"Organizations",
		"AdminStats",
		"Donations",
		"Campaign",
		"Cause",
		"Profile",
		"Analytics",
	],
	endpoints: () => ({}),
});

export default apiSlice;
