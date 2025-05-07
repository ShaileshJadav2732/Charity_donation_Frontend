import axios from "axios";
import { toast } from "react-toastify"; // Ensure toast is imported

// Base URL for API - make sure this matches your backend
export const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Create axios instance with the correct base URL (without /api)
const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for API calls
api.interceptors.request.use(
	(config) => {
		// Only access localStorage in browser environment
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("token");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}

		console.log(
			`Making ${config.method} request to: ${config.baseURL}${config.url}`
		);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for API calls
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const errorDetails = {
			message: error.message,
			status: error.response?.status,
			data: error.response?.data,
			url: error.config?.url,
			method: error.config?.method,
		};
		console.error("API Error:", errorDetails);

		// Handle errors like 401 Unauthorized
		if (error.response && error.response.status === 401) {
			if (typeof window !== "undefined") {
				localStorage.removeItem("token");
				toast.error("Session expired. Please log in again.");
			}
		}

		// Handle other specific status codes if needed
		if (error.response && error.response.status >= 500) {
			if (typeof window !== "undefined") {
				toast.error("Server error. Please try again later.");
			}
		}

		return Promise.reject(error);
	}
);

export default api;
