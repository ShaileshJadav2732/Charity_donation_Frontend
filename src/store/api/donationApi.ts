import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DonationFormData, DonationStatus } from "@/types/donation";

interface DonationResponse {
	success: boolean;
	data: {
		id: string;
		type: string;
		amount?: number;
		description: string;
		quantity?: number;
		unit?: string;
		status: DonationStatus;
		organization: {
			id: string;
			name: string;
		};
		createdAt: string;
		updatedAt: string;
	};
	message: string;
}

interface DonationsResponse {
	success: boolean;
	data: {
		donations: DonationResponse["data"][];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	message: string;
}

export const donationApi = createApi({
	reducerPath: "donationApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
		credentials: "include",
		prepareHeaders: (headers) => {
			const token = localStorage.getItem("token");
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ["Donations"],
	endpoints: (builder) => ({
		createDonation: builder.mutation<DonationResponse, DonationFormData>({
			query: (data) => ({
				url: "/donations",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Donations"],
		}),
		getDonations: builder.query<DonationsResponse, { page?: number; limit?: number; status?: DonationStatus }>({
			query: (params) => ({
				url: "/donations",
				method: "GET",
				params,
			}),
			providesTags: ["Donations"],
		}),
		getDonationById: builder.query<DonationResponse, string>({
			query: (id) => `/donations/${id}`,
			providesTags: (result, error, id) => [{ type: "Donations", id }],
		}),
		updateDonationStatus: builder.mutation<DonationResponse, { id: string; status: DonationStatus; receiptImage?: string }>({
			query: ({ id, ...data }) => ({
				url: `/donations/${id}/status`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (result, error, { id }) => [{ type: "Donations", id }, "Donations"],
		}),
		cancelDonation: builder.mutation<DonationResponse, string>({
			query: (id) => ({
				url: `/donations/${id}/cancel`,
				method: "POST",
			}),
			invalidatesTags: (result, error, id) => [{ type: "Donations", id }, "Donations"],
		}),
	}),
});

export const {
	useCreateDonationMutation,
	useGetDonationsQuery,
	useGetDonationByIdQuery,
	useUpdateDonationStatusMutation,
	useCancelDonationMutation,
} = donationApi;
