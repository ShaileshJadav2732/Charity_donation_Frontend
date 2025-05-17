import { DonationFormData, DonorStatsResponse } from "@/types/donation";
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

		getDonorDonations: builder.query<
			DonationFormData,
			{ status?: string; type?: string; page?: number; limit?: number }
		>({
			query: ({ status, type, page = 1, limit = 10 }) => {
				const params = new URLSearchParams();
				if (status) params.append("status", status);
				if (type) params.append("type", type);
				params.append("page", page.toString());
				params.append("limit", limit.toString());

				return {
					url: `/donations/my?${params.toString()}`,
					method: "GET",
				};
			},
		}),
		getDonorStats: builder.query<DonorStatsResponse, void>({
			query: () => ({
				url: "/donations/donor/stats",
				method: "GET",
			}),
		}),
	}),
});

export const {
	useCreateDonationMutation,
	useGetDonationsQuery,
	useGetDonationByIdQuery,
	useGetOrganizationDonationsQuery,
	useGetDonorStatsQuery,
} = donationApi;
