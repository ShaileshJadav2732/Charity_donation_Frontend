"use client";

import ImprovedDonationForm from "@/components/donation/ImprovedDonationForm";
import { useGetCauseByIdQuery } from "@/store/api/causeApi";
import { useCreateDonationMutation } from "@/store/api/donationApi";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function DonationForm() {
	const params = useParams();
	const router = useRouter();
	const causeId = params.id;
	const { data: cause, isLoading } = useGetCauseByIdQuery(causeId as string);
	const [createDonation, { isLoading: creating }] = useCreateDonationMutation();

	const handleDonationSubmit = async (values: any) => {
		try {
			const payload = {

				cause: causeId,
				organization: cause?.cause?.organizationId || "",
				type: values.type,
				amount: values.type === "MONEY" ? Number(values.amount) : undefined,
				description: values.description,
				quantity: values.type !== "MONEY" ? Number(values.quantity) : undefined,
				unit: values.type !== "MONEY" ? values.unit : undefined,
				scheduledDate:
					values.type !== "MONEY" ? values.scheduledDate : undefined,
				scheduledTime:
					values.type !== "MONEY" ? values.scheduledTime : undefined,
				isPickup: values.type === "MONEY" ? false : Boolean(values.isPickup),
				contactPhone: values.contactPhone,
				contactEmail: values.contactEmail,
				pickupAddress:
					values.isPickup && values.type !== "MONEY"
						? values.pickupAddress
						: undefined,
				dropoffAddress:
					!values.isPickup && values.type !== "MONEY"
						? {
							street: "ORGANIZATION_ADDRESS",
							city: "",
							state: "",
							zipCode: "",
							country: "",
						}
						: undefined,
			};

			console.log("Submitting donation with payload:", payload);


			toast.success("Donation created successfully!");

			// Redirect to donations page after successful creation
			setTimeout(() => {
				router.push("/dashboard/donations");
			}, 1500);
		} catch (error: any) {
			// Handle specific authentication errors
			if (error?.status === 401) {
				toast.error("Authentication failed. Please log in again.");
				router.push("/login");
			} else if (error?.data?.message) {
				toast.error(error.data.message);
			} else {
				toast.error("Failed to create donation. Please try again.");
			}
		}
	};

	const handlePaymentSubmit = async (values: any) => {
		try {
			// Check if user is logged in
			const token = localStorage.getItem('token');
			if (!token) {
				toast.error("Please log in to make a donation");
				router.push("/login");
				return;
			}

			// Create the complete donation payload

			const donationPayload = {
				cause: causeId,
				organization: cause?.cause?.organizationId || "",
				type: values.type,
				amount: values.type === "MONEY" ? Number(values.amount) : undefined,
				description: values.description,
				quantity: values.type !== "MONEY" ? Number(values.quantity) : undefined,
				unit: values.type !== "MONEY" ? values.unit : undefined,
				scheduledDate:
					values.type !== "MONEY" ? values.scheduledDate : undefined,
				scheduledTime:
					values.type !== "MONEY" ? values.scheduledTime : undefined,
				isPickup: values.type === "MONEY" ? false : Boolean(values.isPickup),
				contactPhone: values.contactPhone,
				contactEmail: values.contactEmail,
				pickupAddress:
					values.isPickup && values.type !== "MONEY"
						? values.pickupAddress
						: undefined,
				dropoffAddress:
					!values.isPickup && values.type !== "MONEY"
						? {
							street: "ORGANIZATION_ADDRESS",
							city: "",
							state: "",
							zipCode: "",
							country: "",
						}
						: undefined,
			};

			console.log("Creating Stripe checkout session with:", donationPayload);


			const res = await axios.post(
				"http://localhost:8080/api/payments/create-checkout-session",
				{

					amount: donationPayload.amount,
					organizationId: donationPayload.organization,
					causeId,
					description: donationPayload.description,
					contactPhone: donationPayload.contactPhone,
					contactEmail: donationPayload.contactEmail
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			if (res.data.url) {
				window.location.href = res.data.url;
			} else {
				throw new Error("No checkout URL received");
			}
		} catch (err: any) {
			console.error("Error redirecting to Stripe:", err);
			if (err.response?.data?.message) {
				toast.error(err.response.data.message);
			} else {
				toast.error("Payment failed. Please try again.");
			}
		}
	};

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "50vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!cause) {
		return (
			<Box sx={{ textAlign: "center", mt: 4 }}>
				<Typography variant="h6" color="error">
					Cause not found
				</Typography>
			</Box>
		);
	}

	return (
		<ImprovedDonationForm
			cause={cause}
			onSubmit={handleDonationSubmit}
			onPaymentSubmit={handlePaymentSubmit}
			isLoading={creating}
		/>
	);
}
