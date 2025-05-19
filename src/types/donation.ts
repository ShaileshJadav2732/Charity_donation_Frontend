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

export interface Donation {
	_id: string;
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
	createdAt: string;
	description: string;
	receiptImage?: string;
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

// Interface for DonationsResponse
// export interface IDonation {
// 	_id: string;
// 	donor: {
// 		_id: string;
// 		name: string;
// 		email: string;
// 		contactPhone: string;
// 	};
// 	type: string;
// 	status: string;
// 	amount?: number;
// 	description: string;
// 	quantity?: number;
// 	unit?: string;
// 	scheduledDate?: string;
// 	scheduledTime?: string;
// 	isPickup: boolean;
// 	contactPhone: string;
// 	contactEmail: string;
// 	createdAt: string;
// 	updatedAt: string;
// }

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
