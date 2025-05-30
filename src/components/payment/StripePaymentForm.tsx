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

		stripe
			.retrievePaymentIntent(clientSecret)
			.then(({ paymentIntent }) => {
				switch (paymentIntent?.status) {
					case "succeeded":
						setMessage("Payment succeeded!");
						// Call onSuccess if payment already completed
						onSuccess?.({
							id: paymentIntentId,
							status: paymentIntent.status,
							amount: amount,
							currency: paymentIntent.currency || "inr",
							paymentIntentId: paymentIntentId,
							createdAt: new Date().toISOString(),
						});
						break;
					case "processing":
						setMessage("Your payment is processing.");
						break;
					case "requires_payment_method":
						setMessage("Your payment was not successful, please try again.");
						break;
					case "canceled":
						setMessage("Payment was canceled.");
						break;
					default:
						// Payment is ready to be processed
						setMessage(null);
						break;
				}
			})
			.catch((error) => {
				setMessage(
					"Unable to load payment information. Please refresh the page."
				);
				onError?.("Unable to load payment information.");
			});
	}, [stripe, clientSecret, paymentIntentId, amount, onSuccess, onError]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) {
			const errorMsg = "Payment system not ready. Please try again.";
			setMessage(errorMsg);
			onError?.(errorMsg);
			return;
		}

		const paymentElement = elements.getElement("payment");
		if (!paymentElement) {
			const errorMsg = "Payment form not loaded. Please refresh and try again.";
			setMessage(errorMsg);
			onError?.(errorMsg);
			return;
		}

		setIsLoading(true);
		setMessage(null);

		try {
			// Submit the form to validate all fields
			const { error: submitError } = await elements.submit();
			if (submitError) {
				setMessage(submitError.message || "Please complete the payment form.");
				onError?.(submitError.message || "Please complete the payment form.");
				return;
			}

			// Confirm the payment
			const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
				{
					elements,
					confirmParams: {
						return_url: `${window.location.origin}/dashboard/donor/donations`,
					},
					redirect: "if_required",
				}
			);

			if (stripeError) {
				const errorMessage =
					stripeError.message || "Something went wrong during the payment.";
				setMessage(errorMessage);
				onError?.(errorMessage);
				return;
			}

			// Handle successful payment
			if (paymentIntent && paymentIntent.status === "succeeded") {
				try {
					// Try to confirm the donation on your backend
					const result = await confirmPayment({
						paymentIntentId,
						donationData,
					}).unwrap();

					setMessage("Payment succeeded! Your donation has been processed.");
					onSuccess?.(result.data);
				} catch (apiError) {
					// Even if API fails, payment succeeded - webhook will handle it
					console.warn(
						"API confirmation failed, but payment succeeded:",
						apiError
					);
					setMessage("Payment succeeded! Your donation is being processed.");
					onSuccess?.({
						id: paymentIntentId,
						status: paymentIntent.status,
						amount: amount,
						currency: paymentIntent.currency || "inr",
						paymentIntentId: paymentIntentId,
						createdAt: new Date().toISOString(),
					});
				}
			} else if (paymentIntent && paymentIntent.status === "processing") {
				setMessage(
					"Your payment is being processed. You'll receive a confirmation shortly."
				);
				onSuccess?.({
					id: paymentIntentId,
					status: paymentIntent.status,
					amount: amount,
					currency: paymentIntent.currency || "inr",
					paymentIntentId: paymentIntentId,
					createdAt: new Date().toISOString(),
				});
			} else {
				const errorMsg = "Payment was not completed successfully.";
				setMessage(errorMsg);
				onError?.(errorMsg);
			}
		} catch (error) {
			const errorMsg = "An unexpected error occurred. Please try again.";
			setMessage(errorMsg);
			onError?.(errorMsg);
		} finally {
			setIsLoading(false);
		}
	};

	const paymentElementOptions = {
		layout: "tabs" as const,
		fields: {
			billingDetails: "auto" as const,
		},
		terms: { card: "auto" as const },
		defaultValues: {
			billingDetails: {
				email: donationData.contactEmail || "",
				phone: donationData.contactPhone || "",
			},
		},
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
							severity={
								message.includes("succeeded") || message.includes("processing")
									? "success"
									: message.includes("canceled")
									? "warning"
									: "error"
							}
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
