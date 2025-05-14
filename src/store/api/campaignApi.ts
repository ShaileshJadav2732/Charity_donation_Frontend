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
			query: (id) => ({
				url: `/campaigns/${id}`,
				method: "GET",
			}),
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
			query: ({ id, body }) => ({
				url: `/campaigns/${id}`,
				method: "PATCH",
				body,
			}),
			invalidatesTags: (result, error, { id }) => [{ type: "Campaign", id }],
		}),

		deleteCampaign: builder.mutation<void, string>({
			query: (id) => ({
				url: `/campaigns/${id}`,
				method: "DELETE",
			}),
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
