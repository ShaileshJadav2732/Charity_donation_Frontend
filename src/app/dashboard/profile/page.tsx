"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ProfileDashboard from "@/components/profile/ProfileDashboard";
import {
	useGetDonorProfileQuery,
	useGetOrganizationProfileQuery,
} from "@/store/api/profileApi";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function ProfilePage() {
	const { user } = useSelector((state: RootState) => state.auth);

	// Protect route based on user role
	const { isAuthorized } = useRouteGuard({
		allowedRoles: ["donor", "organization"],
		redirectTo: "/dashboard",
	});

	// Fetch profile data based on user role
	const { isLoading: isDonorLoading, error: donorError } =
		useGetDonorProfileQuery(undefined, {
			skip: user?.role !== "donor",
		});

	const { isLoading: isOrgLoading, error: orgError } =
		useGetOrganizationProfileQuery(undefined, {
			skip: user?.role !== "organization",
		});

	// If not authorized, don't render anything
	if (!isAuthorized) {
		return null;
	}

	// Show loading state
	if (
		(user?.role === "donor" && isDonorLoading) ||
		(user?.role === "organization" && isOrgLoading)
	) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	// Show error state
	if (
		(user?.role === "donor" && donorError) ||
		(user?.role === "organization" && orgError)
	) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-red-600">Failed to load profile data</div>
			</div>
		);
	}

	return <ProfileDashboard />;
}
