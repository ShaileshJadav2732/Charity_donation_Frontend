import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Types
export interface Cause {
   id: number;
   title: string;
   description: string;
   category: string;
   targetAmount: number;
   raisedAmount: number;
   supporters: number;
   imageUrl: string;
   organizationId: string;
   status: "active" | "completed" | "draft";
   createdAt: string;
   updatedAt: string;
}

export interface CreateCauseRequest {
   title: string;
   description: string;
   category: string;
   targetAmount: number;
   imageUrl: string;
}

export interface UpdateCauseRequest {
   id: number;
   title?: string;
   description?: string;
   category?: string;
   targetAmount?: number;
   imageUrl?: string;
   status?: "active" | "completed" | "draft";
}

export interface CausesResponse {
   causes: Cause[];
   total: number;
   page: number;
   limit: number;
}

export interface CauseResponse {
   cause: Cause;
}

export const causesApi = createApi({
   reducerPath: "causesApi",
   baseQuery: fetchBaseQuery({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
      prepareHeaders: (headers, { getState }) => {
         const token = (getState() as RootState).auth.token;
         if (token) {
            headers.set("authorization", `Bearer ${token}`);
         }
         return headers;
      },
   }),
   tagTypes: ["Cause"],
   endpoints: (builder) => ({
      // Get all causes with pagination and filters
      getCauses: builder.query<CausesResponse, { page?: number; limit?: number; category?: string; search?: string }>({
         query: ({ page = 1, limit = 10, category, search }) => ({
            url: "/api/causes",
            method: "GET",
            params: {
               page,
               limit,
               category,
               search,
            },
         }),
         providesTags: (result) =>
            result
               ? [
                  ...result.causes.map(({ id }) => ({ type: "Cause" as const, id })),
                  { type: "Cause", id: "LIST" },
               ]
               : [{ type: "Cause", id: "LIST" }],
      }),

      // Get a single cause by ID
      getCauseById: builder.query<CauseResponse, number>({
         query: (id) => ({
            url: `/api/causes/${id}`,
            method: "GET",
         }),
         providesTags: (result, error, id) => [{ type: "Cause", id }],
      }),

      // Create a new cause (organization only)
      createCause: builder.mutation<CauseResponse, CreateCauseRequest>({
         query: (data) => ({
            url: "/api/causes",
            method: "POST",
            body: data,
         }),
         invalidatesTags: [{ type: "Cause", id: "LIST" }],
      }),

      // Update a cause (organization only)
      updateCause: builder.mutation<CauseResponse, UpdateCauseRequest>({
         query: ({ id, ...data }) => ({
            url: `/api/causes/${id}`,
            method: "PUT",
            body: data,
         }),
         invalidatesTags: (result, error, { id }) => [
            { type: "Cause", id },
            { type: "Cause", id: "LIST" },
         ],
      }),

      // Delete a cause (organization only)
      deleteCause: builder.mutation<void, number>({
         query: (id) => ({
            url: `/api/causes/${id}`,
            method: "DELETE",
         }),
         invalidatesTags: (result, error, id) => [
            { type: "Cause", id },
            { type: "Cause", id: "LIST" },
         ],
      }),

      // Get causes by organization
      getOrganizationCauses: builder.query<CausesResponse, { organizationId: string; page?: number; limit?: number }>({
         query: ({ organizationId, page = 1, limit = 10 }) => ({
            url: `/api/organizations/${organizationId}/causes`,
            method: "GET",
            params: {
               page,
               limit,
            },
         }),
         providesTags: (result) =>
            result
               ? [
                  ...result.causes.map(({ id }) => ({ type: "Cause" as const, id })),
                  { type: "Cause", id: "LIST" },
               ]
               : [{ type: "Cause", id: "LIST" }],
      }),

      // Get causes by donor (causes they've supported)
      getDonorCauses: builder.query<CausesResponse, { page?: number; limit?: number }>({
         query: ({ page = 1, limit = 10 }) => ({
            url: "/api/donors/causes",
            method: "GET",
            params: {
               page,
               limit,
            },
         }),
         providesTags: (result) =>
            result
               ? [
                  ...result.causes.map(({ id }) => ({ type: "Cause" as const, id })),
                  { type: "Cause", id: "LIST" },
               ]
               : [{ type: "Cause", id: "LIST" }],
      }),
   }),
});

export const {
   useGetCausesQuery,
   useGetCauseByIdQuery,
   useCreateCauseMutation,
   useUpdateCauseMutation,
   useDeleteCauseMutation,
   useGetOrganizationCausesQuery,
   useGetDonorCausesQuery,
} = causesApi; 