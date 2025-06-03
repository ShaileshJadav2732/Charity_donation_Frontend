// Base error interface
export interface BaseError {
	message: string;
}

// Firebase error interface
export interface FirebaseError extends BaseError {
	code: string;
	customData?: Record<string, unknown>;
}

// Backend API error interface
export interface ApiError extends BaseError {
	status?: number;
	data?: {
		message?: string;
		[key: string]: unknown;
	};
}

// Parse error function to convert unknown errors to typed errors
export function parseError(error: unknown): BaseError {
	// Debug logging in development
	if (process.env.NODE_ENV === "development") {
		console.log("🔍 Parsing error:", error);
		console.log("🔍 Error type:", typeof error);
		console.log("🔍 Error constructor:", error?.constructor?.name);
	}

	// If it's already a BaseError, return it
	if (typeof error === "object" && error !== null && "message" in error) {
		return error as BaseError;
	}

	// If it's a string, create a BaseError
	if (typeof error === "string") {
		return { message: error };
	}

	// If it's a Firebase error
	if (isFirebaseError(error)) {
		// Format Firebase error message to be more user-friendly
		const code = error.code.replace("auth/", "").replace(/-/g, " ");
		return {
			message: `Authentication error: ${code}`,
		};
	}

	// Check for RTK Query error structure first
	if (typeof error === "object" && error !== null) {
		const err = error as {
			status?: number;
			data?: { message?: string } | string;
			response?: { data?: { message?: string } };
			message?: string;
		};

		// RTK Query error structure
		if (err.status && err.data) {
			if (typeof err.data === "object" && err.data.message) {
				return { message: err.data.message };
			}
			if (typeof err.data === "string") {
				return { message: err.data };
			}
			return { message: `Server error (${err.status})` };
		}

		// Axios error structure
		if (err.response?.data?.message) {
			return { message: err.response.data.message };
		}

		// Fetch API error structure
		if (err.message && typeof err.message === "string") {
			return { message: err.message };
		}
	}

	// If it's an API error (legacy check)
	if (isApiError(error)) {
		// Use the API error message if available
		if (error.data?.message) {
			return { message: error.data.message };
		}
		// Otherwise use status code
		if (error.status) {
			return { message: `Server error (${error.status})` };
		}
	}

	// If it has a message property that's a string
	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as { message: unknown }).message === "string"
	) {
		return { message: (error as { message: string }).message };
	}

	// If it's an Error object
	if (error instanceof Error) {
		return { message: error.message || "Application error occurred" };
	}

	// Check for network errors
	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as { message: unknown }).message === "string"
	) {
		const errorMsg = (error as { message: string }).message.toLowerCase();
		if (
			errorMsg.includes("network") ||
			errorMsg.includes("connection") ||
			errorMsg.includes("offline")
		) {
			return {
				message:
					"Network connection error. Please check your internet connection and try again.",
			};
		}

		if (errorMsg.includes("timeout") || errorMsg.includes("timed out")) {
			return {
				message:
					"Request timed out. The server is taking too long to respond. Please try again later.",
			};
		}
	}

	// Default fallback with more information
	return {
		message:
			"An unknown error occurred. Please try again or contact support if the issue persists.",
	};
}

// Function to check if an error is a Firebase error
export function isFirebaseError(error: unknown): error is FirebaseError {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		typeof (error as { code: unknown }).code === "string"
	);
}

// Function to check if an error is an API error
export function isApiError(error: unknown): error is ApiError {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	const err = error as {
		status?: number;
		data?: unknown;
		error?: unknown;
		response?: { status?: number };
	};

	// RTK Query error structure
	if (err.status && (err.data || err.error)) {
		return true;
	}

	// Axios error structure
	if (err.response && err.response.status) {
		return true;
	}

	// Generic API error structure
	return (
		("status" in error || "data" in error) &&
		(typeof err.status === "number" || typeof err.data === "object")
	);
}
