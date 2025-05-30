import { apiSlice } from "./apiSlice";

export interface DashboardStats {
	totalDonations: number;
	donationGrowth: number;
	causesSupported: number;
	activeCategories: number;
	impactScore: number;
	impactPercentile: number;
	organizationsCount: number;
	supportingOrganizations: number;
	totalDonationCount: number;
}

export interface OrganizationStats {
	donations: {
		totalAmount: number;
		totalDonations: number;
		averageDonation: number;
	};
	campaigns: {
		totalCampaigns: number;
		activeCampaigns: number;
		totalTargetAmount: number;
		totalRaisedAmount: number;
		achievementRate: number;
	};
	causes: {
		totalCauses: number;
		totalTargetAmount: number;
		totalRaisedAmount: number;
		achievementRate: number;
	};
	feedback: {
		totalFeedback: number;
		averageRating: number;
		ratingDistribution: { [key: string]: number };
	};
}

export interface ChartData {
	monthlyTrends: {
		month: string;
		amount: number;
		count: number;
	}[];
	donationsByType: {
		type: string;
		count: number;
		amount: number;
	}[];
	topCauses?: {
		name: string;
		amount: number;
		count: number;
	}[];
	topDonors?: {
		email: string;
		amount: number;
		count: number;
	}[];
	campaignPerformance?: {
		title: string;
		targetAmount: number;
		raisedAmount: number;
		achievementRate: number;
		status: string;
	}[];
}

export interface RecentActivity {
	id: string;
	type: string;
	amount?: number;
	campaignName: string;
	timestamp: string;
	organizationId?: string;
	organizationName?: string;
}

export interface DonorAnalyticsResponse {
	success: boolean;
	data: {
		stats: DashboardStats;
		charts: ChartData;
		recentActivity: RecentActivity[];
	};
}

export interface OrganizationAnalyticsResponse {
	success: boolean;
	data: {
		stats: OrganizationStats;
		charts: ChartData;
		recentActivities: {
			donations: RecentActivity[];
			campaigns: RecentActivity[];
			feedback: RecentActivity[];
		};
	};
}

// Define analytics API endpoints
export const analyticsApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getDonorAnalytics: builder.query<DonorAnalyticsResponse, void>({
			query: () => ({
				url: "/dashboard/donor",
				method: "GET",
			}),
			providesTags: ["Analytics", "Dashboard"],
		}),

		getOrganizationAnalytics: builder.query<
			OrganizationAnalyticsResponse,
			void
		>({
			query: () => ({
				url: "/dashboard/organization",
				method: "GET",
			}),
			providesTags: ["Analytics", "Dashboard"],
		}),
	}),
});

export const { useGetDonorAnalyticsQuery, useGetOrganizationAnalyticsQuery } =
	analyticsApi;
