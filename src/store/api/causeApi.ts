import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	Cause,
	CausesResponse,
	CauseResponse,
	CreateCauseBody,
	UpdateCauseBody,
	CauseQueryParams,
} from "@/types/cause";
import { RootState } from "@/store/store";

const baseQuery = fetchBaseQuery({
	baseUrl: "/api",
	prepareHeaders: (headers, { getState }) => {
		// Get the token from the auth state
		const token = (getState() as RootState).auth.token;

		// If we have a token, set the authorization header
		if (token) {
			headers.set("authorization", `Bearer ${token}`);
		}

		return headers;
	},
	// Add debug logging
	onRequest: (req) => {
		console.log("API Request:", req.url, req.method, req.body);
	},
	onResponse: (res) => {
		console.log("API Response:", res.status, res.data);
	},
	onError: (err) => {
		console.error("API Error:", err);
	},
});

export const causeApi = createApi({
	reducerPath: "causeApi",
	baseQuery,
	tagTypes: ["Cause", "Campaign"],
	endpoints: (builder) => ({
		// Get all causes with filtering and pagination
		getCauses: builder.query<CausesResponse, CauseQueryParams>({
			query: (params) => ({
				url: "/causes",
				method: "GET",
				params,
			}),
			providesTags: ["Cause"],
		}),

		// Get a single cause by ID
		getCauseById: builder.query<CauseResponse, string>({
			query: (id) => ({
				url: `/causes/${id}`,
				method: "GET",
			}),
			providesTags: (result, error, id) => [{ type: "Cause", id }],
		}),

		// Get causes for a specific organization
		getOrganizationCauses: builder.query<
			CausesResponse,
			CauseQueryParams & { organizationId: string }
		>({
			query: ({ organizationId, ...params }) => ({
				url: `/causes/organization/${organizationId}`,
				method: "GET",
				params,
			}),
			providesTags: ["Cause"],
		}),

		// Create a new cause
		createCause: builder.mutation<CauseResponse, CreateCauseBody>({
			query: (body) => ({
				url: "/causes",
				method: "POST",
				body,
			}),
			invalidatesTags: ["Cause"],
		}),

		// Update an existing cause
		updateCause: builder.mutation<
			CauseResponse,
			{ id: string; body: UpdateCauseBody }
		>({
			query: ({ id, body }) => ({
				url: `/causes/${id}`,
				method: "PUT",
				body,
			}),
			invalidatesTags: (result, error, { id }) => [{ type: "Cause", id }],
		}),

		// Delete a cause
		deleteCause: builder.mutation<void, string>({
			query: (id) => ({
				url: `/causes/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Cause"],
		}),

		// Get causes for a specific campaign
		getCampaignCauses: builder.query<
			CausesResponse,
			CauseQueryParams & { campaignId: string }
		>({
			query: ({ campaignId, ...params }) => ({
				url: `/campaigns/${campaignId}/causes`,
				method: "GET",
				params,
			}),
			providesTags: (result, error, { campaignId }) => [
				{ type: "Cause", id: campaignId },
				{ type: "Campaign", id: campaignId },
			],
		}),

		// Make a donation to a cause
		makeDonation: builder.mutation<
			CauseResponse,
			{ causeId: string; type: string; amount?: number }
		>({
			query: ({ causeId, type, amount }) => ({
				url: `/causes/${causeId}/donate`,
				method: "POST",
				body: { type, amount },
			}),
			invalidatesTags: (result, error, { causeId }) => [
				{ type: "Cause", id: causeId },
			],
		}),
	}),
});

export const {
	useGetCausesQuery,
	useGetCauseByIdQuery,
	useGetOrganizationCausesQuery,
	useCreateCauseMutation,
	useUpdateCauseMutation,
	useDeleteCauseMutation,
	useGetCampaignCausesQuery,
	useMakeDonationMutation,
} = causeApi;
