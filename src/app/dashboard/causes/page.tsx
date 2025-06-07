"use client";
import React from "react";
import DonorCausePage from "@/components/cause/DonorCausePage";
import OrganizationCausePage from "@/components/cause/OrganizationCausePage";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAuthContext } from "@/contexts/AuthContext";
import { Box, Alert } from "@mui/material";
import { RoleLoadingScreen } from "@/components/auth/AuthLoadingScreen";

const Page = () => {
	const { user, isAuthenticated, isLoading } = useSelector(
		(state: RootState) => state.auth
	);
	const { isInitialized } = useAuthContext();

	if (!isInitialized || isLoading || !user) {
		return <RoleLoadingScreen contentType="causes" />;
	}

	// Handle unauthenticated state
	if (!isAuthenticated) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="warning">Please log in to view causes.</Alert>
			</Box>
		);
	}

	// Handle missing or invalid role
	if (!user.role || !["donor", "organization"].includes(user.role)) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">
					Invalid user role. Please contact support or try logging in again.
				</Alert>
			</Box>
		);
	}

	// Additional safety check: ensure user data is fully loaded
	if (!user.email || !user.role) {
		return <RoleLoadingScreen contentType="causes" />;
	}

	return (
		<div>
			{user.role === "donor" ? <DonorCausePage /> : <OrganizationCausePage />}
		</div>
	);
};

export default Page;
