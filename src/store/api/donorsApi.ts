import { apiSlice } from "../slices/apiSlice";

export interface DonorAddress {
	street: string | null;
	city: string | null;
	state: string | null;
	country: string | null;
}

export interface Donor {
	id: string;
	name: string;
	email: string;
	phoneNumber: string | null;
	address: DonorAddress;
	profileImage: string | null;
	totalDonated: number;
	totalDonations: number;
	lastDonation: string;
	firstDonation: string;
	frequency: "Regular" | "Frequent" | "Occasional";
	impactScore: number;
	donationTypes: string[];
	causesSupported: number;
}

export interface DonorSummary {
	totalDonors: number;
	totalFundsRaised: number;
	averageDonation: number;
}

export interface DonorPagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface DonorsResponse {
	success: boolean;
	data: {
		donors: Donor[];
		pagination: DonorPagination;
		summary: DonorSummary;
	};
}

export interface DonorsQueryParams {
	page?: number;
	limit?: number;
	search?: string;
}

// Define donors API endpoints
export const donorsApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getOrganizationDonors: builder.query<DonorsResponse, DonorsQueryParams>({
			query: ({ page = 1, limit = 10, search }) => ({
				url: "/organizations/donors",
				method: "GET",
				params: {
					page,
					limit,
					...(search && { search }),
				},
			}),
			providesTags: ["Organizations", "Donations"],
		}),
	}),
});

export const { useGetOrganizationDonorsQuery } = donorsApi;
