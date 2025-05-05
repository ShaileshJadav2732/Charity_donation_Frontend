import api from "./api.service";
import {
	LoginRequest,
	SignupRequest,
	AuthResponse,
	EmailLoginPayload,
	EmailSignupPayload,
	UserRole,
} from "../types/auth.types";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { getFirebaseErrorMessage } from "../utils/firebaseErrors";

// Auth service with class-based structure (MVC-like)
class AuthService {
	// Firebase email login
	async loginWithEmail(credentials: EmailLoginPayload): Promise<AuthResponse> {
		try {
			// Sign in with Firebase
			const userCredential = await signInWithEmailAndPassword(
				auth,
				credentials.email,
				credentials.password
			);

			// Get ID token
			const idToken = await userCredential.user.getIdToken();

			// Additional user data from Firebase
			const userData = {
				uid: userCredential.user.uid,
				email: userCredential.user.email,
				emailVerified: userCredential.user.emailVerified,
				displayName: userCredential.user.displayName,
				photoURL: userCredential.user.photoURL,
			};

			// Login with backend (passing Firebase user data to store in MongoDB)
			return this.loginWithToken({ idToken, userData });
		} catch (error: any) {
			const errorCode = error.code || "unknown";
			throw new Error(getFirebaseErrorMessage(errorCode));
		}
	}

	// Firebase email signup
	async signupWithEmail(userData: EmailSignupPayload): Promise<AuthResponse> {
		try {
			// Create user in Firebase
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				userData.email,
				userData.password
			);

			// Get ID token
			const idToken = await userCredential.user.getIdToken();

			// Firebase user data to store in MongoDB
			const firebaseUserData = {
				uid: userCredential.user.uid,
				email: userCredential.user.email,
				emailVerified: userCredential.user.emailVerified,
				displayName: userCredential.user.displayName || userData.username,
				photoURL: userCredential.user.photoURL,
			};

			// Register with backend (MongoDB)
			return this.signupWithToken({
				idToken,
				username: userData.username,
				role: userData.role,
				userData: firebaseUserData,
			});
		} catch (error: any) {
			const errorCode = error.code || "unknown";
			throw new Error(getFirebaseErrorMessage(errorCode));
		}
	}

	// Firebase Google login
	async loginWithGoogle(): Promise<AuthResponse> {
		try {
			// Configure Google auth provider
			const provider = new GoogleAuthProvider();

			// Sign in with popup
			const result = await signInWithPopup(auth, provider);

			// Get ID token
			const idToken = await result.user.getIdToken();

			// Firebase user data to store in MongoDB
			const userData = {
				uid: result.user.uid,
				email: result.user.email,
				emailVerified: result.user.emailVerified,
				displayName: result.user.displayName,
				photoURL: result.user.photoURL,
			};

			// Login with backend (MongoDB)
			return this.loginWithToken({ idToken, userData });
		} catch (error: any) {
			const errorCode = error.code || "unknown";
			throw new Error(getFirebaseErrorMessage(errorCode));
		}
	}

	// Firebase Google signup
	async signupWithGoogle(role: UserRole): Promise<AuthResponse> {
		try {
			// Configure Google auth provider
			const provider = new GoogleAuthProvider();

			// Sign in with popup
			const result = await signInWithPopup(auth, provider);

			// Get ID token
			const idToken = await result.user.getIdToken();

			// Get username from email or display name
			const username =
				result.user.displayName ||
				(result.user.email ? result.user.email.split("@")[0] : "user");

			// Firebase user data to store in MongoDB
			const userData = {
				uid: result.user.uid,
				email: result.user.email,
				emailVerified: result.user.emailVerified,
				displayName: result.user.displayName,
				photoURL: result.user.photoURL,
			};

			// Register with backend (MongoDB)
			return this.signupWithToken({
				idToken,
				username,
				role,
				userData,
			});
		} catch (error: any) {
			const errorCode = error.code || "unknown";
			throw new Error(getFirebaseErrorMessage(errorCode));
		}
	}

	// Backend login with token
	async loginWithToken(loginRequest: LoginRequest): Promise<AuthResponse> {
		try {
			console.log("Sending login request to MongoDB:", loginRequest);
			const response = await api.post<AuthResponse>(
				"/auth/firebase/login",
				loginRequest
			);

			// Store auth data
			if (typeof window !== "undefined") {
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.user));
			}

			return response.data;
		} catch (error: any) {
			console.error("Login error:", error.response?.data || error.message);
			throw error;
		}
	}

	// Backend signup with token
	async signupWithToken(signupRequest: SignupRequest): Promise<AuthResponse> {
		try {
			console.log("Sending signup request to MongoDB:", signupRequest);
			const response = await api.post<AuthResponse>(
				"/auth/firebase/signup",
				signupRequest
			);

			// Store auth data
			if (typeof window !== "undefined") {
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.user));
			}

			return response.data;
		} catch (error: any) {
			console.error("Signup error:", error.response?.data || error.message);
			throw error;
		}
	}

	// Logout
	async logout(): Promise<void> {
		try {
			// Sign out from Firebase
			await signOut(auth);

			// Clear local storage
			if (typeof window !== "undefined") {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
			}

			// Call backend logout (to update MongoDB session if needed)
			try {
				await api.post("/api/auth/logout");
			} catch (error) {
				// Just log, don't throw
				console.error("Logout API error:", error);
			}
		} catch (error) {
			console.error("Logout error:", error);
			throw error;
		}
	}

	// Check if user is authenticated
	isAuthenticated(): boolean {
		if (typeof window === "undefined") return false;
		return !!localStorage.getItem("token");
	}

	// Get stored user
	getStoredUser(): any {
		if (typeof window === "undefined") return null;

		const userStr = localStorage.getItem("user");
		if (!userStr) return null;

		try {
			return JSON.parse(userStr);
		} catch (error) {
			return null;
		}
	}
}

export const authService = new AuthService();
export default authService;
