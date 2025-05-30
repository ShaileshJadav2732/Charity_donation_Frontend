import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Create API slice with base configuration
export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL,
		prepareHeaders: (headers, { getState }) => {
			if (typeof window !== "undefined") {
				const token = (getState() as RootState).auth.token;

				if (token) {
					headers.set("authorization", `Bearer ${token}`);
				}
			}
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
		"Campaign",
		"Cause",
		"Profile",
		"Analytics",
	],
	endpoints: () => ({}),
});

export default apiSlice;
