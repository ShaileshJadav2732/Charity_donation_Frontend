import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Create API slice with base configuration
export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
		prepareHeaders: (headers, { getState }) => {
			// Only access token in browser environment
			if (typeof window !== "undefined") {
				// Get token from auth state
				const token = (getState() as RootState).auth.token;

				// If token exists, add it to the headers
				if (token) {
					headers.set("authorization", `Bearer ${token}`);
				}
			}

			// Add content type header
			headers.set("Content-Type", "application/json");

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
	],
	endpoints: () => ({}),
});

// Log the API URL for debugging
console.log(
	"API URL:",
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
);

export default apiSlice;
