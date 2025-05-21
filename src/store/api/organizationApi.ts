import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Define interfaces for organization data
export interface Organization {
   _id: string;
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

// Define interfaces for query arguments
interface GetOrganizationsParams {
   page?: number;
   limit?: number;
   search?: string;
}

// Define a service using a base URL and expected endpoints
export const organizationApi = createApi({
   reducerPath: "organizationApi",
   baseQuery: fetchBaseQuery({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
      prepareHeaders: (headers, { getState }) => {
         const token = (getState() as RootState).auth.token;
         console.log("Preparing headers with token:", token); // Debug token in headers
         if (token) {
            headers.set('authorization', `Bearer ${token}`);
         }
         return headers;
      },
   }),
   tagTypes: ["Organization"],
   endpoints: (builder) => ({
      getOrganizations: builder.query<OrganizationsResponse, GetOrganizationsParams | void>({
         query: (params = {}) => {
            const { page = 1, limit = 10, search = "" } = params as GetOrganizationsParams;
            return {
               url: `/organizations?page=${page}&limit=${limit}&search=${search}`,
               method: "GET",
            };
         },
         providesTags: ["Organization"],
      }),
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
         query: () => {
            console.log("Making request to /organizations/me"); // Debug request
            return {
               url: `/organizations/me`,
               method: "GET",
               credentials: 'include' // Include credentials
            };
         },
         providesTags: ["Organization"],
         transformResponse: (response: OrganizationResponse) => {
            console.log("Raw API response:", response); // Debug raw response
            return response;
         },
         transformErrorResponse: (error: any) => {
            console.log("API error:", error); // Debug error
            return error;
         }
      })
   }),
});

// Export hooks for usage in components
export const {
   useGetOrganizationsQuery,
   useGetOrganizationByIdQuery,
   useGetOrganizationByCauseIdQuery,
   useGetCurrentOrganizationQuery
} = organizationApi;