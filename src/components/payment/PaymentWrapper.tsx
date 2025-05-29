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

				const result = await createPaymentIntent(donationData).unwrap();
				setClientSecret(result.clientSecret);
				setPaymentIntentId(result.paymentIntentId);
			} catch (err: unknown) {
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
