import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	Campaign,
	CampaignsResponse,
	CampaignResponse,
	CreateCampaignBody,
	UpdateCampaignBody,
	CampaignQueryParams,
} from "@/types/campaings";
import { RootState } from "../store";

// Helper to validate campaign ID
const isValidId = (id: string): boolean => {
	return Boolean(id && typeof id === 'string' && id !== 'undefined' && id !== '[object Object]');
};

// Add improved error handler
const handleErrorResponse = (error: any, functionName: string, id?: string): Error => {
	console.error(`API error in ${functionName}${id ? ` for ID ${id}` : ''}:`, error);

	// Return a more descriptive error
	if (error?.status === 404) {
		return new Error(`Resource not found. ${error.data?.message || ''}`);
	} else if (error?.status === 401 || error?.status === 403) {
		return new Error(`Authentication error: ${error.data?.message || 'You do not have permission to perform this action'}`);
	} else if (error?.status >= 500) {
		return new Error(`Server error: ${error.data?.message || 'The server encountered an error processing your request'}`);
	}

	return new Error(error?.data?.message || `Error in ${functionName}: ${error?.status || 'Unknown error'}`);
};

const baseQuery = fetchBaseQuery({
	baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
	prepareHeaders: (headers, { getState }) => {
		// Only access token in browser environment
		if (typeof window !== "undefined") {
			// Get token from auth state
			const token = (getState() as RootState).auth.token;

			// If token exists, add it to the headers
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}
		}

		// Add content type header
		headers.set("Content-Type", "application/json");

		return headers;
	},
});

export const campaignApi = createApi({
	reducerPath: "campaignApi",
	baseQuery,
	tagTypes: ["Campaign", "Cause"],
	endpoints: (builder) => ({
		getCampaigns: builder.query<CampaignsResponse, CampaignQueryParams>({
			query: (params) => ({
				url: "/campaigns",
				method: "GET",
				params,
			}),
			providesTags: ["Campaign"],
		}),

		getCampaignById: builder.query<CampaignResponse, string>({
			query: (id) => {
				// Log and validate the ID
				console.log("API call getCampaignById with ID:", id);
				if (!isValidId(id)) {
					throw new Error(`Invalid campaign ID: ${id}`);
				}
				return {
					url: `/campaigns/${id}`,
					method: "GET",
				};
			},
			providesTags: (result, error, id) => [{ type: "Campaign", id }],
		}),

		getOrganizationCampaigns: builder.query<
			CampaignsResponse,
			CampaignQueryParams & { organizationId: string }
		>({
			query: ({ organizationId, ...params }) => ({
				url: `/organizations/${organizationId}/campaigns`,
				method: "GET",
				params,
			}),
			providesTags: ["Campaign"],
		}),

		createCampaign: builder.mutation<CampaignResponse, CreateCampaignBody>({
			query: (body) => ({
				url: "/campaigns",
				method: "POST",
				body,
			}),
			invalidatesTags: ["Campaign"],
		}),

		updateCampaign: builder.mutation<
			CampaignResponse,
			{ id: string; body: UpdateCampaignBody }
		>({
			query: ({ id, body }) => {
				// Log and validate the ID
				console.log("API call updateCampaign with ID:", id);
				if (!isValidId(id)) {
					throw new Error(`Invalid campaign ID for update: ${id}`);
				}
				return {
					url: `/campaigns/${id}`,
					method: "PATCH",
					body,
				};
			},
			invalidatesTags: (result, error, { id }) => [{ type: "Campaign", id }],
		}),

		deleteCampaign: builder.mutation<void, string>({
			query: (id) => {
				// Log and validate the ID
				console.log("API call deleteCampaign with ID:", id);
				if (!isValidId(id)) {
					throw new Error(`Invalid campaign ID for delete: ${id}`);
				}
				return {
					url: `/campaigns/${id}`,
					method: "DELETE",
				};
			},
			// Add error handling to transform and log errors
			transformErrorResponse: (response, meta, arg) => {
				return handleErrorResponse(response, 'deleteCampaign', arg);
			},
			// Improved error handling in the onQueryStarted lifecycle
			async onQueryStarted(id, { dispatch, queryFulfilled }) {
				try {
					await queryFulfilled;
					console.log(`Successfully deleted campaign with ID: ${id}`);
				} catch (error) {
					console.error(`Error deleting campaign with ID ${id}:`, error);
				}
			},
			invalidatesTags: ["Campaign"],
		}),

		updateCampaignStatus: builder.mutation<
			CampaignResponse,
			{ id: string; status: string }
		>({
			query: ({ id, status }) => ({
				url: `/campaigns/${id}/status`,
				method: "PATCH",
				body: { status },
			}),
			invalidatesTags: (result, error, { id }) => [{ type: "Campaign", id }],
		}),

		getDonorCampaigns: builder.query<CampaignsResponse, CampaignQueryParams>({
			query: (params) => ({
				url: "/donor/campaigns",
				method: "GET",
				params,
			}),
			providesTags: ["Campaign"],
		}),
	}),
});

export const {
	useGetCampaignsQuery,
	useGetCampaignByIdQuery,
	useGetOrganizationCampaignsQuery,
	useCreateCampaignMutation,
	useUpdateCampaignMutation,
	useDeleteCampaignMutation,
	useUpdateCampaignStatusMutation,
	useGetDonorCampaignsQuery,
} = campaignApi;
