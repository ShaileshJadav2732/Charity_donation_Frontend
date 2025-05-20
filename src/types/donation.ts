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
	APPROVED = "APPROVED",
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

export interface DonationResponse {
	donation: Donation;
}

export interface DonationQueryParams {
	page?: number;
	limit?: number;
	causeId?: string;
	status?: string;
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

export interface DonationStats {
	totalDonated: number;
	totalCauses: number;
	averageDonation: number;
}

export interface Pagination {
	total: number;
	page: number;
	pages: number;
}

export interface DonationResponse {
	donations: Donation[];
	pagination: Pagination;
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	pagination?: Pagination;
}

export interface DonationResponse {
	success: boolean;
	data: Donation[];
	pagination: Pagination;
}

export interface DonationQueryParams {
	organizationId: string;
	status?: string;
	page?: number;
	limit?: number;
}

export interface UpdateDonationStatusRequest {
	donationId: string;
	status: DonationStatus;
}

export interface UpdateDonationStatusResponse {
	success: boolean;
	data: Donation;
	message?: string;
}

// types/donation.ts

export interface Donor {
	name?: string;
	email?: string;
}

export interface Cause {
	title?: string;
}

export interface PickupAddress {
	street?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
}

export interface organizationDonation {
	_id: string;
	donor?: Donor;
	quantity: number;
	unit: string;
	type?: string;
	cause?: Cause;
	scheduledDate: string; // ISO date string (e.g., "2025-05-20T00:00:00.000Z")
	scheduledTime?: string;
	description?: string;
	status: "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";
	isPickup: boolean;
	pickupAddress?: PickupAddress;
	contactPhone?: string;
	contactEmail?: string;
	amount?: number;
	createdAt: string; // ISO date string (e.g., "2025-05-20T00:00:00.000Z")
}

export interface Pagination {
	page: number;
	pages: number;
	total: number;
	limit: number;
}

export interface DonationsResponse {
	data: Donation[];
	pagination?: Pagination;
}

export interface Donation {
	_id: string;
	donor: {
		_id: string;
		name: string;
		email: string;
		phone?: string;
	};
	cause: {
		_id: string;
		title: string;
	};
	organization: {
		_id: string;
		name: string;
		email: string;
		phone: string;
	};
	amount?: number;
	type: string;
	status: string;
	quantity?: number;
	createdAt: string;
	description: string;
	receiptImage?: string;
	unit?: string;
}
