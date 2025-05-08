"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useGetDonorProfileQuery } from "../../store/services/donorApi";
import { toast } from "react-toastify";

type ProfileRouteGuardProps = {
	children: React.ReactNode;
	requireComplete: boolean; // true for dashboard, false for complete-profile
};

export default function ProfileRouteGuard({
	children,
	requireComplete,
}: ProfileRouteGuardProps) {
	const router = useRouter();
	const { user } = useAppSelector((state) => state.auth);
	const [hasChecked, setHasChecked] = useState(false);
	const [isClient, setIsClient] = useState(false);

	// Wait for client-side hydration
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get token from localStorage (client-side only)
	const token = isClient ? localStorage.getItem("token") : null;

	// Get donor profile with consistent token handling
	const {
		data: profileData,
		isLoading,
		error,
	} = useGetDonorProfileQuery(undefined, {
		skip: !user || !isClient,
		refetchOnMountOrArgChange: true,
	});

	// Handle redirects based on profile completion status
	useEffect(() => {
		if (!isClient || isLoading) return;

		if (!token || !user) {
			toast.error("Please log in to access this page");
			router.push("/auth/login");
			return;
		}

		// Only redirect if we've loaded the data
		if (!isLoading && profileData) {
			const isProfileCompleted = !!profileData?.donor?.isProfileCompleted;

			// For dashboard: redirect to complete-profile if profile is incomplete
			if (requireComplete && !isProfileCompleted) {
				toast.info("Please complete your profile first");
				router.push("/donor/complete-profile");
				return;
			}

			// For complete-profile: redirect to dashboard if profile is already complete
			if (!requireComplete && isProfileCompleted) {
				toast.info("Your profile is already complete");
				router.push("/donor/dashboard");
				return;
			}

			// Mark as checked to render the page
			setHasChecked(true);
		}
	}, [isClient, isLoading, profileData, requireComplete, router, token, user]);

	// Show loading spinner while checking
	if (!hasChecked || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
			</div>
		);
	}

	// Show the actual page once checks are complete
	return <>{children}</>;
}
