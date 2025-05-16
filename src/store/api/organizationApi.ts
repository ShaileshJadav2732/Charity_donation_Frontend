import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define interfaces for query arguments
interface GetOrganizationsParams {
   page?: number;
   limit?: number;
   search?: string;
}

// Define a service using a base URL and expected endpoints
export const organizationApi = createApi({
   reducerPath: "organizationApi",
   baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL || "" }),
   tagTypes: ["Organization"],
   endpoints: (builder) => ({
      getOrganizations: builder.query<any, GetOrganizationsParams | void>({
         query: (params = {}) => {
            const { page = 1, limit = 10, search = "" } = params as GetOrganizationsParams;
            return {
               url: `/api/organizations?page=${page}&limit=${limit}&search=${search}`,
               method: "GET",
            };
         },
         providesTags: ["Organization"],
      }),
      getOrganizationById: builder.query<any, string>({
         query: (id) => ({
            url: `/api/organizations/${id}`,
            method: "GET",
         }),
         providesTags: (result, error, id) => [{ type: "Organization", id }],
      }),
      getOrganizationByCauseId: builder.query<any, string>({
         query: (causeId) => ({
            url: `/api/organizations/cause/${causeId}`,
            method: "GET",
         }),
         providesTags: (result, error, causeId) => [
            { type: "Organization", id: `cause-${causeId}` },
         ],
      }),
   }),
});

// Export hooks for usage in components
export const {
   useGetOrganizationsQuery,
   useGetOrganizationByIdQuery,
   useGetOrganizationByCauseIdQuery,
} = organizationApi; 