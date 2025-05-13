import { DonationFormData } from "@/types/donation";
import apiSlice from "./apiSlice";

export const donationApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		createDonation: builder.mutation<void, DonationFormData>({
			query: (data) => ({
				url: "/donations",
				method: "POST",
				body: data,
			}),
		}),
		getDonations: builder.query<DonationFormData[], void>({
			query: () => "/donations",
		}),
		getDonationById: builder.query<DonationFormData, string>({
			query: (id) => `/donations/${id}`,
		}),
		// Get donations for a specific organization
		getOrganizationDonations: builder.query<
			DonationFormData[],
			{ organizationId: string; params?: Record<string, any> }
		>({
			query: ({ organizationId, params }) => ({
				url: `/organizations/${organizationId}/donations`,
				method: "GET",
				params,
			}),
		}),
	}),
});

export const {
	useCreateDonationMutation,
	useGetDonationsQuery,
	useGetDonationByIdQuery,
	useGetOrganizationDonationsQuery,
} = donationApi;
