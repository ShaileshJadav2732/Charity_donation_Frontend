"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { useGetDonorProfileQuery } from "../../../store/services/donorApi";
import { toast } from "react-toastify";
import ProfileRouteGuard from "../../../components/guards/ProfileRouteGuard";

export default function DonorDashboardPage() {
	return (
		<ProfileRouteGuard requireComplete={true}>
			<DonorDashboard />
		</ProfileRouteGuard>
	);
}

export function DonorDashboard() {
	const router = useRouter();
	const { user } = useAppSelector((state) => state.auth);

	// Get donor profile with RTK Query
	const {
		data: profileData,

		error,
	} = useGetDonorProfileQuery(undefined, {
		// Skip this query if user is not logged in
		skip: !user,
	});

	// Check if profile is complete, if not redirect to complete profile page
	useEffect(() => {
		if (!profileData?.donor?.isProfileCompleted) {
			toast.info("Please complete your profile first");
			router.push("/donor/complete-profile");
		}
	}, [profileData, router]);

	// Handle errors
	useEffect(() => {
		if (error) {
			toast.error(
				"status" in error &&
					error.data &&
					typeof error.data === "object" &&
					"message" in error.data
					? (error.data.message as string)
					: "Failed to load profile data"
			);
		}
	}, [error]);

	if (!profileData?.donor) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
			</div>
		);
	}

	const donor = profileData.donor;

	return (
		<div className="min-h-screen bg-gray-50 pt-10 pb-20">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white shadow rounded-lg overflow-hidden">
					{/* Header */}
					<div className="bg-indigo-600 px-6 py-4">
						<h1 className="text-xl font-semibold text-white">
							Donor Dashboard
						</h1>
						<p className="text-indigo-200 text-sm mt-1">
							Welcome to your donor dashboard
						</p>
					</div>

					{/* Profile Summary */}
					<div className="p-6 border-b border-gray-200">
						<div className="flex items-center">
							<div className="flex-shrink-0 h-20 w-20">
								<div className="h-full w-full rounded-full overflow-hidden bg-indigo-100"></div>
							</div>
							<div className="ml-6">
								<h2 className="text-xl font-semibold text-gray-800">
									{user?.displayName || user?.email?.split("@")[0] || "Donor"}
								</h2>
								<p className="text-gray-600 mt-1">{user?.email}</p>
								<p className="text-gray-500 text-sm mt-1">
									Profile completed on{" "}
									{new Date(donor.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>

					{/* Profile Details */}
					<div className="p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Your Profile Details
						</h3>

						<dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
							<div>
								<dt className="text-sm font-medium text-gray-500">
									Contact Phone
								</dt>
								<dd className="mt-1 text-sm text-gray-900">{donor.phone}</dd>
							</div>

							<div>
								<dt className="text-sm font-medium text-gray-500">
									Availability
								</dt>
								<dd className="mt-1 text-sm text-gray-900">
									{donor.availability}
								</dd>
							</div>

							<div className="sm:col-span-2">
								<dt className="text-sm font-medium text-gray-500">
									Full Address
								</dt>
								<dd className="mt-1 text-sm text-gray-900">
									{donor.fullAddress}
								</dd>
							</div>

							<div className="sm:col-span-2">
								<dt className="text-sm font-medium text-gray-500">
									Donation Preferences
								</dt>
								<dd className="mt-1 text-sm text-gray-900">
									<div className="flex flex-wrap gap-2">
										{donor.donationPreferences.map((pref, index) => (
											<span
												key={index}
												className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
											>
												{pref}
											</span>
										))}
									</div>
								</dd>
							</div>
						</dl>

						<div className="mt-6">
							<button
								onClick={() => router.push("/donor/profile/edit")}
								className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Edit Profile
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
