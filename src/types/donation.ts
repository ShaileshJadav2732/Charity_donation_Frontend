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
	type: DonationType;
	amount?: number;
	description: string;
	quantity?: number;
	unit?: string;
	scheduledDate?: string;
	scheduledTime?: string;
	isPickup: boolean;
	contactPhone: string;
	contactEmail: string;
	pickupAddress?: Address;
	dropoffAddress?: Address;
}

// Enhanced form values interface for DonationForm
export interface DonationFormValues {
	type: DonationType;
	amount: string | number;
	description: string;
	quantity: number;
	unit: string;
	scheduledDate: string;
	scheduledTime: string;
	isPickup: boolean;
	contactPhone: string;
	contactEmail: string;
	pickupAddress: Address;
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
	limit?: number;
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

export interface DonorDonationsResponse {
	success: boolean;
	data: Donation[];
	pagination: Pagination;
}

export interface DonationQueryParams {
	organizationId?: string;
	page?: number;
	limit?: number;
	causeId?: string;
	status?: string;
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

export interface DonationCause {
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
	organization?: {
		_id: string;
		name: string;
		email: string;
		phone: string;
	};
	campaign?: {
		_id: string;
		title: string;
	};
	quantity?: number;
	unit?: string;
	amount?: number;
	type?: string;
	cause?: DonationCause;
	description?: string;
	scheduledDate?: string; // ISO date string (e.g., "2025-05-20T00:00:00.000Z")
	scheduledTime?: string;
	status: "PENDING" | "APPROVED" | "RECEIVED" | "CONFIRMED" | "CANCELLED";
	isPickup: boolean;
	pickupAddress?: PickupAddress;
	dropoffAddress?: PickupAddress;
	contactPhone?: string;
	contactEmail?: string;
	receiptImage?: string;
	receiptImageMetadata?: {
		originalName?: string;
		mimeType?: string;
		fileSize?: number;
		uploadedAt?: string;
		uploadedBy?: string;
	};
	pdfReceiptUrl?: string;
	confirmationDate?: string;
	notes?: string;
	createdAt: string; // ISO date string (e.g., "2025-05-20T00:00:00.000Z")
	updatedAt?: string;
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
	campaign?: {
		_id: string;
		title: string;
	};
	amount?: number;
	type: DonationType; // Use enum for type safety
	status: DonationStatus; // Use enum for type safety
	quantity?: number;
	unit?: string;
	description: string;
	scheduledDate?: string;
	scheduledTime?: string;
	isPickup?: boolean;
	contactPhone?: string;
	contactEmail?: string;
	pickupAddress?: Address;
	dropoffAddress?: Address;
	receiptImage?: string;
	receiptImageMetadata?: {
		originalName?: string;
		mimeType?: string;
		fileSize?: number;
		uploadedAt?: string;
		uploadedBy?: string;
	};
	pdfReceiptUrl?: string;
	confirmationDate?: string;
	notes?: string;
	createdAt: string;
	updatedAt?: string;
}

export interface DonationFormValues {
	type: DonationType;
	amount: string | number;
	quantity: number;
	unit: string;
	description: string;
	scheduledDate: string;
	scheduledTime: string;
	contactPhone: string;
	contactEmail: string;
	isPickup: boolean;
	pickupAddress: Address;
}

export interface PaymentFormValues {
	type: string;
	amount: number | string;
	description: string;
	quantity?: number;
	unit?: string;
	scheduledDate?: string;
	scheduledTime?: string;
	contactPhone: string;
	contactEmail: string;
	isPickup?: boolean;
	pickupAddress?: Address;
}
