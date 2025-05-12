import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Types
export interface DonorStats {
	totalDonations: number;
	causesSupported: number;
	impactScore: number;
	organizationsSupported: number;
	recentDonations: Donation[];
}

export interface OrganizationStats {
	totalFundsRaised: number;
	activeCampaigns: number;
	totalDonors: number;
	successRate: number;
	recentDonations: Donation[];
}

export interface Donation {
	id: string;
	cause: {
		id: string;
		title: string;
		category: string;
		image: string;
	};
	amount: number;
	date: string;
	status: "completed" | "pending" | "failed";
	impact: string;
	donor?: {
		id: string;
		name: string;
		email: string;
	};
	organization?: {
		id: string;
		name: string;
		email: string;
	};
}

export interface DashboardResponse {
	success: boolean;
	data: {
		donorStats?: DonorStats;
		organizationStats?: OrganizationStats;
		recentDonations: Donation[];
	};
	message?: string;
}

export interface AnalyticsResponse {
	success: boolean;
	data: {
		monthlyDonations: { month: string; amount: number }[];
		categoryDistribution: { category: string; amount: number }[];
	};
	message?: string;
}

// Create API
export const dashboardApi = createApi({
	reducerPath: "dashboardApi",
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
	tagTypes: ["Dashboard"],
	endpoints: (builder) => ({
		// Get donor dashboard stats
		getDonorStats: builder.query<DonorStats, void>({
			query: () => ({
				url: "/dashboard/donor/stats",
				method: "GET",
			}),
			transformResponse: (response: DashboardResponse) => response.data.donorStats!,
			providesTags: ["Dashboard"],
		}),

		// Get organization dashboard stats
		getOrganizationStats: builder.query<OrganizationStats, void>({
			query: () => ({
				url: "/dashboard/organization/stats",
				method: "GET",
			}),
			transformResponse: (response: DashboardResponse) => response.data.organizationStats!,
			providesTags: ["Dashboard"],
		}),

		// Get recent donations
		getRecentDonations: builder.query<Donation[], void>({
			query: () => ({
				url: "/dashboard/recent-donations",
				method: "GET",
			}),
			transformResponse: (response: DashboardResponse) => response.data.recentDonations,
			providesTags: ["Dashboard"],
		}),

		// Get donation analytics
		getDonationAnalytics: builder.query<{
			monthlyDonations: { month: string; amount: number }[];
			categoryDistribution: { category: string; amount: number }[];
		}, void>({
			query: () => ({
				url: "/dashboard/analytics",
				method: "GET",
			}),
			transformResponse: (response: AnalyticsResponse) => response.data,
			providesTags: ["Dashboard"],
		}),
	}),
});

// Export hooks
export const {
	useGetDonorStatsQuery,
	useGetOrganizationStatsQuery,
	useGetRecentDonationsQuery,
	useGetDonationAnalyticsQuery,
} = dashboardApi;
