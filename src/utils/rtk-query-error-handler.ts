// import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
// import { SerializedError } from "@reduxjs/toolkit";

// /**
//  * Type guard to check if error is a FetchBaseQueryError
//  */
// export function isFetchBaseQueryError(
// 	error: unknown
// ): error is FetchBaseQueryError {
// 	return typeof error === "object" && error != null && "status" in error;
// }

// /**
//  * Type guard to check if error is a SerializedError
//  */
// export function isSerializedError(error: unknown): error is SerializedError {
// 	return typeof error === "object" && error != null && "message" in error;
// }

// /**
//  * Extract error message from RTK Query error
//  */
// export function getErrorMessage(
// 	error: FetchBaseQueryError | SerializedError | undefined
// ): string {
// 	if (!error) return "An unknown error occurred";

// 	if (isFetchBaseQueryError(error)) {
// 		// Handle FetchBaseQueryError
// 		if (error.status === "FETCH_ERROR") {
// 			return "Network error. Please check your connection.";
// 		}

// 		if (error.status === "PARSING_ERROR") {
// 			return "Error parsing server response.";
// 		}

// 		if (error.status === "TIMEOUT_ERROR") {
// 			return "Request timed out. Please try again.";
// 		}

// 		// Handle HTTP status codes
// 		if (typeof error.status === "number") {
// 			switch (error.status) {
// 				case 400:
// 					return "Bad request. Please check your input.";
// 				case 401:
// 					return "Authentication required. Please log in.";
// 				case 403:
// 					return "Access denied. You do not have permission.";
// 				case 404:
// 					return "Resource not found.";
// 				case 409:
// 					return "Conflict. Resource already exists.";
// 				case 422:
// 					return "Validation error. Please check your input.";
// 				case 500:
// 					return "Server error. Please try again later.";
// 				default:
// 					return `Error ${error.status}: ${
// 						error.data?.message || "Something went wrong"
// 					}`;
// 			}
// 		}

// 		// Handle error data
// 		if (error.data && typeof error.data === "object") {
// 			const data = error.data as any;
// 			return data.message || data.error || "An error occurred";
// 		}
// 	}

// 	if (isSerializedError(error)) {
// 		return error.message || "An error occurred";
// 	}

// 	return "An unknown error occurred";
// }

// /**
//  * Standard error handler for RTK Query mutations
//  */
// export function handleMutationError(
// 	error: FetchBaseQueryError | SerializedError | undefined
// ): void {
// 	const message = getErrorMessage(error);
// 	console.error("RTK Query Error:", message, error);
// 	// You can integrate with your toast/notification system here
// 	// toast.error(message);
// }

// /**
//  * Standard error handler for RTK Query queries
//  */
// export function handleQueryError(
// 	error: FetchBaseQueryError | SerializedError | undefined
// ): void {
// 	const message = getErrorMessage(error);
// 	console.error("RTK Query Error:", message, error);
// 	// You can integrate with your toast/notification system here
// 	// toast.error(message);
// }
