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

export interface DonationFormData {
	organization: string;
	type: DonationType;
	amount?: string;
	description: string;
	quantity?: string;
	unit?: string;
	scheduledDate?: string;
	scheduledTime?: string;
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
	isPickup: boolean;
	contactPhone: string;
	contactEmail: string;
	notes?: string;
	receiptImage?: string;
	status: DonationStatus;
}

export interface Donation {
	_id: string;
	donor: {
		_id: string;
		name: string;
		email: string;
	};
	organization: {
		_id: string;
		name: string;
		email: string;
	};
	type: DonationType;
	status: DonationStatus;
	amount?: number;
	description: string;
	quantity?: number;
	unit?: string;
	scheduledDate?: Date;
	scheduledTime?: string;
	pickupAddress?: Address;
	dropoffAddress?: Address;
	isPickup: boolean;
	contactPhone: string;
	contactEmail: string;
	receiptImage?: string;
	confirmationDate?: Date;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}
