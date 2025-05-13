import { DonationType } from "./donations";

export interface Cause {
	_id: string;
	title: string;
	description: string;
	targetAmount: number;
	raisedAmount: number;
	imageUrl: string;
	tags: string[];
	organizationId: string;
	createdAt: string;
	updatedAt: string;
}

export interface Campaign {
	_id: string;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	status: "draft" | "active" | "completed" | "cancelled";
	causes: Cause[];
	organizations: {
		_id: string;
		name: string;
		logoUrl: string;
	}[];
	totalTargetAmount: number;
	totalRaisedAmount: number;
	totalSupporters: number;
	imageUrl: string;
	tags: string[];
	acceptedDonationTypes: DonationType[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateCampaignBody {
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	causes: string[];
	imageUrl: string;
	tags: string[];
	acceptedDonationTypes: DonationType[];
}

export interface UpdateCampaignBody extends Partial<CreateCampaignBody> {
	status?: "draft" | "active" | "completed" | "cancelled";
}

export interface CampaignResponse {
	success: boolean;
	data: Campaign;
	message: string;
}

export interface CampaignsResponse {
	success: boolean;
	data: {
		campaigns: Campaign[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	message: string;
}

export interface CausesResponse {
	success: boolean;
	data: {
		causes: Cause[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	message: string;
}
