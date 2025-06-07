import { auth } from "@/lib/firebase";
import { CookieManager } from "./cookieManager";

/**
 * Authentication utility functions
 */
export class AuthUtils {
	/**
	 * Check if JWT token is expired or about to expire
	 */
	static isTokenExpired(token: string): boolean {
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			const currentTime = Date.now() / 1000;

			// Consider token expired if it expires within 5 minutes
			return payload.exp < currentTime + 300;
		} catch {
			return true;
		}
	}

	/**
	 * Refresh JWT token using Firebase token
	 */
	static async refreshToken(): Promise<string | null> {
		try {
			const currentUser = auth.currentUser;

			if (!currentUser) {
				console.warn("No Firebase user found for token refresh");
				this.clearAuth();
				return null;
			}

			// Get fresh Firebase token
			const idToken = await currentUser.getIdToken(true);

			// Verify with backend to get fresh JWT
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-token`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ idToken }),
				}
			);

			if (!response.ok) {
				throw new Error(`Token refresh failed: ${response.status}`);
			}

			const data = await response.json();

			// Update localStorage with new credentials
			if (typeof window !== "undefined") {
				localStorage.setItem("token", data.token);
				localStorage.setItem("user", JSON.stringify(data.user));
			}

			// Update cookie with fresh Firebase token
			CookieManager.setAuthToken(idToken);

			return data.token;
		} catch (error) {
			console.error("Token refresh failed:", error);
			this.clearAuth();
			return null;
		}
	}

	/**
	 * Get valid JWT token, refreshing if necessary
	 */
	static async getValidToken(): Promise<string | null> {
		// Get token from localStorage instead of store
		const currentToken =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;

		if (!currentToken) {
			return null;
		}

		// Check if token is expired or about to expire
		if (this.isTokenExpired(currentToken)) {
			console.log("Token expired, refreshing...");
			return await this.refreshToken();
		}

		return currentToken;
	}

	/**
	 * Clear all authentication data
	 */
	static clearAuth(): void {
		if (typeof window !== "undefined") {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		}
		CookieManager.removeAuthToken();
	}

	/**
	 * Check if user is authenticated with valid token
	 */
	static isAuthenticated(): boolean {
		if (typeof window === "undefined") return false;

		const token = localStorage.getItem("token");
		const user = localStorage.getItem("user");

		if (!token || !user) {
			return false;
		}

		return !this.isTokenExpired(token);
	}
}

export default AuthUtils;
