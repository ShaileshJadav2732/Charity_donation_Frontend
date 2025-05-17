export enum DonationType {
	MONEY = "MONEY",
	CLOTHES = "CLOTHES",
	BLOOD = "BLOOD",
	FOOD = "FOOD",
	TOYS = "TOYS",
	BOOKS = "BOOKS",
	FURNITURE = "FURNITURE",
	HOUSEHOLD = "HOUSEHOLD",
	OTHER = "OTHER",
}

export enum DonationStatus {
	PENDING = "PENDING",
	SCHEDULED = "SCHEDULED",
	IN_TRANSIT = "IN_TRANSIT",
	RECEIVED = "RECEIVED",
	CONFIRMED = "CONFIRMED",
	CANCELLED = "CANCELLED",
}

export interface Address {
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

export interface Organization {
	_id: string;
	name: string;
	address: string;
}

interface MonetaryStats {
	totalDonated: number;
	averageDonation: number;
	donationCount: number;
	totalCauses: number;
}

// Non-monetary donation statistics
interface NonMonetaryStats {
	itemsDonated: number;
	donationCount: number;
	uniqueTypeCount: number;
}

// Status breakdown entry
interface StatusBreakdown {
	status: string;
	count: number;
}

// Monthly trend data point
interface MonthlyTrendData {
	year: number;
	month: number;
	totalAmount: number;
	count: number;
}

// Complete donor statistics data structure
interface DonorStats {
	monetary: MonetaryStats;
	nonMonetary: NonMonetaryStats;
	statusBreakdown: StatusBreakdown[];
	monthlyTrend: MonthlyTrendData[];
}

// API response structure
interface DonorStatsResponse {
	success: boolean;
	data: DonorStats;
}

export type {
	MonetaryStats,
	NonMonetaryStats,
	StatusBreakdown,
	MonthlyTrendData,
	DonorStats,
	DonorStatsResponse,
};
export interface DonationFormData {
	donor: string; // Optional if backend uses auth token
	organization: string;
	cause: string;
	type: string;
	amount?: number;
	description: string;
	quantity?: number;
	unit?: string;
	scheduledDate?: string;
	scheduledTime?: string;
	isPickup: boolean;
	contactPhone: string;
	contactEmail: string;
	pickupAddress?: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	dropoffAddress?: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
}

export interface Donation {
	id: string;
	userId: string;
	causeId: string;
	amount: number;
	paymentMethod: string;
	isAnonymous: boolean;
	comment?: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

// export interface DonationsResponse {
// 	donations: Donation[];
// 	total: number;
// 	page: number;
// 	limit: number;
// }

export interface DonationResponse {
	donation: Donation;
}

export interface DonationQueryParams {
	page?: number;
	limit?: number;
	userId?: string;
	causeId?: string;
	status?: string;
	minAmount?: number;
	maxAmount?: number;
}

export interface DonorDonationsResponse {
	success: boolean;
	data: Donation[];
	pagination: {
		total: number;
		page: number;
		pages: number;
	};
}
