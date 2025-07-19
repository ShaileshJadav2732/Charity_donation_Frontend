"use client";

import { auth, googleProvider } from "@/lib/firebase";
import { RootState } from "@/store/store";
import { useLoginMutation, useRegisterMutation } from "@/store/api/authApi";
import {
	clearCredentials,
	setCredentials,
	setError,
	setLoading,
} from "@/store/slices/authSlice";
import { ApiError, LoginFormData, parseError, SignupFormData } from "@/types";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { CookieManager } from "@/utils/cookieManager";
import { ROUTES } from "@/config/routes";
import { useAuthContext } from "@/contexts/AuthContext";

export const useAuth = () => {
	const dispatch = useDispatch();
	const router = useRouter();
	const { user, isAuthenticated, isLoading, error } = useSelector(
		(state: RootState) => state.auth
	);
	const { isInitialized } = useAuthContext();

	// RTK Query mutations
	const [register] = useRegisterMutation();
	const [login] = useLoginMutation();

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

			const idToken = await firebaseUser.getIdToken();
			CookieManager.setAuthToken(idToken);

			const response = await register({
				email,
				firebaseUid: firebaseUser.uid,
				role,
			}).unwrap();

			dispatch(
				setCredentials({
					user: response.user,
					token: response.token,
				})
			);

			// Redirect handled by AuthContext
			router.push(ROUTES.COMPLETE_PROFILE);

			return response;
		} catch (error: unknown) {
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

			const idToken = await firebaseUser.getIdToken();
			CookieManager.setAuthToken(idToken);

			const response = await login({
				firebaseUid: firebaseUser.uid,
			}).unwrap();

			dispatch(
				setCredentials({
					user: response.user,
					token: response.token,
				})
			);

			// Redirect handled by AuthContext
			return response;
		} catch (error: unknown) {
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
			// Clear any previous auth errors
			if (auth.currentUser) {
				await signOut(auth);
			}

			// Use signInWithPopup with explicit error handling
			const result = await signInWithPopup(auth, googleProvider).catch(
				(error) => {
					throw error;
				}
			);

			if (!result) {
				throw new Error(
					"Failed to authenticate with Google. Please try again."
				);
			}

			const firebaseUser = result.user;

			if (!firebaseUser.email) {
				throw new Error("Google account must have an email address");
			}

			// Get the ID token with force refresh to ensure it's new
			const idToken = await firebaseUser.getIdToken(true);
			CookieManager.setAuthToken(idToken);

			try {
				const response = await login({
					firebaseUid: firebaseUser.uid,
				}).unwrap();

				dispatch(
					setCredentials({
						user: response.user,
						token: response.token,
					})
				);

				// Redirect handled by AuthContext
				return response;
			} catch (error: unknown) {
				const apiError = error as ApiError;
				if (apiError.status === 404) {
					if (typeof window !== "undefined") {
						sessionStorage.setItem(
							"pendingGoogleUser",
							JSON.stringify({
								uid: firebaseUser.uid,
								email: firebaseUser.email,
							})
						);
					}
					router.push(ROUTES.SELECT_ROLE);
					return null;
				}
				throw error;
			}
		} catch (error: unknown) {
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
			CookieManager.removeAuthToken();

			router.push(ROUTES.HOME); // Redirect to home page after logout
		} catch (error: unknown) {
			const parsedError = parseError(error);
			dispatch(setError(parsedError.message || "Failed to log out"));
		}
	};

	return {
		user,
		isAuthenticated,
		isLoading,
		error,
		isInitialized,
		signup,
		loginWithEmail,
		loginWithGoogle,
		logout,
	};
};
