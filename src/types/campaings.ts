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

export interface Campaign {
	id: string;
	title: string;
	description: string;
	causes: { id: string; title: string; organizationName?: string }[];
	acceptedDonationTypes: DonationType[];
	startDate: string;
	endDate: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CausesResponse {
	causes: Cause[];
	total: number;
	page: number;
	limit: number;
}

export interface CampaignResponse {
	campaign: Campaign;
}

export interface CreateCampaignBody {
	title: string;
	description: string;
	causes: string[];
	acceptedDonationTypes: DonationType[];
	startDate: string;
	endDate: string;
}
