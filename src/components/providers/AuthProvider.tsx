"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getToken, refreshToken, removeToken } from "@/utils/auth";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { setCredentials, clearCredentials } from "@/store/slices/authSlice";
import { toast } from "react-toastify";

// Create context
const AuthContext = createContext<{
	isLoading: boolean;
	checkAuth: () => Promise<boolean>;
}>({
	isLoading: true,
	checkAuth: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const dispatch = useAppDispatch();

	// Function to check authentication status
	const checkAuth = async (): Promise<boolean> => {
		if (typeof window === "undefined") return false;

		try {
			const token = getToken();

			// If no token, we're not authenticated
			if (!token) {
				dispatch(clearCredentials());
				return false;
			}

			// Check if Firebase user is still authenticated
			const currentUser = auth.currentUser;
			if (!currentUser) {
				console.log("No Firebase user found, clearing credentials");
				removeToken();
				dispatch(clearCredentials());
				return false;
			}

			// Try to refresh token if needed
			const { isTokenExpired } = await import("@/utils/auth");
			if (isTokenExpired(token)) {
				console.log("Token expired, refreshing");
				const newToken = await refreshToken();

				if (!newToken) {
					console.log("Token refresh failed, logging out");
					removeToken();
					dispatch(clearCredentials());
					return false;
				}
			}

			return true;
		} catch (error) {
			console.error("Error checking auth:", error);
			removeToken();
			dispatch(clearCredentials());
			return false;
		}
	};

	// Listen for Firebase auth state changes
	useEffect(() => {
		if (typeof window === "undefined") return;

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setIsLoading(true);

			if (user) {
				// User is signed in
				try {
					// Get fresh token
					const token = await user.getIdToken(true);

					// Store token
					if (typeof window !== "undefined") {
						localStorage.setItem("token", token);
					}

					// Update Redux state
					dispatch(
						setCredentials({
							user: {
								id: user.uid,
								email: user.email || "",
								role: "donor", // Default role, will be updated from API
								displayName: user.displayName || undefined,
								photoURL: user.photoURL || undefined,
							},
						})
					);
				} catch (error) {
					console.error("Error getting user token:", error);
					removeToken();
					dispatch(clearCredentials());
				}
			} else {
				// User is signed out
				removeToken();
				dispatch(clearCredentials());
			}

			setIsLoading(false);
		});

		// Cleanup subscription
		return () => unsubscribe();
	}, [dispatch]);

	return (
		<AuthContext.Provider value={{ isLoading, checkAuth }}>
			{children}
		</AuthContext.Provider>
	);
}
