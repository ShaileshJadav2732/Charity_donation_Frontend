import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../services/api.service";
import { getToken } from "@/utils/auth";

// Define types for donor profile data
export interface DonorProfileData {
	fullAddress: string;
	phone: string;
	profilePhoto?: string;
	donationPreferences: string[];
	availability: string;
}

export interface DonorResponse {
	donor: {
		_id: string;
		user: string;
		fullAddress: string;
		phone: string;
		profilePhoto?: string;
		donationPreferences: string[];
		availability: string;
		isProfileCompleted: boolean;
		createdAt: string;
		updatedAt: string;
	};
	message?: string;
}

// Create API service
export const donorApi = createApi({
	reducerPath: "donorApi",
	baseQuery: fetchBaseQuery({
		baseUrl: `${API_URL}/api`,
		prepareHeaders: (headers) => {
			// Get token from localStorage
			if (typeof window !== "undefined") {
				const token = getToken();
				if (token) {
					headers.set("authorization", `Bearer ${token}`);
				}
			}
			return headers;
		},
	}),
	tagTypes: ["DonorProfile"],
	endpoints: (builder) => ({
		// Get donor profile
		getDonorProfile: builder.query<DonorResponse, void>({
			query: () => `/donors/profile`,
			providesTags: ["DonorProfile"],
		}),

		// Complete donor profile
		completeDonorProfile: builder.mutation<DonorResponse, DonorProfileData>({
			query: (profileData) => ({
				url: `/donors/complete-profile`,
				method: "POST",
				body: profileData,
			}),
			invalidatesTags: ["DonorProfile"],
		}),

		// Update donor profile
		updateDonorProfile: builder.mutation<
			DonorResponse,
			Partial<DonorProfileData>
		>({
			query: (profileData) => ({
				url: `/donors/update-profile`,
				method: "PUT",
				body: profileData,
			}),
		}),
	}),
});

// Export hooks
export const {
	useGetDonorProfileQuery,
	useCompleteDonorProfileMutation,
	useUpdateDonorProfileMutation,
} = donorApi;
