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
	baseUrl: process.env.NEXT_PUBLIC_API_URL,
	credentials: "include",
	prepareHeaders: (headers, { getState }) => {
		const token = (getState() as RootState).auth.token;
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

		// Get organization User ID by cause ID for messaging
		getOrganizationUserIdByCauseId: builder.query<
			{
				success: boolean;
				data: {
					causeId: string;
					causeTitle: string;
					organizationId: string;
					organizationName: string;
					organizationUserId: string; // This is what we need for messaging
					organizationEmail: string;
				};
			},
			string
		>({
			query: (causeId) => `/causes/${causeId}/organization-user-id`,
			providesTags: ["Cause"],
		}),

		// Get causes for a specific campaign
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
	useGetOrganizationUserIdByCauseIdQuery,
} = causeApi;
