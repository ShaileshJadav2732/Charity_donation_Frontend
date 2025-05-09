import { auth, googleProvider } from "@/lib/firebase";
import { RootState } from "@/store";
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
	const dispatch = useDispatch();
	const router = useRouter();
	const { user, token, isAuthenticated, isLoading, error } = useSelector(
		(state: RootState) => state.auth
	);

	const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

	// RTK Query mutations
	const [register] = useRegisterMutation();
	const [login] = useLoginMutation();
	const [verifyToken] = useVerifyTokenMutation();

	const [authInitialized, setAuthInitialized] = useState(false);

	// Listen for Firebase auth state changes - only in browser
	useEffect(() => {
		// Skip Firebase initialization during SSR
		if (typeof window === "undefined") {
			return;
		}

		console.log("Setting up Firebase auth listener");
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			console.log(
				"Auth state changed:",
				user ? "User logged in" : "User logged out"
			);
			setFirebaseUser(user);
			setAuthInitialized(true);

			if (user) {
				try {
					// Get Firebase ID token
					const idToken = await user.getIdToken();
					console.log("Got Firebase ID token");

					// Verify token with backend
					try {
						console.log("Verifying token with backend");
						const response = await verifyToken({ idToken }).unwrap();
						console.log("Token verified successfully");
						dispatch(
							setCredentials({
								user: response.user,
								token: response.token,
							})
						);
					} catch (error: unknown) {
						console.error("Error verifying token:", error);

						const apiError = error as ApiError;
						if (apiError.status === 404) {
							console.log("User not found in backend, might be a new user");
						}
					}
				} catch (error) {
					console.error("Error getting ID token:", error);
				}
			} else {
				// User is signed out
				dispatch(clearCredentials());
			}
		});

		return () => unsubscribe();
	}, [dispatch, verifyToken]);

	// Signup with email and password
	const signup = async (formData: SignupFormData) => {
		const { email, password, role } = formData;

		dispatch(setLoading(true));
		dispatch(setError(null));

		try {
			// Create user in Firebase
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const firebaseUser = userCredential.user;

			console.log("Firebase user created:", firebaseUser.uid);

			// Register user in backend
			try {
				const response = await register({
					email,
					firebaseUid: firebaseUser.uid,
					role,
				}).unwrap();

				console.log("Backend registration successful:", response);

				// Set credentials in Redux store
				dispatch(
					setCredentials({
						user: response.user,
						token: response.token,
					})
				);

				return response;
			} catch (backendError: unknown) {
				console.error("Backend registration error:", backendError);

				// If there's an error with the backend, we should delete the Firebase user
				// to maintain consistency
				try {
					await firebaseUser.delete();
					console.log(
						"Firebase user deleted due to backend registration failure"
					);
				} catch (deleteError) {
					console.error("Error deleting Firebase user:", deleteError);
				}

				throw backendError;
			}
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
			// Sign in with Firebase
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const firebaseUser = userCredential.user;

			// Login user in backend
			const response = await login({
				firebaseUid: firebaseUser.uid,
			}).unwrap();

			// Set credentials in Redux store
			dispatch(
				setCredentials({
					user: response.user,
					token: response.token,
				})
			);

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
			// Sign in with Google
			const result = await signInWithPopup(auth, googleProvider);
			const firebaseUser = result.user;

			console.log(
				"Google sign-in successful:",
				firebaseUser.uid,
				firebaseUser.email
			);

			if (!firebaseUser.email) {
				throw new Error("Google account must have an email address");
			}

			// Check if user exists in backend
			try {
				// Try to login
				const response = await login({
					firebaseUid: firebaseUser.uid,
				}).unwrap();

				console.log("Backend login successful:", response);

				// Set credentials in Redux store
				dispatch(
					setCredentials({
						user: response.user,
						token: response.token,
					})
				);

				// Redirect based on profile completion
				if (!response.user.profileCompleted) {
					router.push("/complete-profile");
				} else {
					router.push("/dashboard");
				}

				return response;
			} catch (error: unknown) {
				console.log("Backend login error:", error);

				// If error is 404, user doesn't exist in our backend yet
				const apiError = error as ApiError;
				if (apiError.status === 404) {
					console.log(
						"User not found in backend, redirecting to role selection"
					);

					// Store Firebase user info in sessionStorage for the select-role page
					if (typeof window !== "undefined") {
						sessionStorage.setItem(
							"pendingGoogleUser",
							JSON.stringify({
								uid: firebaseUser.uid,
								email: firebaseUser.email,
							})
						);
					}

					// Redirect to role selection page
					router.push("/select-role");
					return null;
				} else {
					// For other errors, throw them
					throw error;
				}
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
			router.push("/login");
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
		signup,
		loginWithEmail,
		loginWithGoogle,
		logout,
	};
};
