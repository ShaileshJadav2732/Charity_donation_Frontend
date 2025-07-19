import React from "react";
import { Chip } from "@mui/material";
import { CampaignStatus } from "@/types/campaings";

export const StatusChip = ({ status }: { status: string }) => {
	const getStatusColor = (status: string) => {
		switch (status.toUpperCase()) {
			case CampaignStatus.ACTIVE:
				return "success";
			case CampaignStatus.DRAFT:
				return "default";
			case CampaignStatus.PAUSED:
				return "warning";
			case CampaignStatus.COMPLETED:
				return "info";
			case CampaignStatus.CANCELLED:
				return "error";
			default:
				return "default";
		}
	};

	return (
		<Chip
			label={status}
			color={getStatusColor(status)}
			size="small"
			sx={{ textTransform: "capitalize" }}
		/>
	);
};

export const getDaysLeft = (endDate: string): number => {
	const end = new Date(endDate);
	const today = new Date();
	const diffTime = end.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays > 0 ? diffDays : 0;
};

export const getProgressPercentage = (
	raised: number,
	target: number
): number => {
	if (target === 0) return 0;
	const percentage = (raised / target) * 100;
	return Math.min(percentage, 100);
};

// Avatar utility function to generate consistent fallback text
export const getFallbackAvatarText = (
	userRole: string,
	donorProfile?: { firstName?: string; lastName?: string },
	orgProfile?: { name?: string },
	userEmail?: string
): string => {
	if (userRole === "donor" && donorProfile) {
		const firstName = donorProfile.firstName;
		const lastName = donorProfile.lastName;
		if (firstName && lastName) {
			return `${firstName[0] || ""}${lastName[0] || ""}`;
		} else if (firstName) {
			return firstName[0];
		}
	} else if (userRole === "organization" && orgProfile?.name) {
		return orgProfile.name[0];
	}
	// Fallback to email first character
	return userEmail?.[0]?.toUpperCase() || "?";
};
