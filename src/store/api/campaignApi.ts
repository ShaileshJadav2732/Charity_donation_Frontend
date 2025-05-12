import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import {
	CausesResponse,
	CampaignResponse,
	CreateCampaignBody,
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
		createCampaign: builder.mutation<CampaignResponse, CreateCampaignBody>({
			query: (body) => ({
				url: "/campaigns",
				method: "POST",
				body,
			}),
			invalidatesTags: ["Campaigns"],
		}),
	}),
});

export const { useGetOrganizationCausesQuery, useCreateCampaignMutation } =
	campaignApi;
