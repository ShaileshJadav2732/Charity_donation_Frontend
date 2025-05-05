import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Create axios instance
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
				config.headers["Authorization"] = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor
api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Handle unauthorized errors
		if (error.response && error.response.status === 401) {
			if (
				typeof window !== "undefined" &&
				!window.location.pathname.includes("/auth/login")
			) {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				window.location.href = "/auth/login";
			}
		}
		return Promise.reject(error);
	}
);

export default api;
