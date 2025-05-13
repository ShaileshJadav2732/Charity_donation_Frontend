import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import {
	CausesResponse,
	CampaignResponse,
	CreateCampaignBody,
	CampaignsResponse,
	UpdateCampaignBody
} from "../../types/campaings";

export const campaignApi = createApi({
	reducerPath: "campaignApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth.token;
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ["Campaigns", "Causes"],
	endpoints: (builder) => ({
		// Get all campaigns with filters
		getCampaigns: builder.query<
			CampaignsResponse,
			{
				page?: number;
				limit?: number;
				search?: string;
				status?: string;
				tag?: string;
				organizationId?: string;
			}
		>({
			query: (params) => ({
				url: "/campaigns",
				params,
			}),
			providesTags: ["Campaigns"],
		}),

		// Get a single campaign by ID
		getCampaignById: builder.query<CampaignResponse, string>({
			query: (id) => `/campaigns/${id}`,
			providesTags: (result, error, id) => [{ type: "Campaigns", id }],
		}),

		// Get organization's campaigns
		getOrganizationCampaigns: builder.query<
			CampaignsResponse,
			{
				organizationId: string;
				params: {
					page?: number;
					limit?: number;
					search?: string;
					status?: string;
					tag?: string;
				};
			}
		>({
			query: ({ organizationId, params }) => ({
				url: `/campaigns/organization/${organizationId}`,
				params,
			}),
			providesTags: ["Campaigns"],
		}),

		// Get organization's causes
		getOrganizationCauses: builder.query<
			CausesResponse,
			{
				organizationId: string;
				params: {
					page?: number;
					limit?: number;
					search?: string;
					tag?: string;
				};
			}
		>({
			query: ({ organizationId, params }) => ({
				url: `/causes/organization/${organizationId}`,
				params,
			}),
			providesTags: ["Causes"],
		}),

		// Create a new campaign
		createCampaign: builder.mutation<CampaignResponse, CreateCampaignBody>({
			query: (body) => ({
				url: "/campaigns",
				method: "POST",
				body,
			}),
			invalidatesTags: ["Campaigns"],
		}),

		// Update a campaign
		updateCampaign: builder.mutation<
			CampaignResponse,
			{ id: string; data: UpdateCampaignBody }
		>({
			query: ({ id, data }) => ({
				url: `/campaigns/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: "Campaigns", id },
				"Campaigns",
			],
		}),

		// Delete a campaign
		deleteCampaign: builder.mutation<void, string>({
			query: (id) => ({
				url: `/campaigns/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Campaigns"],
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
			invalidatesTags: (result, error, { campaignId }) => [
				{ type: "Campaigns", id: campaignId },
				"Campaigns",
			],
		}),

		// Remove a cause from a campaign
		removeCauseFromCampaign: builder.mutation<
			CampaignResponse,
			{ campaignId: string; causeId: string }
		>({
			query: ({ campaignId, causeId }) => ({
				url: `/campaigns/${campaignId}/causes/${causeId}`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, { campaignId }) => [
				{ type: "Campaigns", id: campaignId },
				"Campaigns",
			],
		}),
	}),
});

export const {
	useGetCampaignsQuery,
	useGetCampaignByIdQuery,
	useGetOrganizationCampaignsQuery,
	useGetOrganizationCausesQuery,
	useCreateCampaignMutation,
	useUpdateCampaignMutation,
	useDeleteCampaignMutation,
	useAddCauseToCampaignMutation,
	useRemoveCauseFromCampaignMutation,
} = campaignApi;
