// src/store/api/causeApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import {
	CausesResponse,
	CauseResponse,
	GetCausesQueryParams,
	CreateCauseBody,
	UpdateCauseBody,
} from "../../types/campaings";

export const causeApi = createApi({
	reducerPath: "causeApi",
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
	tagTypes: ["Causes", "Cause"],
	endpoints: (builder) => ({
		getCauses: builder.query<CausesResponse, GetCausesQueryParams>({
			query: (params) => ({
				url: "/causes",
				params,
			}),
			providesTags: ["Causes"],
		}),
		// getCauseById: builder.query<CauseResponse, string>({
		// 	query: (id) => `/causes/${id}`,
		// 	providesTags: (result, error, id) => [{ type: "Cause", id }],
		// }),
		// createCause: builder.mutation<CauseResponse, CreateCauseBody>({
		// 	query: (body) => ({
		// 		url: "/causes",
		// 		method: "POST",
		// 		body,
		// 	}),
		// 	invalidatesTags: ["Causes"],
		// }),
		updateCause: builder.mutation<
			CauseResponse,
			{ id: string; data: UpdateCauseBody }
		>({
			query: ({ id, data }) => ({
				url: `/causes/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (result, error, { id }) => [
				"Causes",
				{ type: "Cause", id },
			],
		}),
		deleteCause: builder.mutation<void, string>({
			query: (id) => ({
				url: `/causes/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Causes"],
		}),
		getOrganizationCauses: builder.query<
			CausesResponse,
			{ organizationId: string; params: GetCausesQueryParams }
		>({
			query: ({ organizationId, params }) => ({
				url: `/causes/organization/${organizationId}`,
				params,
			}),
			providesTags: ["Causes"],
		}),
		getDonorCauses: builder.query<CausesResponse, GetCausesQueryParams>({
			query: (params) => ({
				url: "/causes/donor/supported",
				params,
			}),
			providesTags: ["Causes"],
		}),
	}),
});

export const {
	useGetCausesQuery,
	// useGetCauseByIdQuery,
	// useCreateCauseMutation,
	useUpdateCauseMutation,
	useDeleteCauseMutation,
	useGetOrganizationCausesQuery,
	useGetDonorCausesQuery,
} = causeApi;
