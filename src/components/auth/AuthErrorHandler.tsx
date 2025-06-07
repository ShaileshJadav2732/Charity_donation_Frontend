"use client";

import React from "react";
import { Alert, Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";

interface AuthErrorHandlerProps {
	error: any;
	onRetry?: () => void;
}

/**
 * Component to handle authentication-related errors consistently across the app
 */
export const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ 
	error, 
	onRetry 
}) => {
	const router = useRouter();

	// Extract error status if available
	const errorStatus = 'status' in error ? error.status : null;
	const errorData = 'data' in error ? error.data : null;

	// Handle different authentication error types
	if (errorStatus === 401) {
		const isTokenExpired = errorData?.code === "TOKEN_EXPIRED" || 
							   errorData?.code === "FIREBASE_TOKEN_EXPIRED";
		
		return (
			<Box sx={{ p: 3 }}>
				<Alert 
					severity="warning"
					action={
						<Button 
							color="inherit" 
							size="small" 
							onClick={() => router.push("/login")}
						>
							Login
						</Button>
					}
				>
					{isTokenExpired 
						? "Your session has expired. Please log in again."
						: "Authentication required. Please log in to continue."
					}
				</Alert>
			</Box>
		);
	}

	if (errorStatus === 403) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">
					You don&apos;t have permission to access this resource.
				</Alert>
			</Box>
		);
	}

	// Handle Firebase-specific errors
	if (errorData?.code === "FIREBASE_AUTH_FAILED") {
		return (
			<Box sx={{ p: 3 }}>
				<Alert 
					severity="error"
					action={
						onRetry && (
							<Button 
								color="inherit" 
								size="small" 
								onClick={onRetry}
							>
								Retry
							</Button>
						)
					}
				>
					Authentication service error. Please try again.
				</Alert>
			</Box>
		);
	}

	// Generic authentication error
	return (
		<Box sx={{ p: 3 }}>
			<Alert 
				severity="error"
				action={
					onRetry && (
						<Button 
							color="inherit" 
							size="small" 
							onClick={onRetry}
						>
							Retry
						</Button>
					)
				}
			>
				Authentication failed. Please try again.
			</Alert>
		</Box>
	);
};

/**
 * Hook to check if an error is authentication-related
 */
export const useIsAuthError = (error: any): boolean => {
	if (!error) return false;
	
	const status = 'status' in error ? error.status : null;
	const errorData = 'data' in error ? error.data : null;
	
	// Check for HTTP auth errors
	if (status === 401 || status === 403) return true;
	
	// Check for Firebase auth errors
	if (errorData?.code?.includes("FIREBASE_")) return true;
	if (errorData?.code?.includes("TOKEN_")) return true;
	if (errorData?.code === "NO_TOKEN") return true;
	if (errorData?.code === "USER_NOT_FOUND") return true;
	
	return false;
};

export default AuthErrorHandler;
