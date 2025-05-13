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

export enum BloodType {
	A_POSITIVE = "A+",
	A_NEGATIVE = "A-",
	B_POSITIVE = "B+",
	B_NEGATIVE = "B-",
	AB_POSITIVE = "AB+",
	AB_NEGATIVE = "AB-",
	O_POSITIVE = "O+",
	O_NEGATIVE = "O-",
}

export enum ClothesType {
	MEN = "MEN",
	WOMEN = "WOMEN",
	CHILDREN = "CHILDREN",
	UNISEX = "UNISEX",
}

export enum FoodType {
	PERISHABLE = "PERISHABLE",
	NON_PERISHABLE = "NON_PERISHABLE",
	CANNED = "CANNED",
	FRESH = "FRESH",
}

export enum DonationStatus {
	PENDING = "PENDING",
	CONFIRMED = "CONFIRMED",
	RECEIVED = "RECEIVED",
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

export interface BaseDonationFields {
	organization: string;
	type: DonationType;
	description: string;
	isPickup: boolean;
	contactPhone: string;
	contactEmail: string;
	notes?: string;
	receiptImage?: string;
	status?: DonationStatus;
	pickupAddress?: Address;
	dropoffAddress?: Address;
	scheduledDate?: string;
	scheduledTime?: string;
}

export interface MoneyDonationFields extends BaseDonationFields {
	type: DonationType.MONEY;
	amount: number;
}

export interface BloodDonationFields extends BaseDonationFields {
	type: DonationType.BLOOD;
	bloodType: BloodType;
	quantity: number;
	unit: "ml" | "units";
	lastDonationDate?: string;
	healthConditions?: string;
}

export interface ClothesDonationFields extends BaseDonationFields {
	type: DonationType.CLOTHES;
	clothesType: ClothesType;
	quantity: number;
	unit: "pieces" | "bags";
	condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
	size?: string;
}

export interface FoodDonationFields extends BaseDonationFields {
	type: DonationType.FOOD;
	foodType: FoodType;
	quantity: number;
	unit: "kg" | "boxes" | "cans";
	expiryDate?: string;
	storageInstructions?: string;
}

export interface OtherDonationFields extends BaseDonationFields {
	type: Exclude<DonationType, DonationType.MONEY | DonationType.BLOOD | DonationType.CLOTHES | DonationType.FOOD>;
	quantity: number;
	unit: string;
	condition?: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
	dimensions?: string;
	weight?: number;
}

export type DonationFormData = MoneyDonationFields | BloodDonationFields | ClothesDonationFields | FoodDonationFields | OtherDonationFields;

export interface Donation {
	id: string;
	type: DonationType;
	amount?: number;
	description: string;
	quantity?: number;
	unit?: string;
	status: DonationStatus;
	organization: {
		id: string;
		name: string;
	};
	createdAt: string;
	updatedAt: string;
	scheduledDate?: string;
	scheduledTime?: string;
	pickupAddress?: Address;
	dropoffAddress?: Address;
	isPickup: boolean;
	contactPhone: string;
	contactEmail: string;
	notes?: string;
	receiptImage?: string;
	confirmationDate?: string;
}

export interface DonationsResponse {
	success: boolean;
	data: {
		donations: Donation[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	message: string;
}
