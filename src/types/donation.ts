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
	organization: string;
	type: "monetary" | "in-kind";
	amount?: number;
	quantity?: number;
	description: string;
	deliveryMethod: "pickup" | "dropoff";
	receiptImage?: File;
}

export interface Donation {
	id: number;
	causeTitle: string;
	amount: number;
	date: string;
	status: "completed" | "pending";
	receiptUrl?: string;
	impact: string;
}
