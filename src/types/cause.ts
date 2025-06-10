import { DonationType } from "./donation";
export interface Cause {
	id: string;
	_id?: string; // Backend sometimes returns _id
	title: string;
	description: string;
	targetAmount: number;
	raisedAmount: number;
	imageUrl: string;
	tags: string[];
	organizationId: string;
	organizationName?: string;
	organizationUserId?: string; // Add this for messaging
	createdAt: string;
	updatedAt: string;
	donorCount?: number;
	itemDonations?: number; // Number of items donated
	acceptedDonationTypes: DonationType[]; // Required field from backend
	acceptanceType: "money" | "items" | "both"; // Required field from backend
	donationItems: string[]; // Required field from backend
}

export interface CreateCauseBody {
	title: string;
	description: string;
	targetAmount: number;
	imageUrl: string;
	tags: string[];
	organizationId: string;
}

export interface UpdateCauseBody {
	title?: string;
	description?: string;
	targetAmount?: number;
	imageUrl?: string;
	tags?: string[];
}

export interface CausesResponse {
	causes: Cause[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CauseQueryParams {
	page?: number;
	limit?: number;
	search?: string;
	tag?: string;
	tags?: string[];
	organizationId?: string;
	minTarget?: number;
	maxTarget?: number;
	minRaised?: number;
	maxRaised?: number;
	donationType?: DonationType;
	acceptanceType?: "money" | "items" | "both";
	acceptanceTypes?: "money" | "items" | "both";
}

export interface CauseResponse {
	cause: {
		id: string;
		_id?: string;
		title: string;
		description: string;
		targetAmount: number;
		raisedAmount: number;
		imageUrl: string;
		tags: string[];
		organizationId: string;
		organizationName?: string;
		organizationUserId?: string; // Add this for messaging
		createdAt: string;
		updatedAt: string;
		donorCount?: number;
		itemDonations?: number;
		acceptedDonationTypes: DonationType[];
		acceptanceType: "money" | "items" | "both";
		donationItems: string[];
		endDate?: Date; // Optional since not always present
	};
}
