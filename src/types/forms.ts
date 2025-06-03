import { DonationType, ImprovedDonationFormValues } from "./donation";

// Re-export to maintain compatibility
export type { ImprovedDonationFormValues };

// Event handler types
export interface SelectChangeEvent {
	target: {
		value: string;
	};
}

export interface InputChangeEvent {
	target: {
		name: string;
		value: string;
	};
}

// Form submission handler types
export interface FormSubmissionHandler<T> {
	(values: T): Promise<void>;
}

// Donation form specific types
export interface DonationFormProps {
	cause: CauseWithDetails;
	onSubmit: FormSubmissionHandler<ImprovedDonationFormValues>;
	isLoading?: boolean;
}

// Enhanced cause interface for donation forms
export interface CauseWithDetails {
	cause: {
		id: string;
		_id: string;
		title: string;
		description: string;
		targetAmount: number;
		raisedAmount: number;
		imageUrl: string;
		tags: string[];
		organizationId: string;
		organizationName?: string;
		organizationUserId?: string;
		createdAt: string;
		updatedAt: string;
		donorCount?: number;
		itemDonations?: number;
		acceptedDonationTypes: DonationType[];
		acceptanceType: "money" | "items" | "both";
		donationItems: string[];
	};
	campaign?: {
		_id: string;
		title: string;
		description: string;
		startDate: string;
		endDate: string;
	};
}

// Import the form values interface from donation.ts to avoid duplication

// Campaign selection types
export interface CampaignOption {
	_id: string;
	title: string;
	description: string;
	status: "ACTIVE" | "DRAFT" | "COMPLETED";
}

export interface CampaignSelectionProps {
	campaigns: CampaignOption[];
	selectedCampaignId: string;
	onCampaignChange: (event: SelectChangeEvent) => void;
	onAddToCampaign: () => Promise<void>;
	isLoading?: boolean;
}
