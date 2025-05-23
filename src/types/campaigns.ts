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
}

export interface CreateCauseBody {
	title: string;
	description: string;
	targetAmount: number;
	imageUrl: string;
	tags?: string[];
}

export interface Campaign {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
	causes: { id: string; title: string; organizationName?: string }[];
	causeCount: number;
	acceptedDonationTypes: DonationType[];
	startDate: string;
	endDate: string;
	organizationId: string;
	organizationName: string;
	status: "draft" | "active" | "completed" | "cancelled";
	totalTargetAmount: number;
	totalRaisedAmount: number;
	donorCount: number;
	createdAt: string;
	updatedAt: string;
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
	};
}
export interface CausesResponse {
	causes: Cause[];
	total: number;
	page: number;
	limit: number;
}

export interface CampaignsResponse {
	campaigns: Campaign[];
	total: number;
	totalPages: number;
	currentPage: number;
}

export interface CampaignResponse {
	campaign: Campaign;
}

export interface CampaignQueryParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
}

export interface CreateCampaignBody {
	title: string;
	description: string;
	causes: string[];
	acceptedDonationTypes: DonationType[];
	startDate: string;
	endDate: string;
}

export interface UpdateCampaignBody {
	title: string;
	description: string;
	causes: string[];
	acceptedDonationTypes: DonationType[];
	startDate: string;
	endDate: string;
	totalTargetAmount: number;
	imageUrl: string;
	status: string;
}
