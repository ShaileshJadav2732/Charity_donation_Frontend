import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Create API slice with base configuration
export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
		prepareHeaders: (headers, { getState, endpoint }) => {
			console.log("prepareHeaders called for endpoint:", endpoint);

			// Only access token in browser environment
			if (typeof window !== "undefined") {
				// Get token from auth state
				const token = (getState() as RootState).auth.token;
				console.log(
					"Token from state:",
					token ? `${token.substring(0, 20)}...` : "No token"
				);

				// If token exists, add it to the headers
				if (token) {
					headers.set("authorization", `Bearer ${token}`);
					console.log("Authorization header set");
				} else {
					console.log("No token available, skipping authorization header");
				}
			}

			// Add content type header
			headers.set("Content-Type", "application/json");

			console.log("Final headers:", Object.fromEntries(headers.entries()));
			return headers;
		},
	}),
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
