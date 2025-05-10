import { apiSlice } from "./apiSlice";

interface DashboardStats {
	totalDonations: number;
	donationGrowth: number;
	causesSupported: number;
	activeCategories: number;
	impactScore: number;
	impactPercentile: number;
	organizationsCount: number;
	supportingOrganizations: number;
}

interface RecentActivity {
	id: string;
	type: "donation" | "subscription" | "update";
	amount?: number;
	campaignName: string;
	timestamp: string;
	organizationId: string;
	organizationName: string;
}

interface DashboardData {
	stats: DashboardStats;
	recentActivity: RecentActivity[];
}

export const dashboardApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getDashboardData: builder.query<DashboardData, void>({
			query: () => ({
				url: "/dashboard/donor",
				method: "GET",
			}),
			providesTags: ["Dashboard"],
			transformResponse: (response: DashboardData) => {
				return {
					...response,
					recentActivity: response.recentActivity.map((activity) => ({
						...activity,
						timestamp: new Date(activity.timestamp).toISOString(),
					})),
				};
			},
		}),
	}),
});

export const { useGetDashboardDataQuery } = dashboardApi;
