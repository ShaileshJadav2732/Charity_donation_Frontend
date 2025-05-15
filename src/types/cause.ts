export enum DonationType {
	MONETARY = "MONETARY",
	IN_KIND = "IN_KIND",
	VOLUNTEER = "VOLUNTEER",
}

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

export interface CauseResponse {
	cause: Cause;
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
