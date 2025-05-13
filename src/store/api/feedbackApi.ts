import { apiSlice } from "./apiSlice";

export interface Feedback {
	_id: string;
	donor: string;
	organization: string;
	campaign?: string;
	cause?: string;
	rating: number;
	comment: string;
	isPublic: boolean;
	status: "pending" | "approved" | "rejected";
	createdAt: string;
	updatedAt: string;
}

export interface CreateFeedbackRequest {
	organizationId: string;
	campaignId?: string;
	causeId?: string;
	rating: number;
	comment: string;
	isPublic?: boolean;
}

export interface FeedbackResponse {
	success: boolean;
	data: Feedback;
}

export interface FeedbackListResponse {
	success: boolean;
	data: Feedback[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface FeedbackStats {
	averageRating: number;
	totalFeedback: number;
	ratingDistribution: {
		1: number;
		2: number;
		3: number;
		4: number;
		5: number;
	};
}

export interface FeedbackStatsResponse {
	success: boolean;
	data: FeedbackStats;
}

export const feedbackApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		createFeedback: builder.mutation<FeedbackResponse, CreateFeedbackRequest>({
			query: (data) => ({
				url: "/feedback",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Feedback"],
		}),

		getOrganizationFeedback: builder.query<
			FeedbackListResponse,
			{ organizationId: string; status?: string; page?: number; limit?: number }
		>({
			query: ({ organizationId, status, page = 1, limit = 10 }) => ({
				url: `/feedback/organization/${organizationId}`,
				params: { status, page, limit },
			}),
			providesTags: ["Feedback"],
		}),

		getFeedbackStats: builder.query<
			FeedbackStatsResponse,
			{ organizationId: string }
		>({
			query: ({ organizationId }) => ({
				url: `/feedback/organization/${organizationId}/stats`,
			}),
			providesTags: ["Feedback"],
		}),

		updateFeedbackStatus: builder.mutation<
			FeedbackResponse,
			{ feedbackId: string; status: "approved" | "rejected" }
		>({
			query: ({ feedbackId, status }) => ({
				url: `/feedback/${feedbackId}/status`,
				method: "PATCH",
				body: { status },
			}),
			invalidatesTags: ["Feedback"],
		}),
	}),
});

export const {
	useCreateFeedbackMutation,
	useGetOrganizationFeedbackQuery,
	useGetFeedbackStatsQuery,
	useUpdateFeedbackStatusMutation,
} = feedbackApi;
