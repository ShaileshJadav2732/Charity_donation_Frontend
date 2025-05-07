export interface ApiError {
	message: string;
	status?: number;
	response?: {
		data?: {
			message?: string;
		};
		status?: number;
	};
}

// FirebaseError type based on typical Firebase error structure
export interface FirebaseError extends Error {
	code: string;
	message: string;
	name: string;
}

// AxiosError (partial) to capture backend API response errors
export interface APIError extends Error {
	response?: {
		data?: {
			message?: string;
			[key: string]: unknown;
		};
		status?: number;
	};
	message: string;
}
