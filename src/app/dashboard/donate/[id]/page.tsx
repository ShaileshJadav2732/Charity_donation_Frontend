"use client";

import { Box, Typography, CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useCreateDonationMutation } from "@/store/api/donationApi";
import toast from "react-hot-toast";
import { useGetCauseByIdQuery } from "@/store/api/causeApi";
import React from "react";
import ImprovedDonationForm from "@/components/donation/ImprovedDonationForm";

export default function DonationForm() {
	const params = useParams();
	const router = useRouter();
	const causeId = params.id;
	const { data: cause, isLoading } = useGetCauseByIdQuery(causeId as string);
	const [createDonation, { isLoading: creating }] = useCreateDonationMutation();

	const handleDonationSubmit = async (values: any) => {
		try {
			const payload = {
				donor: "current_user", // This will be handled by the backend auth middleware
				cause: causeId,
				organization: (cause?.cause as any)?.organizationId || "",
				type: values.type,
				amount: values.type === "MONEY" ? Number(values.amount) : undefined,
				description: values.description,
				quantity: values.type !== "MONEY" ? Number(values.quantity) : undefined,
				unit: values.type !== "MONEY" ? values.unit : undefined,
				scheduledDate:
					values.type !== "MONEY" ? values.scheduledDate : undefined,
				scheduledTime:
					values.type !== "MONEY" ? values.scheduledTime : undefined,
				isPickup: values.type === "MONEY" ? false : Boolean(values.isPickup), // Always send boolean
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

			console.log("Sending donation payload:", payload);
			await createDonation(payload).unwrap();
			toast.success("Donation created successfully!");

			// Redirect to donations page after successful creation
			setTimeout(() => {
				router.push("/dashboard/donations");
			}, 1500);
		} catch (error: any) {
			console.error("Donation creation error:", error);
			toast.error(error?.data?.message || "Failed to create donation");
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
			isLoading={creating}
		/>
	);
}
