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
	causeId: string;
	amount: number;
	paymentMethod: string;
	isAnonymous: boolean;
	comment?: string;
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

export interface DonationsResponse {
	donations: Donation[];
	total: number;
	page: number;
	limit: number;
}

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
