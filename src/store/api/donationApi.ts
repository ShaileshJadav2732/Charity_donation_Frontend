import {
	ApiResponse,
	DonationFormData,
	DonationQueryParams,
	DonationResponse,
	DonorDonationsResponse,
} from "@/types/donation";
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
			ApiResponse<DonationResponse>,
			{ status?: string; type?: string; page?: number; limit?: number }
		>({
			query: ({ status, type, page = 1, limit = 10 }) => ({
				url: "/donations",
				params: { status, type, page, limit },
			}),
		}),
		getDonorStats: builder.query<DonorDonationsResponse, void>({
			query: () => ({
				url: "/donations/donor/stats",
				method: "GET",
			}),
		}),

		findOrganizationPendingDonations: builder.query<
			DonationResponse,
			DonationQueryParams
		>({
			query: ({
				organizationId,
				status = "PENDING",
				page = 1,
				limit = 10,
			}) => ({
				url: `/donations/organization/${organizationId}`,
				params: { status, page, limit },
			}),
			providesTags: (result) =>
				result
					? [
							...result.data.map(({ _id }) => ({
								type: "Donations" as const,
								id: _id,
							})),
							{ type: "Donations", id: "LIST" },
					  ]
					: [{ type: "Donations", id: "LIST" }],
		}),
	}),
	overrideExisting: true,
});

export const {
	useCreateDonationMutation,
	useGetDonationsQuery,
	useGetDonationByIdQuery,
	useGetOrganizationDonationsQuery,
	useGetDonorDonationsQuery,
	useGetDonorStatsQuery,
	useFindOrganizationPendingDonationsQuery,
} = donationApi;
