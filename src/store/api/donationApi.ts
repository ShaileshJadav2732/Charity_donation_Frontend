import {
	ApiResponse,
	DonationFormData,
	DonationQueryParams,
	DonationResponse,
	DonorDonationsResponse,
	UpdateDonationStatusRequest,
	UpdateDonationStatusResponse,
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
			invalidatesTags: ["Donations", "Cause", "Analytics", "Dashboard"],
		}),
		getDonations: builder.query<DonationFormData[], void>({
			query: () => "/donations",
		}),
		getDonationById: builder.query<DonationFormData, string>({
			query: (id) => `/donations/${id}`,
		}),
		// Get donations for a specific organization
		getOrganizationDonations: builder.query<
			DonationResponse,
			{ organizationId: string; params?: Record<string, any> }
		>({
			query: ({ organizationId, params }) => ({
				url: `/donations/organization/${organizationId}`,
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
		getItemDonationAnalytics: builder.query<ApiResponse<any>, void>({
			query: () => ({
				url: "/donations/items/analytics",
				method: "GET",
			}),
			transformResponse: (response: ApiResponse<any>) => {
				console.log("Item donation analytics response:", response);
				return response;
			},
			transformErrorResponse: (error) => {
				console.error("Error fetching item donation analytics:", error);
				return error;
			},
		}),
		getItemDonationTypeAnalytics: builder.query<ApiResponse<any>, string>({
			query: (type) => ({
				url: `/donations/items/${type}/analytics`,
				method: "GET",
			}),
			transformResponse: (response: ApiResponse<any>) => {
				console.log(
					`Item donation analytics for type ${response.data?.type}:`,
					response
				);
				return response;
			},
			transformErrorResponse: (error, meta) => {
				console.error(
					`Error fetching item donation analytics for type ${meta?.arg}:`,
					error
				);
				return error;
			},
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

		updateDonationStatus: builder.mutation<
			UpdateDonationStatusResponse,
			UpdateDonationStatusRequest
		>({
			query: ({ donationId, status }) => ({
				url: `/donations/${donationId}/status`,
				method: "PATCH",
				body: { status },
			}),
			invalidatesTags: ["Donations"], // Invalidate cache to refresh donation list
		}),

		// Mark donation as received with photo upload
		markDonationAsReceived: builder.mutation<
			UpdateDonationStatusResponse,
			{ donationId: string; photo: File }
		>({
			query: ({ donationId, photo }) => {
				// Create a new FormData instance
				const formData = new FormData();

				// Append the photo with the correct field name
				formData.set("photo", photo);

				console.log("Sending photo:", photo.name, photo.type, photo.size);

				return {
					url: `/donations/${donationId}/received`,
					method: "PATCH",
					// Don't set Content-Type header, let the browser set it with the boundary
					headers: {
						// Remove Content-Type to let browser set it with boundary
					},
					body: formData,
					formData: true,
				};
			},
			// Add transformErrorResponse to better handle errors
			transformErrorResponse: (response: { status: number; data: any }) => {
				console.log("Error response from API:", response);
				// Return a more structured error object
				return {
					status: response.status,
					message: response.data?.message || "Unknown error occurred",
					data: response.data || {},
				};
			},
			invalidatesTags: ["Donations"],
		}),

		// Confirm donation receipt by donor
		confirmDonationReceipt: builder.mutation<
			UpdateDonationStatusResponse,
			{ donationId: string }
		>({
			query: ({ donationId }) => ({
				url: `/donations/${donationId}/confirm`,
				method: "PATCH",
			}),
			invalidatesTags: ["Donations"],
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
	useGetItemDonationAnalyticsQuery,
	useGetItemDonationTypeAnalyticsQuery,
	useFindOrganizationPendingDonationsQuery,
	useUpdateDonationStatusMutation,
	useMarkDonationAsReceivedMutation,
	useConfirmDonationReceiptMutation,
} = donationApi;
