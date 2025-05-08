import axios from "axios";
import { toast } from "react-toastify";
import {
	getToken,
	isTokenExpired,
	refreshToken,
	removeToken,
} from "@/utils/auth";

export const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Create axios instance
const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor with token refresh
api.interceptors.request.use(
	async (config) => {
		if (typeof window === "undefined") return config;

		let token = getToken();

		// If token exists but is expired, try to refresh it
		if (token && isTokenExpired(token)) {
			console.log("Token expired, attempting refresh");
			token = await refreshToken();

			// If refresh failed, handle logout
			if (!token) {
				console.log("Token refresh failed, redirecting to login");
				if (typeof window !== "undefined") {
					// Use next/navigation only on client side
					const { useRouter } = await import("next/navigation");
					const router = useRouter();
					router.push("/auth/login");
					toast.error("Session expired. Please log in again.");
				}
				return config;
			}
		}

		// Add token to request if it exists
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		// Handle 401 Unauthorized errors
		if (error.response && error.response.status === 401) {
			if (typeof window !== "undefined") {
				// Try to refresh token
				const newToken = await refreshToken();

				if (newToken) {
					// Retry the original request with new token
					const originalRequest = error.config;
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return api(originalRequest);
				} else {
					// If refresh failed, redirect to login
					removeToken();
					toast.error("Session expired. Please log in again.");

					// Use next/navigation only on client side
					const { useRouter } = await import("next/navigation");
					const router = useRouter();
					router.push("/auth/login");
				}
			}
		}

		// Handle other errors
		if (error.response && error.response.status >= 500) {
			toast.error("Server error. Please try again later.");
		}

		return Promise.reject(error);
	}
);

export default api;
