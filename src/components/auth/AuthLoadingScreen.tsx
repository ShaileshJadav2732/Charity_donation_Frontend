"use client";

import React from "react";
import { Box, CircularProgress, Typography, Fade } from "@mui/material";

interface AuthLoadingScreenProps {
	message?: string;
	showProgress?: boolean;
	minHeight?: string;
}

/**
 * Consistent loading screen for authentication states
 * Prevents flash of wrong content during auth initialization
 */
export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
	message = "Loading...",
	showProgress = true,
	minHeight = "60vh",
}) => {
	return (
		<Fade in timeout={300}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight,
					flexDirection: "column",
					gap: 2,
					backgroundColor: "transparent",
				}}
			>
				{showProgress && (
					<CircularProgress 
						size={40} 
						sx={{ 
							color: "#287068",
							"& .MuiCircularProgress-circle": {
								strokeLinecap: "round",
							},
						}} 
					/>
				)}
				<Typography 
					variant="body1" 
					color="text.secondary"
					sx={{
						fontWeight: 500,
						textAlign: "center",
					}}
				>
					{message}
				</Typography>
			</Box>
		</Fade>
	);
};

/**
 * Specific loading screen for dashboard initialization
 */
export const DashboardLoadingScreen: React.FC = () => {
	return (
		<AuthLoadingScreen 
			message="Loading your dashboard..." 
			minHeight="60vh"
		/>
	);
};

/**
 * Specific loading screen for role-based content
 */
export const RoleLoadingScreen: React.FC<{ contentType?: string }> = ({ 
	contentType = "content" 
}) => {
	return (
		<AuthLoadingScreen 
			message={`Loading ${contentType}...`} 
			minHeight="50vh"
		/>
	);
};

/**
 * Minimal loading screen for quick transitions
 */
export const QuickLoadingScreen: React.FC = () => {
	return (
		<AuthLoadingScreen 
			message="Loading..." 
			minHeight="20vh"
		/>
	);
};

export default AuthLoadingScreen;
