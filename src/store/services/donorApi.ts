import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../services/api.service";
import { getToken } from "../../utils/auth";

// Define a service using a base URL and expected endpoints
export const donorApi = createApi({
	reducerPath: "donorApi",
	baseQuery: fetchBaseQuery({
		baseUrl: `${API_URL}/api`,
		prepareHeaders: (headers) => {
			// Get the token from localStorage only on client side
			if (typeof window !== "undefined") {
				const token = getToken();

				// Log token presence for debugging
				console.log("donorApi: Token exists:", !!token);

				// If we have a token, set it in the Authorization header
				if (token) {
					headers.set("Authorization", `Bearer ${token}`);
				}
			}

			return headers;
		},
	}),
	tagTypes: ["DonorProfile"],
	endpoints: (builder) => ({
		// Get donor profile
		getDonorProfile: builder.query({
			query: () => ({
				url: "/donors/profile",
				// Add error handling for 404s (expected for new users)
				validateStatus: (response, result) => {
					return response.status === 200 || response.status === 404;
				},
			}),
			// Transform the response to handle 404s gracefully
			transformResponse: (response, meta) => {
				// If we got a 404, return an empty donor object
				if (meta?.response?.status === 404) {
					console.log("donorApi: 404 response transformed to empty donor");
					return { donor: null, message: "Donor profile not found" };
				}
				return response;
			},
			providesTags: ["DonorProfile"],
		}),

		// Complete donor profile
		completeDonorProfile: builder.mutation({
			query: (profileData) => ({
				url: "/donors/complete-profile",
				method: "POST",
				body: profileData,
			}),
			invalidatesTags: ["DonorProfile"],
		}),
	}),
});

export const { useGetDonorProfileQuery, useCompleteDonorProfileMutation } =
	donorApi;
