"use client";

import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Box, CircularProgress, Typography } from "@mui/material";
import stripePromise from "@/lib/stripe";
import StripePaymentForm from "./StripePaymentForm";
import { useCreatePaymentIntentMutation } from "@/store/api/paymentApi";
import { PaymentWrapperProps } from "@/types/payment";

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({
	donationData,
	onSuccess,
	onError,
}) => {
	const [clientSecret, setClientSecret] = useState("");
	const [paymentIntentId, setPaymentIntentId] = useState("");
	const [createPaymentIntent, { isLoading }] = useCreatePaymentIntentMutation();

	useEffect(() => {
		const initializePayment = async () => {
			try {
				// Validate required fields
				if (!donationData.amount || donationData.amount <= 0) {
					onError("Amount is required and must be greater than 0");
					return;
				}

				if (!donationData.cause) {
					onError("Cause ID is required");
					return;
				}

				if (!donationData.organization) {
					onError("Organization ID is required");
					return;
				}

				if (!donationData.description) {
					onError("Description is required");
					return;
				}

				// Validate contact information
				if (!donationData.contactPhone) {
					onError("Contact phone is required");
					return;
				}

				if (!donationData.contactEmail) {
					onError("Contact email is required");
					return;
				}

				// Validate email format
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(donationData.contactEmail)) {
					onError("Please enter a valid email address");
					return;
				}

				// Ensure amount is a number and convert to cents for USD
				const paymentData = {
					...donationData,
					amount: Math.round(Number(donationData.amount) * 100), // Convert to cents for USD
					currency: 'usd' // Explicitly set currency to USD
				};

				console.log('Sending payment data:', {
					...paymentData,
					amount: paymentData.amount / 100, // Log the amount in dollars for readability
					currency: 'USD'
				});

				const result = await createPaymentIntent(paymentData).unwrap();
				setClientSecret(result.clientSecret);
				setPaymentIntentId(result.paymentIntentId);
			} catch (err: unknown) {
				// Enhanced error logging
				if (err instanceof Error) {
					console.error('Payment error:', {
						message: err.message,
						stack: err.stack,
						name: err.name
					});
				} else if (typeof err === 'object' && err !== null) {
					console.error('Payment error:', {
						error: err,
						errorType: typeof err,
						errorString: JSON.stringify(err, null, 2)
					});
				} else {
					console.error('Payment error:', err);
				}

				// Enhanced error message extraction
				let errorMessage = "Failed to initialize payment";

				if (err instanceof Error) {
					errorMessage = err.message;
				} else if (typeof err === 'object' && err !== null) {
					const errorObj = err as any;
					errorMessage = errorObj?.data?.message ||
						errorObj?.message ||
						errorObj?.error ||
						"An unexpected error occurred";
				}

				onError(errorMessage);
			}
		};

		initializePayment();
	}, [donationData, createPaymentIntent, onError]);

	const appearance = {
		theme: "stripe" as const,
		variables: {
			colorPrimary: "#287068",
			colorBackground: "#ffffff",
			colorText: "#30313d",
			colorDanger: "#df1b41",
			fontFamily: "Roboto, system-ui, sans-serif",
			spacingUnit: "4px",
			borderRadius: "8px",
		},
	};

	const options = {
		clientSecret,
		appearance,
	};

	if (isLoading || !clientSecret) {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				minHeight="300px"
				gap={2}
			>
				<CircularProgress sx={{ color: "#287068" }} />
				<Typography variant="body2" color="text.secondary">
					Initializing secure payment...
				</Typography>
			</Box>
		);
	}

	return (
		<Box>
			<Elements options={options} stripe={stripePromise}>
				<StripePaymentForm
					clientSecret={clientSecret}
					paymentIntentId={paymentIntentId}
					donationData={{
						amount: donationData.amount,
						cause: donationData.cause,
						organization: donationData.organization,
						campaign: donationData.campaign,
						description: donationData.description,
						contactPhone: donationData.contactPhone,
						contactEmail: donationData.contactEmail,
					}}
					amount={donationData.amount}
					onSuccess={onSuccess}
					onError={onError}
				/>
			</Elements>
		</Box>
	);
};

export default PaymentWrapper;
