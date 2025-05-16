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

export interface CampaignResponse {
	success: boolean;
	data: {
		campaign: {
			_id: string;
			title: string;
			description: string;
			startDate: string;
			endDate: string;
			status: "draft" | "active" | "completed" | "cancelled";
			causes: Array<{
				id: string;
				title: string;
				description?: string;
				targetAmount?: number;
				raisedAmount?: number;
			}>;
			organizations: Array<{
				_id: string;
				name: string;
				email?: string;
				phone?: string;
				address?: string;
			}>;
			totalTargetAmount: number;
			totalRaisedAmount: number;
			totalSupporters: number;
			imageUrl: string;
			acceptedDonationTypes: string[];
			createdAt: string;
			updatedAt: string;
		};
		donationStats?: Array<{
			_id: string;
			totalAmount: number;
			count: number;
		}>;
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

// export interface CampaignResponse {
// 	campaign: Campaign;
// }

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
