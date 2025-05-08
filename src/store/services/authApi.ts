import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../services/api.service";
import { auth } from "../../config/firebase";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
} from "firebase/auth";
import { getToken } from "@/utils/auth";

// Define types
export interface AuthResponse {
	user: {
		id: string;
		email: string;
		role: string;
		displayName?: string;
		photoURL?: string;
		isProfileCompleted?: boolean;
	};
	message: string;
}

export interface EmailCredentials {
	email: string;
	password: string;
}

export interface SignupRequest extends EmailCredentials {
	role: string;
}

export interface RoleRequest {
	role: string;
}

// Create the auth API
export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: fetchBaseQuery({
		baseUrl: `${API_URL}/api`,
		prepareHeaders: (headers) => {
			if (typeof window !== "undefined") {
				const token = getToken();
				if (token) {
					headers.set("authorization", `Bearer ${token}`);
				}
			}
			return headers;
		},
	}),
	endpoints: (builder) => ({
		loginWithEmail: builder.mutation<AuthResponse, EmailCredentials>({
			async queryFn(credentials) {
				try {
					// Firebase authentication
					const userCredential = await signInWithEmailAndPassword(
						auth,
						credentials.email,
						credentials.password
					);

					// Get Firebase ID token
					const idToken = await userCredential.user.getIdToken();

					// Backend login with Firebase token
					const response = await fetch(`${API_URL}/api/auth/firebase/login`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ idToken }),
					});

					if (!response.ok) {
						throw new Error("Login failed");
					}

					const data = await response.json();

					// Store Firebase ID token for API auth
					localStorage.setItem("token", idToken);

					return { data };
				} catch (error: any) {
					return {
						error: {
							status: error.code || "FETCH_ERROR",
							data: error.message || "Failed to login",
						},
					};
				}
			},
		}),

		signupWithEmail: builder.mutation<AuthResponse, SignupRequest>({
			async queryFn({ email, password, role }) {
				try {
					// Firebase authentication
					const userCredential = await createUserWithEmailAndPassword(
						auth,
						email,
						password
					);

					// Get Firebase ID token
					const idToken = await userCredential.user.getIdToken();

					// Backend signup with Firebase token
					const response = await fetch(`${API_URL}/api/auth/firebase/signup`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ idToken, role }),
					});

					if (!response.ok) {
						throw new Error("Signup failed");
					}

					const data = await response.json();

					// Store Firebase ID token for API auth
					localStorage.setItem("token", idToken);

					return { data };
				} catch (error: any) {
					return {
						error: {
							status: error.code || "FETCH_ERROR",
							data: error.message || "Failed to sign up",
						},
					};
				}
			},
		}),

		loginWithGoogle: builder.mutation<AuthResponse, void>({
			async queryFn() {
				try {
					// Google authentication
					const provider = new GoogleAuthProvider();
					const result = await signInWithPopup(auth, provider);

					// Get Firebase ID token
					const idToken = await result.user.getIdToken();

					// Extract user data from Google auth response
					const userData = {
						uid: result.user.uid,
						email: result.user.email,
						displayName: result.user.displayName,
						photoURL: result.user.photoURL,
					};

					// Backend login with Firebase token
					const response = await fetch(`${API_URL}/api/auth/firebase/login`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ idToken, userData }),
					});

					if (!response.ok) {
						throw new Error("Google login failed");
					}

					const data = await response.json();

					// Store Firebase ID token for API auth
					localStorage.setItem("token", idToken);

					return { data };
				} catch (error: any) {
					return {
						error: {
							status: error.code || "FETCH_ERROR",
							data: error.message || "Failed to login with Google",
						},
					};
				}
			},
		}),

		signupWithGoogle: builder.mutation<AuthResponse, RoleRequest>({
			async queryFn({ role }) {
				try {
					// Google authentication
					const provider = new GoogleAuthProvider();
					const result = await signInWithPopup(auth, provider);

					// Get Firebase ID token
					const idToken = await result.user.getIdToken();

					// Extract user data from Google auth response
					const userData = {
						uid: result.user.uid,
						email: result.user.email,
						displayName: result.user.displayName,
						photoURL: result.user.photoURL,
					};

					// Backend signup with Firebase token
					const response = await fetch(`${API_URL}/api/auth/firebase/signup`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ idToken, role, userData }),
					});

					if (!response.ok) {
						throw new Error("Google signup failed");
					}

					const data = await response.json();

					// Store Firebase ID token for API auth
					localStorage.setItem("token", idToken);

					return { data };
				} catch (error: any) {
					return {
						error: {
							status: error.code || "FETCH_ERROR",
							data: error.message || "Failed to sign up with Google",
						},
					};
				}
			},
		}),

		getProfileStatus: builder.query<
			{ role: string; isProfileComplete: boolean },
			void
		>({
			query: () => `/auth/profile-status`,
		}),

		logout: builder.mutation<void, void>({
			async queryFn() {
				try {
					await signOut(auth);
					localStorage.removeItem("token");
					localStorage.removeItem("user");
					return { data: undefined };
				} catch (error: any) {
					return {
						error: {
							status: "FETCH_ERROR",
							data: error.message || "Failed to logout",
						},
					};
				}
			},
		}),
	}),
});

// Export hooks
export const {
	useLoginWithEmailMutation,
	useSignupWithEmailMutation,
	useLoginWithGoogleMutation,
	useSignupWithGoogleMutation,
	useGetProfileStatusQuery,
	useLogoutMutation,
} = authApi;
