"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	useGetDonorProfileQuery,
	useGetOrganizationProfileQuery,
} from "@/store/api/profileApi";
import EditProfileForm from "./EditProfileForm";

export default function ProfileDashboard() {
	const [isEditing, setIsEditing] = useState(false);
	const { user } = useSelector((state: RootState) => state.auth);

	const { data: donorData } = useGetDonorProfileQuery(undefined, {
		skip: user?.role !== "donor",
	});

	const { data: orgData } = useGetOrganizationProfileQuery(undefined, {
		skip: user?.role !== "organization",
	});

	const isDonor = user?.role === "donor";
	const donorProfile = donorData?.profile;
	const orgProfile = orgData?.profile;
	const profile = isDonor ? donorProfile : orgProfile;

	if (!profile) {
		return null;
	}

	return (
		<div className="h-screen overflow-hidden">
			<div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
				<div className="bg-white shadow rounded-lg">
					{/* Profile Header */}
					<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<img
									src={profile.avatar || "/placeholder-avatar.png"}
									alt="Profile"
									className="h-16 w-16 rounded-full"
								/>
								<div>
									<h2 className="text-2xl font-bold text-gray-900">
										{isDonor && donorProfile
											? `${donorProfile.firstName} ${donorProfile.lastName}`
											: orgProfile?.name}
									</h2>
									<p className="text-sm text-gray-500">{profile.email}</p>
								</div>
							</div>
							<button
								onClick={() => setIsEditing(true)}
								className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
							>
								Edit Profile
							</button>
						</div>
					</div>

					{/* Profile Stats */}
					{isDonor && donorProfile?.stats && (
						<div className="px-4 py-5 sm:p-6">
							<div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
								<div className="bg-gray-50 overflow-hidden shadow rounded-lg">
									<div className="px-4 py-5 sm:p-6">
										<dt className="text-sm font-medium text-gray-500 truncate">
											Total Donations
										</dt>
										<dd className="mt-1 text-3xl font-semibold text-gray-900">
											${donorProfile.stats.totalDonations}
										</dd>
									</div>
								</div>
								<div className="bg-gray-50 overflow-hidden shadow rounded-lg">
									<div className="px-4 py-5 sm:p-6">
										<dt className="text-sm font-medium text-gray-500 truncate">
											Active Causes
										</dt>
										<dd className="mt-1 text-3xl font-semibold text-gray-900">
											{donorProfile.stats.activeCauses}
										</dd>
									</div>
								</div>
								<div className="bg-gray-50 overflow-hidden shadow rounded-lg">
									<div className="px-4 py-5 sm:p-6">
										<dt className="text-sm font-medium text-gray-500 truncate">
											Impact Score
										</dt>
										<dd className="mt-1 text-3xl font-semibold text-gray-900">
											{donorProfile.stats.impactScore}
										</dd>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Profile Details */}
					<div className="px-4 py-5 sm:p-6">
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div>
								<h3 className="text-lg font-medium text-gray-900">
									Contact Information
								</h3>
								<dl className="mt-2 space-y-2">
									<div>
										<dt className="text-sm font-medium text-gray-500">Phone</dt>
										<dd className="text-sm text-gray-900">
											{profile.phoneNumber || "Not provided"}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Address
										</dt>
										<dd className="text-sm text-gray-900">
											{profile.address ? (
												<>
													{profile.address}
													<br />
													{profile.city}, {profile.state} {profile.country}
												</>
											) : (
												"Not provided"
											)}
										</dd>
									</div>
								</dl>
							</div>
							<div>
								<h3 className="text-lg font-medium text-gray-900">
									{isDonor ? "About Me" : "About Organization"}
								</h3>
								<p className="mt-2 text-sm text-gray-900">
									{isDonor && donorProfile
										? donorProfile.bio || "No bio provided"
										: orgProfile?.description || "No description provided"}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Edit Profile Modal */}
			{isEditing && (
				<EditProfileForm
					profile={profile}
					isDonor={isDonor}
					onClose={() => setIsEditing(false)}
				/>
			)}
		</div>
	);
}
