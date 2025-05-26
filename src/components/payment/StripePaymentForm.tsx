"use client";

import { useConfirmPaymentMutation } from "@/store/api/paymentApi";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Typography,
} from "@mui/material";
import {
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";
import PaymentSuccessAnimation from "./PaymentSuccessAnimation";
import ConfettiAnimation from "./ConfettiAnimation";

interface StripePaymentFormProps {
	clientSecret: string;
	paymentIntentId: string;
	donationData: {
		cause: string;
		organization: string;
		campaign?: string;
		description: string;
		contactPhone: string;
		contactEmail: string;
	};
	amount: number;
	onSuccess: (donation: any) => void;
	onError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
	clientSecret,
	paymentIntentId,
	donationData,
	amount,
	onSuccess,
	onError,
}) => {
	const stripe = useStripe();
	const elements = useElements();
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [donationResult, setDonationResult] = useState<any>(null);
	const [confirmPayment] = useConfirmPaymentMutation();

	useEffect(() => {
		if (!stripe) {
			return;
		}

		if (!clientSecret) {
			return;
		}

		stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
			switch (paymentIntent?.status) {
				case "succeeded":
					setMessage("Payment succeeded!");
					break;
				case "processing":
					setMessage("Your payment is processing.");
					break;
				case "requires_payment_method":
					setMessage("Your payment was not successful, please try again.");
					break;
				default:
					setMessage("Something went wrong.");
					break;
			}
		});
	}, [stripe, clientSecret]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) {
			console.error("Stripe or elements not loaded");
			setMessage("Payment system not ready. Please try again.");
			return;
		}

		setIsLoading(true);
		console.log("Starting payment confirmation...");

		// First, check if the payment element is complete
		const paymentElement = elements.getElement("payment");
		if (!paymentElement) {
			console.error("Payment element not found");
			setMessage(
				"Payment form not loaded properly. Please refresh and try again."
			);
			setIsLoading(false);
			return;
		}

		// Submit the payment element to collect payment method
		const { error: submitError } = await elements.submit();
		if (submitError) {
			console.error("Payment element submit error:", submitError);
			setMessage(submitError.message || "Please complete all payment fields");
			setIsLoading(false);
			return;
		}

		console.log(
			"Payment element submitted successfully, confirming payment..."
		);

		const { error, paymentIntent } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/dashboard/donor/donations`,
			},
			redirect: "if_required",
		});

		if (error) {
			console.error("Stripe payment error:", error);
			if (error.type === "card_error" || error.type === "validation_error") {
				setMessage(error.message || "An error occurred");
				onError(error.message || "Payment failed");
			} else {
				setMessage("An unexpected error occurred.");
				onError("An unexpected error occurred");
			}
			setIsLoading(false);
			return;
		}

		console.log("Stripe payment succeeded:", paymentIntent);

		// Payment succeeded, now confirm with backend
		try {
			console.log("Confirming payment with backend...", {
				paymentIntentId,
				donationData,
			});

			const result = await confirmPayment({
				paymentIntentId,
				donationData,
			}).unwrap();

			console.log("Backend confirmation successful:", result);

			// Store donation result for animation
			setDonationResult(result.data);

			// Show success animation
			setShowConfetti(true);
			setShowSuccessAnimation(true);

			// Don't call onSuccess immediately - let animation handle it
		} catch (err: any) {
			console.error("Error confirming payment with backend:", err);
			console.error("Full error object:", JSON.stringify(err, null, 2));
			const errorMessage = err?.data?.message || "Failed to create donation";
			setMessage(errorMessage);
			onError(errorMessage);
		}

		setIsLoading(false);
	};

	const paymentElementOptions = {
		layout: "tabs" as const,
		fields: {
			billingDetails: "auto" as const,
		},
		terms: {
			card: "auto" as const,
		},
	};

	return (
		<>
			{/* Confetti Animation */}
			{showConfetti && (
				<ConfettiAnimation duration={4000} particleCount={150} />
			)}

			{/* Success Animation Modal */}
			{showSuccessAnimation && donationResult && (
				<PaymentSuccessAnimation
					donationData={{
						amount: amount,
						causeName: donationData.cause || "Unknown Cause",
						organizationName:
							donationData.organization || "Unknown Organization",
						donationId: donationResult.id || "N/A",
					}}
					onClose={() => {
						setShowSuccessAnimation(false);
						setShowConfetti(false);
						onSuccess(donationResult);
					}}
					onDownloadReceipt={() => {
						// Handle receipt download
						console.log("Download receipt for:", donationResult.id);
					}}
					onViewDonations={() => {
						setShowSuccessAnimation(false);
						setShowConfetti(false);
						onSuccess(donationResult);
						// Navigate to donations page
						window.location.href = "/dashboard/donations";
					}}
					onGoHome={() => {
						setShowSuccessAnimation(false);
						setShowConfetti(false);
						onSuccess(donationResult);
						// Navigate to home
						window.location.href = "/dashboard";
					}}
				/>
			)}

			<Card sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
				<CardContent>
					<Typography
						variant="h6"
						gutterBottom
						sx={{ color: "#287068", fontWeight: 600 }}
					>
						Complete Your Donation
					</Typography>

					<Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
						<Typography variant="body2" color="text.secondary">
							Donation Amount: <strong>${amount.toFixed(2)}</strong>
						</Typography>
					</Box>

					<form id="payment-form" onSubmit={handleSubmit}>
						<Box sx={{ mb: 3 }}>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								Please enter your payment details below:
							</Typography>
							<PaymentElement
								id="payment-element"
								options={paymentElementOptions}
							/>
						</Box>

						<Button
							disabled={isLoading || !stripe || !elements}
							id="submit"
							type="submit"
							variant="contained"
							fullWidth
							sx={{
								mt: 2,
								py: 1.5,
								bgcolor: "#287068",
								"&:hover": {
									bgcolor: "#1f5a52",
								},
								"&:disabled": {
									bgcolor: "grey.300",
								},
							}}
						>
							{isLoading ? (
								<Box display="flex" alignItems="center" gap={1}>
									<CircularProgress size={20} color="inherit" />
									<span>Processing Payment...</span>
								</Box>
							) : (
								`Complete Donation - $${amount.toFixed(2)}`
							)}
						</Button>

						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ mt: 1, display: "block", textAlign: "center" }}
						>
							Your payment is secured by Stripe. We never store your card
							details.
						</Typography>

						{message && (
							<Alert
								severity={message.includes("succeeded") ? "success" : "error"}
								sx={{ mt: 2 }}
							>
								{message}
							</Alert>
						)}
					</form>
				</CardContent>
			</Card>
		</>
	);
};

export default StripePaymentForm;
