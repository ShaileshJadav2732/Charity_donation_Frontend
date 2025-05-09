"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import DonorProfileForm from "@/components/profile/DonorProfileForm";
import OrganizationProfileForm from "@/components/profile/OrganizationProfileForm";
import NoSSR from "@/components/common/NoSSR";

export default function CompleteProfilePage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<NoSSR>
				<CompleteProfileContent />
			</NoSSR>
		</div>
	);
}

function CompleteProfileContent() {
	const router = useRouter();
	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.auth
	);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Redirect if user is not authenticated
	useEffect(() => {
		if (isClient && !isAuthenticated) {
			router.push("/login");
		}

		// Redirect if profile is already completed
		if (isClient && user?.profileCompleted) {
			router.push("/dashboard");
		}
	}, [isAuthenticated, user, router, isClient]);

	// Show loading state while checking authentication
	if (!isClient || !isAuthenticated || !user) {
		return (
			<div className="flex items-center justify-center">
				<p className="text-lg">Loading...</p>
			</div>
		);
	}

	return (
		<>
			{user.role === "donor" ? (
				<DonorProfileForm />
			) : (
				<OrganizationProfileForm />
			)}
		</>
	);
}
