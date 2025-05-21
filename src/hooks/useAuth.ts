"use client";

import { auth, googleProvider } from "@/lib/firebase";
import { RootState } from "@/store/store";
import {
	useLoginMutation,
	useRegisterMutation,
	useVerifyTokenMutation,
} from "@/store/api/authApi";
import {
	clearCredentials,
	setCredentials,
	setError,
	setLoading,
} from "@/store/slices/authSlice";
import { ApiError, LoginFormData, parseError, SignupFormData } from "@/types";
import {
	createUserWithEmailAndPassword,
	User as FirebaseUser,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/select-role"];

export const useAuth = () => {
	const dispatch = useDispatch();
	const router = useRouter();
	const pathname = usePathname();
	const { user, token, isAuthenticated, isLoading, error } = useSelector(
		(state: RootState) => state.auth
	);

	const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
	const [authInitialized, setAuthInitialized] = useState(false);

	// RTK Query mutations
	const [register] = useRegisterMutation();
	const [login] = useLoginMutation();
	const [verifyToken] = useVerifyTokenMutation();

	// Debounce function to delay redirects
	const debounce = <T>(fn: (...args: T[]) => void, ms: number) => {
		let timeoutId: NodeJS.Timeout;
		return (...args: T[]) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn(...args), ms);
		};
	};

	// Listen for Firebase auth state changes
	useEffect(() => {
		if (typeof window === "undefined") {
			console.log("Skipping Firebase auth listener during SSR");
			return;
		}

		console.log("Setting up Firebase auth listener");
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			console.log(
				"Auth state changed:",
				user ? `User logged in: ${user.email}` : "User logged out"
			);
			setFirebaseUser(user);
			setAuthInitialized(true);

			const handleAuthState = debounce(async () => {
				// If user is authenticated and trying to access login page, redirect to dashboard
				// Explicitly check for login page only, allowing access to signup
				if (user && pathname === "/login") {
					console.log(
						"User already authenticated, redirecting away from login"
					);
					router.push("/dashboard/home");
					return;
				}

				// Don't redirect if on public route (except login when authenticated)
				if (
					PUBLIC_ROUTES.includes(pathname) &&
					pathname !== "/login"
				) {
					console.log("On public route, skipping redirect");
					if (!user) {
						dispatch(clearCredentials());
					}
					return;
				}

				if (user) {
					try {
						const idToken = await user.getIdToken();
						console.log("Got Firebase ID token");

						// Set authToken cookie
						document.cookie = `authToken=${idToken}; path=/; max-age=3600; SameSite=Strict`;
						console.log("Set authToken cookie");

						// Verify token with backend
						console.log("Verifying token with backend");
						const response = await verifyToken({ idToken }).unwrap();
						console.log("Token verified successfully:", response);

						dispatch(
							setCredentials({
								user: response.user,
								token: response.token,
							})
						);

						// Redirect based on profile completion
						if (!response.user.profileCompleted) {
							console.log(
								"Profile not completed, redirecting to /complete-profile"
							);
							router.push("/complete-profile");
						} else if (pathname === "/login") {
							console.log("Already authenticated, redirecting to dashboard");
							router.push("/dashboard/home");
						}
					} catch (error: unknown) {
						console.error("Auth error:", error);
						const apiError = error as ApiError;
						if (apiError.status === 404) {
							console.log(
								"User not found in backend, redirecting to /select-role"
							);
							router.push("/select-role");
						} else {
							dispatch(clearCredentials());
							if (!PUBLIC_ROUTES.includes(pathname)) {
								console.log("Authentication failed, redirecting to /login");
								router.push("/login");
							}
						}
					}
				} else {
					dispatch(clearCredentials());
					if (!PUBLIC_ROUTES.includes(pathname)) {
						console.log("No user, redirecting to /login");
						router.push("/login");
					}
				}
			}, 200);

			handleAuthState();
		});

		return () => {
			console.log("Cleaning up Firebase auth listener");
			unsubscribe();
		};
	}, [dispatch, verifyToken, router, pathname]);

	// Signup with email and password
	const signup = async (formData: SignupFormData) => {
		const { email, password, role } = formData;

		dispatch(setLoading(true));
		dispatch(setError(null));

		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const firebaseUser = userCredential.user;
			console.log("Firebase user created:", firebaseUser.uid);

			const idToken = await firebaseUser.getIdToken();
			document.cookie = `authToken=${idToken}; path=/; max-age=3600; SameSite=Strict`;
			console.log("Set authToken cookie for signup");

			const response = await register({
				email,
				firebaseUid: firebaseUser.uid,
				role,
			}).unwrap();

			console.log("Backend registration successful:", response);

			dispatch(
				setCredentials({
					user: response.user,
					token: response.token,
				})
			);

			// Always redirect to complete profile after signup
			console.log("Redirecting to /complete-profile after signup");
			router.push("/complete-profile");

			return response;
		} catch (error: unknown) {
			console.error("Signup error:", error);
			const parsedError = parseError(error);
			dispatch(setError(parsedError.message || "Failed to sign up"));
			throw error;
		} finally {
			dispatch(setLoading(false));
		}
	};

	// Login with email and password
	const loginWithEmail = async (formData: LoginFormData) => {
		const { email, password } = formData;

		dispatch(setLoading(true));
		dispatch(setError(null));

		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const firebaseUser = userCredential.user;
			console.log("Firebase login successful:", firebaseUser.uid);

			const idToken = await firebaseUser.getIdToken();
			document.cookie = `authToken=${idToken}; path=/; max-age=3600; SameSite=Strict`;
			console.log("Set authToken cookie for email login");

			const response = await login({
				firebaseUid: firebaseUser.uid,
			}).unwrap();

			console.log("Backend login successful:", response);

			dispatch(
				setCredentials({
					user: response.user,
					token: response.token,
				})
			);

			if (!response.user.profileCompleted) {
				console.log("Redirecting to /complete-profile after email login");
				router.push("/complete-profile");
			} else {
				console.log("Redirecting to /dashboard after email login");
				router.push("/dashboard/home");
			}

			return response;
		} catch (error: unknown) {
			console.error("Login error:", error);
			const parsedError = parseError(error);
			dispatch(setError(parsedError.message || "Failed to log in"));
			throw error;
		} finally {
			dispatch(setLoading(false));
		}
	};

	// Login with Google
	const loginWithGoogle = async () => {
		dispatch(setLoading(true));
		dispatch(setError(null));

		try {
			console.log("Starting Google sign-in process...");

			// Clear any previous auth errors
			if (auth.currentUser) {
				console.log("Existing user found, signing out first to prevent conflicts");
				await signOut(auth);
			}

			// Use signInWithPopup with explicit error handling
			const result = await signInWithPopup(auth, googleProvider)
				.catch((error) => {
					console.error("Google popup error:", error.code, error.message);
					// Handle specific Firebase Auth errors
					if (error.code === 'auth/popup-blocked') {
						throw new Error("Popup was blocked by the browser. Please allow popups for this site.");
					} else if (error.code === 'auth/popup-closed-by-user') {
						throw new Error("Sign-in was cancelled. Please try again.");
					} else if (error.code === 'auth/cancelled-popup-request') {
						throw new Error("Multiple popup requests were made. Please try again.");
					} else if (error.code === 'auth/network-request-failed') {
						throw new Error("Network error occurred. Please check your internet connection.");
					}
					throw error;
				});

			if (!result) {
				throw new Error("Failed to authenticate with Google. Please try again.");
			}

			const firebaseUser = result.user;
			console.log(
				"Google sign-in successful:",
				firebaseUser.uid,
				firebaseUser.email
			);

			if (!firebaseUser.email) {
				throw new Error("Google account must have an email address");
			}

			// Get the ID token with force refresh to ensure it's new
			const idToken = await firebaseUser.getIdToken(true);
			document.cookie = `authToken=${idToken}; path=/; max-age=3600; SameSite=Strict`;
			console.log("Set authToken cookie for Google login");

			try {
				console.log("Attempting backend login with Firebase UID:", firebaseUser.uid);
				const response = await login({
					firebaseUid: firebaseUser.uid,
				}).unwrap();

				console.log("Backend login successful:", response);

				dispatch(
					setCredentials({
						user: response.user,
						token: response.token,
					})
				);

				if (!response.user.profileCompleted) {
					console.log("Redirecting to /complete-profile after Google login");
					router.push("/complete-profile");
				} else {
					console.log("Redirecting to /dashboard after Google login");
					router.push("/dashboard/home");
				}

				return response;
			} catch (error: unknown) {
				console.log("Backend login error:", error);
				const apiError = error as ApiError;
				if (apiError.status === 404) {
					console.log("User not found in backend, redirecting to /select-role");
					if (typeof window !== "undefined") {
						sessionStorage.setItem(
							"pendingGoogleUser",
							JSON.stringify({
								uid: firebaseUser.uid,
								email: firebaseUser.email,
							})
						);
					}
					router.push("/select-role");
					return null;
				}
				throw error;
			}
		} catch (error: unknown) {
			console.error("Google login error:", error);
			const parsedError = parseError(error);
			dispatch(setError(parsedError.message || "Failed to log in with Google"));
			throw error;
		} finally {
			dispatch(setLoading(false));
		}
	};

	// Logout
	const logout = async () => {
		try {
			await signOut(auth);
			dispatch(clearCredentials());
			document.cookie = "authToken=; path=/; max-age=0";
			console.log("Cleared authToken cookie and logged out");
			router.push("/"); // Redirect to home page after logout
		} catch (error: unknown) {
			console.error("Logout error:", error);
			const parsedError = parseError(error);
			dispatch(setError(parsedError.message || "Failed to log out"));
		}
	};

	return {
		user,
		firebaseUser,
		token,
		isAuthenticated,
		isLoading,
		error,
		authInitialized,
		signup,
		loginWithEmail,
		loginWithGoogle,
		logout,
	};
};
