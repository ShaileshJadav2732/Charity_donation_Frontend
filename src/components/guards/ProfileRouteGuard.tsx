"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useGetDonorProfileQuery } from "../../store/services/donorApi";
import { toast } from "react-toastify";
import { getToken } from "../../utils/auth";

type ProfileRouteGuardProps = {
	children: React.ReactNode;
	requireComplete: boolean;
};

export default function ProfileRouteGuard({
	children,
	requireComplete,
}: ProfileRouteGuardProps) {
	const router = useRouter();
	const { user, isAuthenticated } = useAppSelector((state) => state.auth);
	const [isClient, setIsClient] = useState(false);
	const [isAuthChecked, setIsAuthChecked] = useState(false);
	const [isCheckingProfile, setIsCheckingProfile] = useState(true);
	const [timeoutOccurred, setTimeoutOccurred] = useState(false);

	// Wait for client-side hydration
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Set a timeout to prevent infinite loading
	useEffect(() => {
		if (!isClient) return;

		const timer = setTimeout(() => {
			setTimeoutOccurred(true);
		}, 10000); // 10 seconds timeout

		return () => clearTimeout(timer);
	}, [isClient]);

	// First, check for authentication
	useEffect(() => {
		if (!isClient) return;

		// This ensures we only check after client-side hydration
		const token = getToken();
		console.log(
			"ProfileRouteGuard: Token exists:",
			!!token,
			"User exists:",
			!!user
		);

		// Only redirect if we don't have both token and user
		if (!token || !user) {
			console.log("ProfileRouteGuard: No token or user, redirecting to login");
			toast.error("Please log in to access this page");
			router.push("/auth/login");
		} else {
			console.log("ProfileRouteGuard: Auth check passed");
			setIsAuthChecked(true);
		}
	}, [isClient, user, router]);

	// Get donor profile only if authenticated
	const {
		data: profileData,
		isLoading: isProfileLoading,
		error: profileError,
	} = useGetDonorProfileQuery(undefined, {
		skip: !isClient || !user || !isAuthChecked,
	});

	// Log profile data for debugging
	useEffect(() => {
		if (isClient && isAuthChecked) {
			console.log("ProfileRouteGuard: Profile loading:", isProfileLoading);
			console.log("ProfileRouteGuard: Profile data:", profileData);
			console.log("ProfileRouteGuard: Profile error:", profileError);
		}
	}, [isClient, isAuthChecked, isProfileLoading, profileData, profileError]);

	// Check profile completion after auth is confirmed
	useEffect(() => {
		if (!isClient || !isAuthChecked) return;

		// If profile is loading, wait
		if (isProfileLoading) return;

		// If we have profile data, check completion
		if (profileData?.donor) {
			const isProfileCompleted = !!profileData.donor.isProfileCompleted;
			console.log("ProfileRouteGuard: Profile completed:", isProfileCompleted);

			if (requireComplete && !isProfileCompleted) {
				console.log(
					"ProfileRouteGuard: Profile not complete, redirecting to complete profile"
				);
				toast.info("Please complete your profile first");
				router.push("/donor/complete-profile");
				return;
			}

			if (!requireComplete && isProfileCompleted) {
				console.log(
					"ProfileRouteGuard: Profile already complete, redirecting to dashboard"
				);
				toast.info("Your profile is already complete");
				router.push("/donor/dashboard");
				return;
			}
		}

		// If we have an error but it's not a 404 (which is expected for new profiles)
		if (
			profileError &&
			!(
				typeof profileError === "object" &&
				"status" in profileError &&
				profileError.status === 404
			)
		) {
			console.log("ProfileRouteGuard: Profile error, but continuing");
			// We don't redirect here, just log the error
		}

		// We've checked everything, so we're done checking
		setIsCheckingProfile(false);
	}, [
		isClient,
		isAuthChecked,
		profileData,
		profileError,
		requireComplete,
		router,
		isProfileLoading,
	]);

	// Show loading state while checking
	if (!isClient || !isAuthChecked || (isCheckingProfile && !timeoutOccurred)) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
				<p className="text-gray-600">Loading your profile...</p>
			</div>
		);
	}

	// If timeout occurred, show content anyway with a warning
	if (timeoutOccurred && isCheckingProfile) {
		console.log("ProfileRouteGuard: Timeout occurred, showing content anyway");
		// We could show a warning here, but let's just render the content
	}

	// Show content
	return <>{children}</>;
}
