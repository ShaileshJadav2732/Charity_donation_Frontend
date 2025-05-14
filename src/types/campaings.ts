import { DonationType } from "./donation";
import { Cause } from "./cause";

export enum CampaignStatus {
	DRAFT = "DRAFT",
	ACTIVE = "ACTIVE",
	PAUSED = "PAUSED",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
}

export interface Campaign {
	id: string;
	title: string;
	description: string;
	imageUrl?: string;
	startDate: string;
	endDate: string;
	status: CampaignStatus;
	organizationId: string;
	organizationName: string;
	organizationLogo?: string;
	totalTargetAmount: number;
	totalRaisedAmount: number;
	donorCount: number;
	causes: Cause[];
	createdAt: string;
	updatedAt: string;
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
	page: number;
	limit: number;
}

export interface CampaignResponse {
	campaign: Campaign;
}

export interface CreateCampaignBody {
	title: string;
	description: string;
	imageUrl: string;
	startDate: string;
	endDate: string;
	status: string;
	totalTargetAmount: number;
	organizations: string[];
	acceptedDonationTypes: DonationType[];
	causes: string[]; // Array of cause IDs
}

export interface UpdateCampaignBody {
	title?: string;
	description?: string;
	imageUrl?: string;
	startDate?: string;
	endDate?: string;
	status?: CampaignStatus;
}

export interface CampaignQueryParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: CampaignStatus;
	organizationId?: string;
	organizations?: string;
	startDate?: string;
	endDate?: string;
	minTarget?: number;
	maxTarget?: number;
	minRaised?: number;
	maxRaised?: number;
}
