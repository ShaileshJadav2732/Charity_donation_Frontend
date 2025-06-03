import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	Campaign,
	CampaignsResponse,
	CampaignResponse,
	CampaignQueryParams,
	CreateCampaignBody,
	UpdateCampaignBody,
} from "@/types/campaings";
import { RootState } from "../store";

export const campaignApi = createApi({
	reducerPath: "campaignApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL,
		prepareHeaders: (headers, { getState }) => {
			// Get token from auth state
			const token = (getState() as RootState).auth.token;

			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}

			// Add content type header
			headers.set("Content-Type", "application/json");

			return headers;
		},
	}),
	tagTypes: ["Campaign", "Cause"],
	endpoints: (builder) => ({
		getCampaignById: builder.query<CampaignResponse, string>({
			query: (id) => ({
				url: `/campaigns/${id}`,
				method: "GET",
			}),
			transformResponse: (response: { data?: Campaign }) => {
				// Transform backend response to match frontend expectations
				return {
					campaign: response.data || ({} as Campaign),
				};
			},
			providesTags: (_result, _error, id) => [{ type: "Campaign", id }],
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
			transformResponse: (response: {
				data?: Campaign[];
				pagination?: { total?: number; page?: number; limit?: number };
			}) => {
				// Transform backend response to match frontend expectations
				return {
					campaigns: response.data || [],
					total: response.pagination?.total || 0,
					page: response.pagination?.page || 1,
					limit: response.pagination?.limit || 10,
				};
			},
			providesTags: ["Campaign"],
		}),

		createCampaign: builder.mutation<CampaignResponse, CreateCampaignBody>({
			query: (body) => {
				return {
					url: "/campaigns",
					method: "POST",
					body,
				};
			},
			transformResponse: (response: { data?: Campaign }) => {
				// Transform backend response to match frontend expectations
				return {
					campaign: response.data || ({} as Campaign),
				};
			},
			invalidatesTags: ["Campaign"],
		}),

		updateCampaign: builder.mutation<
			CampaignResponse,
			{ id: string; body: UpdateCampaignBody }
		>({
			query: ({ id, body }) => {
				return {
					url: `/campaigns/${id}`,
					method: "PATCH",
					body,
				};
			},
			transformResponse: (response: { data?: Campaign }) => {
				// Transform backend response to match frontend expectations
				return {
					campaign: response.data || ({} as Campaign),
				};
			},
			invalidatesTags: (_result, _error, { id }) => {
				return [{ type: "Campaign", id }];
			},
		}),

		deleteCampaign: builder.mutation<void, string>({
			query: (id) => ({
				url: `/campaigns/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Campaign"],
		}),

		// Add a cause to a campaign
		addCauseToCampaign: builder.mutation<
			CampaignResponse,
			{ campaignId: string; causeId: string }
		>({
			query: ({ campaignId, causeId }) => ({
				url: `/campaigns/${campaignId}/causes`,
				method: "POST",
				body: { causeId },
			}),
			transformResponse: (response: { data?: Campaign }) => {
				// Transform backend response to match frontend expectations
				return {
					campaign: response.data || ({} as Campaign),
				};
			},
			invalidatesTags: (_result, _error, { campaignId }) => [
				{ type: "Campaign", id: campaignId },
				"Cause",
			],
		}),
	}),
});

export const {
	useGetCampaignByIdQuery,
	useGetOrganizationCampaignsQuery,
	useCreateCampaignMutation,
	useUpdateCampaignMutation,
	useDeleteCampaignMutation,
	useAddCauseToCampaignMutation,
} = campaignApi;
