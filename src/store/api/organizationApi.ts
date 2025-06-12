import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Define interfaces for organization data
export interface Organization {
	_id: string;
	id: string;
	userId: string; // Add userId for messaging
	name: string;
	description: string;
	email: string;
	phoneNumber?: string;
	website?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	logo?: string;
	verified: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface OrganizationResponse {
	success: boolean;
	organization: Organization;
}

export interface OrganizationsResponse {
	success: boolean;
	organizations: Organization[];
	total: number;
	page: number;
	limit: number;
}

// Define a service using a base URL and expected endpoints
export const organizationApi = createApi({
	reducerPath: "organizationApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth.token;
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ["Organization"],
	endpoints: (builder) => ({
		getOrganizationById: builder.query<OrganizationResponse, string>({
			query: (id) => ({
				url: `/organizations/${id}`,
				method: "GET",
			}),
			providesTags: (_result, _error, id) => [{ type: "Organization", id }],
		}),
		getOrganizationByCauseId: builder.query<OrganizationResponse, string>({
			query: (causeId) => ({
				url: `/organizations/cause/${causeId}`,
				method: "GET",
			}),
			providesTags: (_result, _error, causeId) => [
				{ type: "Organization", id: `cause-${causeId}` },
			],
		}),
		getCurrentOrganization: builder.query<OrganizationResponse, void>({
			query: () => ({
				url: `/organizations/me`,
				method: "GET",
				credentials: "include",
			}),
			providesTags: ["Organization"],
		}),
	}),
});

// Export hooks for usage in components
export const {
	useGetOrganizationByIdQuery,
	useGetOrganizationByCauseIdQuery,
	useGetCurrentOrganizationQuery,
} = organizationApi;
