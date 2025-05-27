import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Feedback types
export interface Feedback {
	_id: string;
	id?: string; // For backward compatibility
	donor:
		| {
				_id: string;
				firstName?: string;
				lastName?: string;
				name?: string;
		  }
		| string;
	organization: string;
	campaign?:
		| {
				_id: string;
				title: string;
		  }
		| string;
	cause?:
		| {
				_id: string;
				title: string;
		  }
		| string;
	rating: number;
	comment: string;
	isPublic: boolean;
	status: "pending" | "approved" | "rejected";
	createdAt: string;
	updatedAt: string;
}

export interface FeedbackResponse {
	feedback: Feedback;
}

export interface FeedbacksResponse {
	feedbacks: Feedback[];
	total: number;
	page: number;
	limit: number;
}

export interface CreateFeedbackBody {
	organization: string;
	campaign?: string;
	cause?: string;
	rating: number;
	comment: string;
	isPublic: boolean;
}

export interface UpdateFeedbackBody {
	rating?: number;
	comment?: string;
	isPublic?: boolean;
	status?: "pending" | "approved" | "rejected";
}

export interface FeedbackQueryParams {
	page?: number;
	limit?: number;
	dontor?: string;
	organization?: string;
	campaign?: string;
	cause?: string;
	status?: string;
	isPublic?: boolean;
}

export interface CheckFeedbackParams {
	organizationId: string;
	causeId?: string;
	campaignId?: string;
}

export interface CheckFeedbackResponse {
	exists: boolean;
	feedback: Feedback | null;
}

// Create the feedback API
export const feedbackApi = createApi({
	reducerPath: "feedbackApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
		prepareHeaders: (headers, { getState }) => {
			// Get token from auth state
			const token = (getState() as RootState).auth.token;

			// If token exists, add it to the headers
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}

			// Add content type header
			headers.set("Content-Type", "application/json");

			return headers;
		},
	}),
	tagTypes: ["Feedback"],
	endpoints: (builder) => ({
		// Get all feedbacks with filters
		getFeedbacks: builder.query<FeedbacksResponse, FeedbackQueryParams>({
			query: (params) => ({
				url: "/feedbacks",
				method: "GET",
				params,
			}),
			providesTags: ["Feedback"],
		}),

		// Get organization feedback
		getOrganizationFeedback: builder.query<
			{ success: boolean; data: Feedback[]; pagination: any },
			{ organizationId: string; status?: string; page?: number; limit?: number }
		>({
			query: ({ organizationId, status, page = 1, limit = 10 }) => ({
				url: `/feedbacks/organization/${organizationId}`,
				method: "GET",
				params: { status, page, limit },
			}),
			providesTags: ["Feedback"],
		}),

		// Check if feedback exists for donor/organization/cause
		checkFeedbackExists: builder.query<
			CheckFeedbackResponse,
			CheckFeedbackParams
		>({
			query: (params) => ({
				url: "/feedbacks/check",
				method: "GET",
				params,
			}),
			providesTags: ["Feedback"],
		}),

		// Create a new feedback
		createFeedback: builder.mutation<FeedbackResponse, CreateFeedbackBody>({
			query: (body) => ({
				url: "/feedbacks",
				method: "POST",
				body,
			}),
			invalidatesTags: ["Feedback"],
		}),

		// Update feedback status
		updateFeedbackStatus: builder.mutation<
			FeedbackResponse,
			{ feedbackId: string; status: "pending" | "approved" | "rejected" }
		>({
			query: ({ feedbackId, status }) => ({
				url: `/feedbacks/${feedbackId}/status`,
				method: "PATCH",
				body: { status },
			}),
			invalidatesTags: ["Feedback"],
		}),
	}),
});

// Export hooks
export const {
	useGetFeedbacksQuery,
	useGetOrganizationFeedbackQuery,
	useCreateFeedbackMutation,
	useCheckFeedbackExistsQuery,
	useUpdateFeedbackStatusMutation,
} = feedbackApi;
