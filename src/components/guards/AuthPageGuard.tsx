"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useGetProfileStatusQuery } from "../../store/services/authApi";
import { toast } from "react-toastify";

// Guard for login/signup pages - redirects if user is logged in
export default function AuthPageGuard({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { user, isAuthenticated } = useAppSelector((state) => state.auth);
	const [isClient, setIsClient] = useState(false);

	// Wait for client-side hydration
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get token from localStorage (client-side only)
	const token = isClient ? localStorage.getItem("token") : null;

	// Get profile status to determine redirect destination
	const { data: profileStatus, isLoading } = useGetProfileStatusQuery(
		undefined,
		{
			skip: !isClient || !token,
		}
	);

	useEffect(() => {
		// Only run on client
		if (!isClient) return;

		// Check if user is already logged in
		if (token) {
			// If we have profile status data, use it for smart redirection
			if (profileStatus) {
				const { role, isProfileCompleted } = profileStatus;

				if (role === "donor") {
					if (!isProfileCompleted) {
						toast.info("Please complete your profile");
						router.push("/donor/complete-profile");
					} else {
						router.push("/donor/dashboard");
					}
				} else if (role === "organization") {
					if (!isProfileCompleted) {
						router.push("/organization/complete-profile");
					} else {
						router.push("/organization/dashboard");
					}
				} else if (role === "admin") {
					router.push("/admin/dashboard");
				} else {
					router.push("/dashboard");
				}
			} else if (!isLoading && user) {
				// Fallback if we don't have profile status but do have a user
				router.push("/dashboard");
			}
		}
	}, [isClient, token, user, profileStatus, isLoading, router]);

	// If we're loading or there's an authenticated user, show a loading state
	if (!isClient || (token && (user || isLoading))) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
			</div>
		);
	}

	// Only show the login/signup page if there's no token or user
	return <>{children}</>;
}
