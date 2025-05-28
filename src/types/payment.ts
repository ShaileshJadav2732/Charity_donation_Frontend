// Payment-related types

export interface PaymentDonationData {
	amount: number;
	cause: string;
	organization: string;
	campaign?: string;
	description: string;
	contactPhone: string;
	contactEmail: string;
}

export interface PaymentResult {
	id: string;
	status: 'succeeded' | 'processing' | 'requires_action' | 'failed';
	amount: number;
	currency: string;
	paymentIntentId: string;
	donationId?: string;
	receiptUrl?: string;
	createdAt: string;
}

export interface StripePaymentFormProps {
	clientSecret: string;
	paymentIntentId: string;
	donationData: PaymentDonationData;
	amount: number;
	onSuccess: (donation: PaymentResult) => void;
	onError: (error: string) => void;
}

export interface PaymentWrapperProps {
	donationData: PaymentDonationData;
	onSuccess: (donation: PaymentResult) => void;
	onError: (error: string) => void;
	onCancel: () => void;
}

export interface PaymentIntentResponse {
	success: boolean;
	clientSecret: string;
	paymentIntentId: string;
	amount: number;
}

export interface PaymentConfirmationRequest {
	paymentIntentId: string;
	donationData: PaymentDonationData;
}

export interface PaymentConfirmationResponse {
	success: boolean;
	donation: PaymentResult;
	message?: string;
}

// Stripe-specific types
export interface StripeError {
	type: string;
	code?: string;
	message: string;
	decline_code?: string;
	charge?: string;
	payment_intent?: {
		id: string;
		status: string;
	};
}

export interface StripePaymentElementOptions {
	layout?: 'tabs' | 'accordion';
	defaultValues?: {
		billingDetails?: {
			name?: string;
			email?: string;
			phone?: string;
			address?: {
				line1?: string;
				line2?: string;
				city?: string;
				state?: string;
				postal_code?: string;
				country?: string;
			};
		};
	};
}
