import { DonationType } from "./donation";
export interface Cause {
	id: string;
	title: string;
	description: string;
	targetAmount: number;
	raisedAmount: number;
	imageUrl: string;
	tags: string[];
	organizationId: string;
	organizationName?: string;
	createdAt: string;
	updatedAt: string;
	donorCount?: number;
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
		createdAt: string;
		updatedAt: string;
		donorCount?: number;
		acceptedDonationTypes?: DonationType[];
		acceptanceType?: "money" | "items" | "both";
		donationItems?: string[];
		endDate: Date;
	};
}
