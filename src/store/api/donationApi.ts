import {
	ApiResponse,
	Donation,
	DonationFormData,
	DonationResponse,
	DonorDonationsResponse,
	UpdateDonationStatusRequest,
	UpdateDonationStatusResponse,
} from "@/types/donation";
import apiSlice from "./apiSlice";

export const donationApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		createDonation: builder.mutation<
			{ success: boolean; message: string; data: Donation },
			DonationFormData
		>({
			query: (data) => {
				console.log("Creating donation with data:", data);
				return {
					url: "/donations",
					method: "POST",
					body: data,
				};
			},
			transformErrorResponse: (response: any) => {
				console.error("Donation creation error response:", response);
				if (response.status === 401) {
					console.error("Authentication failed - user not authenticated");
				}
				return response;
			},
		}),
		getDonationById: builder.query<Donation, string>({
			query: (id) => `/donations/${id}`,
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
		getItemDonationAnalytics: builder.query<ApiResponse<unknown>, void>({
			query: () => ({
				url: "/donations/items/analytics",
				method: "GET",
			}),
		}),
		getItemDonationTypeAnalytics: builder.query<ApiResponse<unknown>, string>({
			query: (type) => ({
				url: `/donations/items/${type}/analytics`,
				method: "GET",
			}),
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
			invalidatesTags: ["Donations"],
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

		// Mark donation as confirmed with receipt upload (for organizations)
		markDonationAsConfirmed: builder.mutation<
			{
				success: boolean;
				message: string;
				receiptUrl: string;
				emailStatus: string;
				notificationStatus: string;
				pdfReceiptUrl?: string;
			},
			{ donationId: string; receiptFile: File }
		>({
			queryFn: async ({ donationId, receiptFile }, { getState }) => {
				try {
					// Create a new FormData instance
					const formData = new FormData();
					formData.append("receipt", receiptFile);

					console.log(
						"Sending receipt:",
						receiptFile.name,
						receiptFile.type,
						receiptFile.size
					);

					// Get the token from state
					const state = getState() as { auth: { token: string | null } };
					const token = state.auth.token;

					// Create headers manually
					const headers: HeadersInit = {};
					if (token) {
						headers["Authorization"] = `Bearer ${token}`;
					}
					// Don't set Content-Type - let the browser set it for FormData

					// Create an AbortController for timeout
					const controller = new AbortController();
					const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

					const response = await fetch(
						`${
							process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
						}/donations/${donationId}/confirmed`,
						{
							method: "PATCH",
							headers,
							body: formData,
							signal: controller.signal,
						}
					);

					clearTimeout(timeoutId);

					if (!response.ok) {
						const errorData = await response.json();
						console.error("API Error Response:", errorData);
						return { error: errorData };
					}

					const data = await response.json();
					console.log("API Success Response:", data);
					return { data };
				} catch (error) {
					console.error("Network/Fetch Error:", error);
					if (error instanceof Error && error.name === "AbortError") {
						return {
							error: { message: "Request timed out. Please try again." },
						};
					}
					return { error: { message: "Network error occurred" } };
				}
			},
			invalidatesTags: ["Donations"],
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
	useUpdateDonationStatusMutation,
	useMarkDonationAsReceivedMutation,
	useConfirmDonationReceiptMutation,
	useMarkDonationAsConfirmedMutation,
} = donationApi;
