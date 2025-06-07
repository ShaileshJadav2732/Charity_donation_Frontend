"use client";

import ImprovedDonationForm from "@/components/donation/ImprovedDonationForm";
import { useGetCauseByIdQuery } from "@/store/api/causeApi";
import { useCreateDonationMutation } from "@/store/api/donationApi";
import { useGetOrganizationByCauseIdQuery } from "@/store/api/organizationApi";
import StartConversationButton from "@/components/messaging/StartConversationButton";
import {
	Box,
	CircularProgress,
	Typography,
	Card,
	CardContent,
	Divider,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import toast from "react-hot-toast";
import axios from "axios";

export default function DonationForm() {
	const params = useParams();
	const router = useRouter();
	const causeId = params.id;
	const { user } = useSelector((state: RootState) => state.auth);
	const { data: cause, isLoading } = useGetCauseByIdQuery(causeId as string);
	const { data: organizationData } = useGetOrganizationByCauseIdQuery(
		causeId as string,
		{
			skip: !causeId,
		}
	);
	const [createDonation, { isLoading: creating }] = useCreateDonationMutation();

	const handleDonationSubmit = async (values: {
		type: string;
		amount?: number | string;
		quantity: number;
		unit: string;
		description: string;
		scheduledDate: string;
		scheduledTime: string;
		contactPhone: string;
		contactEmail: string;
		isPickup: boolean;
		pickupAddress: {
			street: string;
			city: string;
			state: string;
			zipCode: string;
			country: string;
		};
	}) => {
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

			// Actually call the API to create the donation
			const result = await createDonation(payload).unwrap();

			console.log("Donation created successfully:", result);
			toast.success("Donation created successfully!");

			// Redirect to donations page after successful creation
			setTimeout(() => {
				router.push("/dashboard/donations");
			}, 1500);
		} catch (error: unknown) {
			// Handle specific authentication errors
			const apiError = error as {
				status?: number;
				data?: { message?: string };
			};
			if (apiError?.status === 401) {
				toast.error("Authentication failed. Please log in again.");
				router.push("/login");
			} else if (apiError?.data?.message) {
				toast.error(apiError.data.message);
			} else {
				toast.error("Failed to create donation. Please try again.");
			}
		}
	};

	const handlePaymentSubmit = async (values: {
		type: string;
		amount: number | string;
		description: string;
		quantity?: number;
		unit?: string;
		scheduledDate?: string;
		scheduledTime?: string;
		contactPhone: string;
		contactEmail: string;
		isPickup?: boolean;
		pickupAddress?: {
			street: string;
			city: string;
			state: string;
			zipCode: string;
			country: string;
		};
	}) => {
		try {
			// Check if user is logged in
			const token = localStorage.getItem("token");
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
					contactEmail: donationPayload.contactEmail,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);

			if (res.data.url) {
				window.location.href = res.data.url;
			} else {
				throw new Error("No checkout URL received");
			}
		} catch (err: unknown) {
			const apiError = err as { response?: { data?: { message?: string } } };
			if (apiError.response?.data?.message) {
				toast.error(apiError.response.data.message);
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
		<Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
			{/* Message Organization Section */}
			{user?.role === "donor" && organizationData?.organization && (
				<Card sx={{ mb: 3 }}>
					<CardContent>
						<Typography variant="h6" sx={{ mb: 2, color: "#2f8077" }}>
							Have Questions About This Cause?
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Message {organizationData.organization.name} directly to ask
							questions about this cause before donating.
						</Typography>
						{/* Use organization.userId (direct User ID) for organizations */}
						<StartConversationButton
							recipientId={organizationData.organization.userId}
							recipientType="user"
							recipientName={organizationData.organization.name}
							recipientRole="organization"
							relatedCause={causeId as string}
							variant="button"
							size="medium"
						/>
					</CardContent>
				</Card>
			)}

			<Divider sx={{ mb: 3 }} />

			{/* Donation Form */}
			{cause && (
				<ImprovedDonationForm
					cause={{
						...cause,
						cause: {
							...cause.cause,
							_id: cause.cause.id,
						},
					}}
					onSubmit={handleDonationSubmit}
					onPaymentSubmit={handlePaymentSubmit}
					isLoading={creating}
				/>
			)}
		</Box>
	);
}
