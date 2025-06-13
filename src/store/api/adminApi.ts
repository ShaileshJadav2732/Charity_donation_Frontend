import { apiSlice } from "../slices/apiSlice";

export interface PlatformStats {
	users: {
		totalUsers: number;
		donors: number;
		organizations: number;
	};
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
		ratingDistribution: {
			1: number;
			2: number;
			3: number;
			4: number;
			5: number;
		};
	};
	recentActivities: {
		users: Array<{
			_id: string;
			email: string;
			role: string;
			createdAt: string;
		}>;
		donations: Array<{
			_id: string;
			amount: number;
			donor: {
				firstName: string;
				lastName: string;
			};
			organization: {
				name: string;
			};
			createdAt: string;
		}>;
		campaigns: Array<{
			_id: string;
			title: string;
			organizations: Array<{
				name: string;
			}>;
			createdAt: string;
		}>;
		feedback: Array<{
			_id: string;
			rating: number;
			comment: string;
			donor: {
				firstName: string;
				lastName: string;
			};
			organization: {
				name: string;
			};
			createdAt: string;
		}>;
	};
}

export interface PlatformStatsResponse {
	success: boolean;
	data: PlatformStats;
}

export interface Organization {
	_id: string;
	userId: {
		email: string;
	};
	name: string;
	description: string;
	verified: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface OrganizationListResponse {
	success: boolean;
	data: Organization[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface OrganizationResponse {
	success: boolean;
	data: Organization;
}

export const adminApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getPlatformStats: builder.query<PlatformStatsResponse, void>({
			query: () => ({
				url: "/admin/stats",
			}),
			providesTags: ["AdminStats"],
		}),

		getVerificationRequests: builder.query<
			OrganizationListResponse,
			{ status?: string; page?: number; limit?: number }
		>({
			query: ({ status, page = 1, limit = 10 }) => ({
				url: "/admin/organizations/verification",
				params: { status, page, limit },
			}),
			providesTags: ["Organizations"],
		}),

		updateVerificationStatus: builder.mutation<
			OrganizationResponse,
			{ organizationId: string; verified: boolean }
		>({
			query: ({ organizationId, verified }) => ({
				url: `/admin/organizations/${organizationId}/verify`,
				method: "PATCH",
				body: { verified },
			}),
			invalidatesTags: ["Organizations", "AdminStats"],
		}),
	}),
});

export const {
	useGetPlatformStatsQuery,
	useGetVerificationRequestsQuery,
	useUpdateVerificationStatusMutation,
} = adminApi;
