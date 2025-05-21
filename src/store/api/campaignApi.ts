import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	CampaignsResponse,
	CampaignResponse,
	CreateCampaignBody,
	UpdateCampaignBody,
	CampaignQueryParams,
} from "@/types/campaigns";
import { RootState } from "../store";

export const campaignApi = createApi({
	reducerPath: "campaignApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
		prepareHeaders: (headers, { getState }) => {
			// Get token from auth state
			const token = (getState() as RootState).auth.token;

			// Log auth headers for debugging
			console.log(
				"Setting auth headers with token:",
				token ? "present" : "missing"
			);

			// If token exists, add it to the headers
			if (token) {
				// Log the full token for debugging
				console.log(
					"Using token (first 15 chars):",
					token.substring(0, 15) + "..."
				);
				headers.set("Authorization", `Bearer ${token}`);
			}

			// Add content type header
			headers.set("Content-Type", "application/json");

			return headers;
		},
	}),
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
			query: (body) => {
				console.log(
					"Campaign creation request payload:",
					JSON.stringify(body, null, 2)
				);
				return {
					url: "/campaigns",
					method: "POST",
					body,
				};
			},
			invalidatesTags: ["Campaign"],
		}),

		updateCampaign: builder.mutation<
			CampaignResponse,
			{ id: string; body: UpdateCampaignBody }
		>({
			query: ({ id, body }) => {
				console.log("Update campaign request:", {
					url: `/campaigns/${id}`,
					method: "PATCH",
					body,
				});
				return {
					url: `/campaigns/${id}`,
					method: "PATCH",
					body,
				};
			},
			invalidatesTags: (result, error, { id }) => {
				console.log("Update campaign result:", result);
				console.log("Update campaign error:", error);
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
				{ type: "Campaign", id: campaignId },
				"Cause",
			],
		}),
	}),
});

// Log the API URL for debugging
console.log(
	"Campaign API URL:",
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
);

export const {
	useGetCampaignsQuery,
	useGetCampaignByIdQuery,
	useGetOrganizationCampaignsQuery,
	useCreateCampaignMutation,
	useUpdateCampaignMutation,
	useDeleteCampaignMutation,
	useUpdateCampaignStatusMutation,
	useGetDonorCampaignsQuery,
	useAddCauseToCampaignMutation,
} = campaignApi;
