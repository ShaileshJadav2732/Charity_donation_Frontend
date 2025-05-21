import { RootState } from "@/store/store";

import {
	CauseQueryParams,
	CauseResponse,
	CausesResponse,
	CreateCauseBody,
	UpdateCauseBody,
} from "@/types/cause";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
	baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
	// Add credentials to ensure cookies are sent with requests
	credentials: 'include',
	prepareHeaders: (headers, { getState }) => {
		// Get the token from the auth state
		const token = (getState() as RootState).auth.token;

		// If we have a token, set the authorization header
		if (token) {
			headers.set("authorization", `Bearer ${token}`);
		}

		return headers;
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
			providesTags: (_result, _error, id) => [{ type: "Cause", id }],
		}),

		// Get causes for active campaigns only
		getActiveCampaignCauses: builder.query<CausesResponse, CauseQueryParams>({
			query: (params) => ({
				url: "/causes/active-campaigns",
				method: "GET",
				params,
			}),
			providesTags: ["Cause"],
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
			invalidatesTags: (_result, _error, { id }) => [{ type: "Cause", id }],
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
			providesTags: (_result, _error, { campaignId }) => [
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
			invalidatesTags: (_result, _error, { causeId }) => [
				{ type: "Cause", id: causeId },
			],
		}),
	}),
});

export const {
	useGetCausesQuery,
	useGetCauseByIdQuery,
	useGetActiveCampaignCausesQuery,
	useGetOrganizationCausesQuery,
	useCreateCauseMutation,
	useUpdateCauseMutation,
	useDeleteCauseMutation,
	useGetCampaignCausesQuery,
	useMakeDonationMutation,
} = causeApi;
