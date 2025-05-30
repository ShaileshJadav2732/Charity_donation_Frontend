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
		if (clientSecret) return; // Skip if clientSecret is set
		const initializePayment = async () => {
			try {
				if (!donationData.amount || donationData.amount < 50) {
					throw new Error("Amount is required and must be at least ₹50");
				}
				// ... other validations
				const paymentData = {
					...structuredClone(donationData),
					amount: Number(donationData.amount),
					currency: "inr",
				};
				const result = await createPaymentIntent(paymentData).unwrap();
				if (!result.clientSecret || !result.paymentIntentId) {
					throw new Error("Invalid response from server");
				}
				setClientSecret(result.clientSecret);
				setPaymentIntentId(result.paymentIntentId);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to initialize payment";
	
				onError(errorMessage);
			}
		};
		initializePayment();
	}, [donationData, createPaymentIntent, onError, clientSecret]);
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
