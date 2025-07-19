import {
	ApiResponse,
	Donation,
	DonationFormData,
	DonationResponse,
	DonorDonationsResponse,
	UpdateDonationStatusResponse,
} from "@/types/donation";
import apiSlice from "../slices/apiSlice";

export const donationApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		createDonation: builder.mutation<
			{ success: boolean; message: string; data: Donation },
			DonationFormData
		>({
			query: (data) => {
				return {
					url: "/donations",
					method: "POST",
					body: data,
				};
			},
			transformErrorResponse: (response: unknown) => {
				console.error("Donation creation error response:", response);
				const errorResponse = response as {
					status?: number;
					data?: { message?: string };
				};
				if (errorResponse.status === 401) {
					console.error("Authentication failed - user not authenticated");
				}
				return response;
			},
			invalidatesTags: ["Donations"],
		}),
		getDonationById: builder.query<
			{ success: boolean; data: Donation },
			string
		>({
			query: (id) => `/donations/${id}`,
			transformResponse: (response: { success: boolean; data: Donation }) =>
				response,
			providesTags: (_result, _error, id) => [{ type: "Donations", id }],
		}),

		// Get donations for a specific organization
		getOrganizationDonations: builder.query<
			DonationResponse,
			{ organizationId: string; params?: Record<string, unknown> }
		>({
			query: ({ organizationId, params }) => ({
				url: `/donations/organization/${organizationId}`,
				method: "GET",
				params,
			}),
			providesTags: ["Donations"],
		}),
		getDonorDonations: builder.query<
			ApiResponse<DonationResponse>,
			{ status?: string; type?: string; page?: number; limit?: number }
		>({
			query: ({ status, type, page = 1, limit = 10 }) => ({
				url: "/donations",
				params: { status, type, page, limit },
			}),
			providesTags: ["Donations"],
		}),
		getDonorStats: builder.query<DonorDonationsResponse, void>({
			query: () => ({
				url: "/donations/donor/stats",
				method: "GET",
			}),
			providesTags: ["Donations"],
		}),
		getItemDonationAnalytics: builder.query<ApiResponse<unknown>, void>({
			query: () => ({
				url: "/donations/items/analytics",
				method: "GET",
			}),
			providesTags: ["Donations"],
		}),
		getItemDonationTypeAnalytics: builder.query<ApiResponse<unknown>, string>({
			query: (type) => ({
				url: `/donations/items/${type}/analytics`,
				method: "GET",
			}),
			providesTags: ["Donations"],
		}),

		// Mark donation as received with photo upload
		markDonationAsReceived: builder.mutation<
			UpdateDonationStatusResponse,
			{ donationId: string; photo: File }
		>({
			queryFn: async ({ donationId, photo }, { getState }) => {
				try {
					// Create a new FormData instance
					const formData = new FormData();
					formData.append("photo", photo);

					console.log("Sending photo:", photo.name, photo.type, photo.size);

					// Get the token from state
					const state = getState() as { auth: { token: string | null } };
					const token = state.auth.token;

					// Create headers manually
					const headers: HeadersInit = {};
					if (token) {
						headers["Authorization"] = `Bearer ${token}`;
					}
					// Don't set Content-Type - let the browser set it for FormData

					const response = await fetch(
						`${
							process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
						}/donations/${donationId}/received`,
						{
							method: "PATCH",
							headers,
							body: formData,
						}
					);

					if (!response.ok) {
						const errorData = await response.json();
						return { error: errorData };
					}

					const data = await response.json();
					return { data };
				} catch {
					return { error: { message: "Network error occurred" } };
				}
			},
			invalidatesTags: (_result, _error, { donationId }) => [
				"Donations",
				{ type: "Donations", id: donationId },
			],
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
			invalidatesTags: (_result, _error, { donationId }) => [
				"Donations",
				{ type: "Donations", id: donationId },
			],
		}),

		// Mark donation as confirmed with automatic PDF receipt generation (for organizations)
		markDonationAsConfirmed: builder.mutation<
			{
				success: boolean;
				message: string;
				emailStatus: string;
				notificationStatus: string;
				pdfReceiptUrl?: string;
			},
			{ donationId: string }
		>({
			query: ({ donationId }) => ({
				url: `/donations/${donationId}/confirm-auto`,
				method: "PATCH",
			}),
			invalidatesTags: (_result, _error, { donationId }) => [
				"Donations",
				{ type: "Donations", id: donationId },
			],
		}),

		// Update donation status (for organizations to approve/reject donations)
		updateDonationStatus: builder.mutation<
			UpdateDonationStatusResponse,
			{ donationId: string; status: string }
		>({
			query: ({ donationId, status }) => ({
				url: `/donations/${donationId}/status`,
				method: "PATCH",
				body: { status },
			}),
			invalidatesTags: (_result, _error, { donationId }) => [
				"Donations",
				{ type: "Donations", id: donationId },
			],
		}),
	}),
	overrideExisting: true,
});

export const {
	useCreateDonationMutation,
	useGetDonationByIdQuery,
	useGetOrganizationDonationsQuery,
	useGetDonorDonationsQuery,
	useGetDonorStatsQuery,
	useGetItemDonationAnalyticsQuery,
	useGetItemDonationTypeAnalyticsQuery,
	useMarkDonationAsReceivedMutation,
	useConfirmDonationReceiptMutation,
	useMarkDonationAsConfirmedMutation,
	useUpdateDonationStatusMutation,
} = donationApi;
