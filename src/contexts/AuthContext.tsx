"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
	setCredentials,
	clearCredentials,
	setLoading,
} from "@/store/slices/authSlice";
import { useVerifyTokenMutation } from "@/store/api/authApi";
import { RootState } from "@/store/store";
import { CookieManager } from "@/utils/cookieManager";

interface AuthContextType {
	isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
	isInitialized: false,
});

const PUBLIC_ROUTES = [
	"/",
	"/login",
	"/signup",
	"/select-role",
	"/about",
	"/contact",
	"/forgot-password",
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const dispatch = useDispatch();
	const router = useRouter();
	const pathname = usePathname();
	const [verifyToken] = useVerifyTokenMutation();
	const [isInitialized, setIsInitialized] = useState(false);

	const { user, token } = useSelector((state: RootState) => state.auth);

	useEffect(() => {
		let isMounted = true;

		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!isMounted) return;

			// Set loading to true at start
			dispatch(setLoading(true));

			try {
				if (firebaseUser) {
					// Check if we already have valid user data for this Firebase user
					if (user && (user as any).firebaseUid === firebaseUser.uid && token) {
						// User data is already valid, but still verify token freshness
						try {
							const idToken = await firebaseUser.getIdToken();
							CookieManager.setAuthToken(idToken);

							if (isMounted) {
								// Keep existing user data to prevent flash
								dispatch(setLoading(false));
								setIsInitialized(true);
								return;
							}
						} catch (tokenError) {
							console.log("tokenerror", tokenError);
						}
					}

					// Get fresh token and verify with backend
					try {
						const idToken = await firebaseUser.getIdToken(true);
						CookieManager.setAuthToken(idToken);

						if (!isMounted) return;

						const response = await verifyToken({ idToken }).unwrap();

						if (isMounted) {
							dispatch(
								setCredentials({
									user: response.user,
									token: response.token, // Always use JWT token from backend
								})
							);

							// Handle redirects based on user state
							if (response.user.role) {
								if (!response.user.profileCompleted) {
									if (pathname !== "/complete-profile") {
										router.push("/complete-profile");
									}
								} else if (pathname === "/login" || pathname === "/signup") {
									router.push("/dashboard/home");
								}
							} else if (pathname !== "/select-role") {
								router.push("/select-role");
							}
						}
					} catch (verifyError) {
						console.error("Token verification failed:", verifyError);
						if (isMounted) {
							dispatch(clearCredentials());
							CookieManager.removeAuthToken();

							if (!PUBLIC_ROUTES.includes(pathname)) {
								router.push("/login");
							}
						}
					}
				} else {
					// User is not authenticated
					if (isMounted) {
						dispatch(clearCredentials());
						CookieManager.removeAuthToken();

						if (!PUBLIC_ROUTES.includes(pathname)) {
							router.push("/login");
						}
					}
				}
			} catch (error) {
				if (isMounted) {
					dispatch(clearCredentials());
					CookieManager.removeAuthToken();

					if (!PUBLIC_ROUTES.includes(pathname)) {
						router.push("/login");
					}
				}
			} finally {
				if (isMounted) {
					dispatch(setLoading(false));
					setIsInitialized(true);
				}
			}
		});

		return () => {
			isMounted = false;
			unsubscribe();
		};
	}, [dispatch, router, pathname, verifyToken]); // Intentionally excluding user/token to prevent race conditions

	return (
		<AuthContext.Provider value={{ isInitialized }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
};
