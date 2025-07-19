"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { FiAlertTriangle, FiRefreshCw, FiLogOut } from "react-icons/fi";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorType: "auth" | "network" | "unknown";
}

export class AuthErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, errorType: "unknown" };
	}

	static getDerivedStateFromError(error: Error): State {
		// Determine error type based on error message
		let errorType: "auth" | "network" | "unknown" = "unknown";

		if (
			error.message.includes("auth") ||
			error.message.includes("token") ||
			error.message.includes("credential")
		) {
			errorType = "auth";
		} else if (
			error.message.includes("network") ||
			error.message.includes("fetch")
		) {
			errorType = "network";
		}

		return { hasError: true, error, errorType };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error(
			"Authentication Error Boundary caught an error:",
			error,
			errorInfo
		);

		// Only show auth error boundary for actual auth-related errors
		if (
			!error.message.includes("auth") &&
			!error.message.includes("token") &&
			!error.message.includes("credential") &&
			!error.message.includes("Cannot access")
		) {
			// For non-auth errors, just log and don't show error boundary
			this.setState({ hasError: false });
		}
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: undefined, errorType: "unknown" });
		// Reload the page to reset authentication state
		window.location.reload();
	};

	handleLogout = () => {
		// Clear all auth data and redirect to login
		if (typeof window !== "undefined") {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			document.cookie =
				"authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			window.location.href = "/login";
		}
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const { errorType } = this.state;

			const getErrorContent = () => {
				switch (errorType) {
					case "auth":
						return {
							title: "Authentication Error",
							message:
								"Your session has expired or there was an authentication issue. Please log in again.",
							showLogout: true,
						};
					case "network":
						return {
							title: "Connection Error",
							message:
								"Unable to connect to the server. Please check your internet connection and try again.",
							showLogout: false,
						};
					default:
						return {
							title: "Something went wrong",
							message:
								"An unexpected error occurred. Please try refreshing the page.",
							showLogout: false,
						};
				}
			};

			const errorContent = getErrorContent();

			return (
				<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-teal-50 to-teal-200 py-12 px-4">
					<div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-md w-full">
						<FiAlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							{errorContent.title}
						</h1>
						<p className="text-gray-600 mb-6">{errorContent.message}</p>
						<div className="flex flex-col gap-3">
							<button
								onClick={this.handleRetry}
								className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200"
							>
								<FiRefreshCw className="mr-2 h-4 w-4" />
								Retry
							</button>
							{errorContent.showLogout && (
								<button
									onClick={this.handleLogout}
									className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
								>
									<FiLogOut className="mr-2 h-4 w-4" />
									Log Out
								</button>
							)}
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default AuthErrorBoundary;
