import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import type {
	DonorProfileFormData,
	OrganizationProfileFormData,
} from "@/types";

interface DonorProfile {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	avatar?: string;
	phoneNumber?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	bio?: string;
	joinDate: string;
	stats: {
		totalDonations: number;
		activeCauses: number;
		impactScore: number;
	};
}

interface OrganizationProfile {
	_id: string;
	name: string;
	email: string;
	description: string;
	phoneNumber?: string;
	website?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	avatar?: string;
	joinDate: string;
}

interface Donation {
	_id: string;
	cause: string;
	amount: number;
	date: string;
	status: "pending" | "completed" | "cancelled";
}

interface ProfileResponse {
	profile: DonorProfile;
	recentDonations: Donation[];
}

// Define profile API endpoints
export const profileApi = createApi({
	reducerPath: "profileApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth.token;
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ["Profile", "Donations", "OrganizationProfile"],
	endpoints: (builder) => ({
		// Complete donor profile
		completeDonorProfile: builder.mutation<
			{ message: string; profile: DonorProfile },
			DonorProfileFormData
		>({
			query: (profileData) => ({
				url: "/profile/donor",
				method: "POST",
				body: profileData,
			}),
			invalidatesTags: ["Profile"],
		}),

		// Get donor profile
		getDonorProfile: builder.query<ProfileResponse, void>({
			query: () => "/profile/donor",
			providesTags: ["Profile"],
		}),

		// Complete organization profile
		completeOrganizationProfile: builder.mutation<
			{ message: string; profile: OrganizationProfile },
			OrganizationProfileFormData
		>({
			query: (profileData) => ({
				url: "/profile/organization",
				method: "POST",
				body: profileData,
			}),
			invalidatesTags: ["OrganizationProfile"],
		}),

		// Get organization profile
		getOrganizationProfile: builder.query<
			{ profile: OrganizationProfile },
			void
		>({
			query: () => ({
				url: "/profile/organization",
				method: "GET",
			}),
			providesTags: ["OrganizationProfile"],
		}),

		// Update donor profile
		updateDonorProfile: builder.mutation<DonorProfile, Partial<DonorProfile>>({
			query: (data) => ({
				url: "/profile/donor",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Profile"],
		}),

		// Update organization profile
		updateOrganizationProfile: builder.mutation<
			{ message: string; profile: OrganizationProfile },
			Partial<OrganizationProfile>
		>({
			query: (data) => ({
				url: "/profile/organization",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["OrganizationProfile"],
		}),

		uploadProfileImage: builder.mutation<{ profileImage: string }, FormData>({
			query: (formData) => ({
				url: "/profile/donor/avatar",
				method: "POST",
				body: formData,
			}),
			invalidatesTags: ["Profile"],
		}),
	}),
});

export const {
	useCompleteDonorProfileMutation,
	useGetDonorProfileQuery,
	useCompleteOrganizationProfileMutation,
	useGetOrganizationProfileQuery,
	useUpdateDonorProfileMutation,
	useUpdateOrganizationProfileMutation,
	useUploadProfileImageMutation,
} = profileApi;
