import { DonationType } from "./donation";

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
		createdAt: string;
		updatedAt: string;
	};
	campaign?: {
		_id: string;
		title: string;
		description: string;
		startDate: string;
		endDate: string;
	};
}

// Import the form values interface
export interface ImprovedDonationFormValues {
	type: DonationType;
	amount: string | number;
	description: string;
	quantity: number;
	unit: string;
	scheduledDate: string;
	scheduledTime: string;
	isPickup: boolean;
	contactPhone: string;
	contactEmail: string;
	pickupAddress: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
}

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
