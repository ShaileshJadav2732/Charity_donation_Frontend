import { DonationType } from "./index";
export interface Cause {
	id: string;
	title: string;
	description: string;
	targetAmount: number;
	raisedAmount: number; // Money raised - calculated dynamically by backend
	itemDonations?: number; // Number of items donated - calculated dynamically by backend
	donorCount?: number; // Total unique donors - calculated dynamically by backend
	imageUrl: string;
	tags: string[];
	organizationId: string;
	organizationName?: string;
	organizationUserId?: string; // Add this for messaging
	createdAt: string;
	updatedAt: string;
	acceptedDonationTypes?: DonationType[];
	acceptanceType?: "money" | "items" | "both";
	donationItems?: string[];
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
	tags?: string[];
	organizationId?: string;
	minTarget?: number;
	maxTarget?: number;
	minRaised?: number;
	maxRaised?: number;
	donationType?: DonationType;
}

export interface CauseResponse {
	cause: {
		id: string;
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
		acceptedDonationTypes?: DonationType[];
		acceptanceType?: "money" | "items" | "both";
		donationItems?: string[];
		endDate: Date;
	};
}
