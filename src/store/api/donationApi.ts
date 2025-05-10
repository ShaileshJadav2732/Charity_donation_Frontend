import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DonationFormData } from "@/types/donation";

export const donationApi = createApi({
	reducerPath: "donationApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
		credentials: "include",
	}),
	endpoints: (builder) => ({
		createDonation: builder.mutation<void, DonationFormData>({
			query: (data) => ({
				url: "/donations",
				method: "POST",
				body: data,
			}),
		}),
		getDonations: builder.query({
			query: () => "/donations",
		}),
		getDonationById: builder.query({
			query: (id) => `/donations/${id}`,
		}),
	}),
});

export const {
	useCreateDonationMutation,
	useGetDonationsQuery,
	useGetDonationByIdQuery,
} = donationApi;
