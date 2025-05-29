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
import { StripePaymentFormProps } from "@/types/payment";

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
	const [confirmPayment] = useConfirmPaymentMutation();

	useEffect(() => {
		if (!stripe || !clientSecret) return;

		stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
			switch (paymentIntent?.status) {
				case "succeeded":
					setMessage("Payment succeeded!");
					break;
				case "processing":
					setMessage("Your payment is processing.");
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
			setMessage("Payment system not ready. Please try again.");
			return;
		}

		const paymentElement = elements.getElement("payment");
		if (!paymentElement) {
			setMessage("Payment form not loaded. Please refresh and try again.");
			return;
		}

		setIsLoading(true);

		const { error: submitError } = await elements.submit();
		if (submitError) {
			setMessage(submitError.message || "Please complete the payment form.");
			setIsLoading(false);
			return;
		}

		const { error: stripeError } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/dashboard/donor/donations`,
			},
			redirect: "if_required",
		});

		if (stripeError) {
			const message =
				stripeError.message || "Something went wrong during the payment.";
			setMessage(message);
			onError?.(message);
			setIsLoading(false);
			return;
		}

		try {
			const result = await confirmPayment({
				paymentIntentId,
				donationData,
			}).unwrap();
			setMessage("Payment succeeded! Your donation has been processed.");
			onSuccess?.(result.data);
		} catch (err: any) {
			const message =
				err?.data?.message || "Failed to process donation after payment.";
			setMessage(message);
			onError?.(message);
		}

		setIsLoading(false);
	};

	const paymentElementOptions = {
		layout: "tabs" as const,
		fields: { billingDetails: "auto" as const },
		terms: { card: "auto" as const },
	};

	return (
		<Card sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
			<CardContent>
				<Typography
					variant="h6"
					gutterBottom
					sx={{ color: "#287068", fontWeight: 600, mb: 2 }}
				>
					Complete Your Donation
				</Typography>

				<Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
					<Typography variant="body2" color="text.secondary">
						Donation Amount: <strong>₹{amount.toFixed(2)}</strong>
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
						type="submit"
						variant="contained"
						fullWidth
						sx={{
							mt: 2,
							py: 1.5,
							bgcolor: "#287068",
							"&:hover": { bgcolor: "#1f5a52" },
							"&:disabled": { bgcolor: "grey.300" },
						}}
					>
						{isLoading ? (
							<Box display="flex" alignItems="center" gap={1}>
								<CircularProgress size={20} color="inherit" />
								<span>Processing Payment...</span>
							</Box>
						) : (
							`Complete Donation - ₹${amount.toFixed(2)}`
						)}
					</Button>

					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ mt: 1, display: "block", textAlign: "center" }}
					>
						Your payment is secured by Stripe. We never store your card details.
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
	);
};

export default StripePaymentForm;
