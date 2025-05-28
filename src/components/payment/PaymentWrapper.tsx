"use client";

import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Box, CircularProgress, Typography } from "@mui/material";
import stripePromise from "@/lib/stripe";
import StripePaymentForm from "./StripePaymentForm";
import { useCreatePaymentIntentMutation } from "@/store/api/paymentApi";
import { PaymentWrapperProps } from "@/types/payment";

// Interface is now imported from types/payment.ts

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({
	donationData,
	onSuccess,
	onError,
}) => {
	const [clientSecret, setClientSecret] = useState("");
	const [paymentIntentId, setPaymentIntentId] = useState("");
	const [createPaymentIntent, { isLoading }] = useCreatePaymentIntentMutation();

	useEffect(() => {
		// Create PaymentIntent as soon as the component loads
		const initializePayment = async () => {
			try {
				// Validate required fields before sending
				console.log("=== PAYMENT WRAPPER INITIALIZATION ===");
				console.log(
					"PaymentWrapper - Full donation data:",
					JSON.stringify(donationData, null, 2)
				);

				if (!donationData.amount || donationData.amount <= 0) {
					console.error(
						"VALIDATION ERROR: Invalid amount:",
						donationData.amount
					);
					onError("Amount is required and must be greater than 0");
					return;
				}

				if (!donationData.cause) {
					console.error(
						"VALIDATION ERROR: Missing cause ID:",
						donationData.cause
					);
					onError("Cause ID is required");
					return;
				}

				if (!donationData.organization) {
					console.error(
						"VALIDATION ERROR: Missing organization ID:",
						donationData.organization
					);
					onError("Organization ID is required");
					return;
				}

				if (!donationData.description) {
					console.error(
						"VALIDATION ERROR: Missing description:",
						donationData.description
					);
					onError("Description is required");
					return;
				}

				console.log("All validations passed, creating payment intent...");
				const result = await createPaymentIntent(donationData).unwrap();
				console.log("Payment intent created successfully:", result);
				setClientSecret(result.clientSecret);
				setPaymentIntentId(result.paymentIntentId);
			} catch (err: unknown) {
				console.error("ERROR creating payment intent:", err);
				console.error("Full error object:", JSON.stringify(err, null, 2));
				const errorMessage =
					(err as { data?: { message?: string } })?.data?.message ||
					"Failed to initialize payment";
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
