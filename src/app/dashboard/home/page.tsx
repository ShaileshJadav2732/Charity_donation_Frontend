// filepath: /home/lcom/Shailesh/Demo/Charity_donation_Frontend/src/app/dashboard/home/page.tsx
"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Box, Typography, Alert } from "@mui/material";
import DonorHomePage from "@/components/dashboard/DonorHomePage";
import OrganizationHomePage from "@/components/dashboard/OrganizationHomePage";
import { useAuthContext } from "@/contexts/AuthContext";
import { DashboardLoadingScreen } from "@/components/auth/AuthLoadingScreen";

export default function HomePage() {
	const { user, isAuthenticated, isLoading } = useSelector(
		(state: RootState) => state.auth
	);
	const { isInitialized } = useAuthContext();

	// Show loading state during authentication initialization or loading
	// This prevents the flash of wrong content during page reload
	if (!isInitialized || isLoading || !user) {
		return <DashboardLoadingScreen />;
	}

	// Handle unauthenticated state
	if (!isAuthenticated) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="warning">Please log in to view your dashboard.</Alert>
			</Box>
		);
	}

	// Handle missing or invalid role
	if (!user.role || !["donor", "organization", "admin"].includes(user.role)) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">
					Invalid user role. Please contact support or try logging in again.
				</Alert>
			</Box>
		);
	}

	// Additional safety check: ensure user data is fully loaded
	// This prevents showing wrong role content during state transitions
	if (!user.email || !user.role) {
		return <DashboardLoadingScreen />;
	}

	// Render based on role - only when we're sure about the user data
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
