// src/utils/auth.ts
export const getToken = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
	if (typeof window === "undefined") return;
	localStorage.setItem("token", token);
};

export const removeToken = (): void => {
	if (typeof window === "undefined") return;
	localStorage.removeItem("token");
};

// Check if token is expired (Firebase tokens contain expiration)
export const isTokenExpired = (token: string): boolean => {
	if (!token) return true;

	try {
		// Firebase tokens are JWTs
		const payload = JSON.parse(atob(token.split(".")[1]));
		const expiry = payload.exp * 1000; // Convert to milliseconds
		return Date.now() >= expiry;
	} catch (e) {
		console.error("Error checking token expiration:", e);
		return true; // Assume expired if we can't parse
	}
};

// Refresh token using Firebase
export const refreshToken = async (): Promise<string | null> => {
	if (typeof window === "undefined") return null;

	try {
		// Import Firebase auth on demand to avoid SSR issues
		const { auth } = await import("../config/firebase");
		const currentUser = auth.currentUser;

		if (!currentUser) {
			console.error("No current user found for token refresh");
			return null;
		}

		// Get a fresh token
		const newToken = await currentUser.getIdToken(true);
		setToken(newToken);
		return newToken;
	} catch (error) {
		console.error("Failed to refresh token:", error);
		removeToken();
		return null;
	}
};
