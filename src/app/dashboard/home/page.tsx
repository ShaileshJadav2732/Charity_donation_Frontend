"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Box, Typography, Alert } from "@mui/material";
import DonorHomePage from "@/components/dashboard/DonorHomePage";
import OrganizationHomePage from "@/components/dashboard/OrganizationHomePage";

export default function HomePage() {
	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.auth
	);

	if (!isAuthenticated || !user) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="warning">Please log in to view your dashboard.</Alert>
			</Box>
		);
	}

	return (
		<Box>
			{user.role === "donor" && <DonorHomePage />}
			{user.role === "organization" && <OrganizationHomePage />}
			{user.role === "admin" && (
				<Box sx={{ p: 3 }}>
					<Typography variant="h4" gutterBottom>
						Admin Dashboard
					</Typography>
					<Alert severity="info">Admin dashboard coming soon!</Alert>
				</Box>
			)}
		</Box>
	);
}
