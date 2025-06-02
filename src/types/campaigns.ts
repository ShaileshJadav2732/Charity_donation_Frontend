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
	totalRaisedAmount: number; // Money raised - calculated dynamically by backend
	totalItemDonations?: number; // Items donated - calculated dynamically by backend
	donorCount: number; // Total unique donors - calculated dynamically by backend
	createdAt: string;
	updatedAt: string;
}

export interface CauseResponse {
	cause: {
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
