"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Image from "next/image";
import {
	useGetDonorProfileQuery,
	useGetOrganizationProfileQuery,
} from "@/store/api/profileApi";
import {
	useGetDonorDonationsQuery,
	useGetDonorStatsQuery,
} from "@/store/api/donationApi";
import EditProfileForm from "./EditProfileForm";
import {
	FaMapMarkerAlt,
	FaPhone,
	FaEnvelope,
	FaGlobe,
	FaCalendarAlt,
	FaMedal,
} from "react-icons/fa";
import { format } from "date-fns";
import { DonationStats } from "@/types/donation";
import {
	DonorProfile as TypesDonorProfile,
	OrganizationProfile as TypesOrganizationProfile,
} from "@/types";

export default function ProfileDashboard() {
	const [isEditing, setIsEditing] = useState(false);
	const { user } = useSelector((state: RootState) => state.auth);
	const [activeTab, setActiveTab] = useState("overview");

	const { data: donorData } = useGetDonorProfileQuery(undefined, {
		skip: user?.role !== "donor",
	});

	const { data: orgData } = useGetOrganizationProfileQuery(undefined, {
		skip: user?.role !== "organization",
	});

	// Get actual donation data for the dashboard
	const { data: donationData } = useGetDonorDonationsQuery(
		{ limit: 5 },
		{ skip: user?.role !== "donor" }
	);

	// Get actual donor stats for the dashboard
	const { data: donorStatsData } = useGetDonorStatsQuery(undefined, {
		skip: user?.role !== "donor",
	});

	// Extract the actual donations from the API response
	const actualDonations = Array.isArray(donationData?.data)
		? donationData?.data
		: [];

	// Use donor stats data for the profile
	const donorStats: DonationStats = {
		totalDonated:
			donorStatsData?.data &&
			typeof donorStatsData.data === "object" &&
			"totalDonated" in donorStatsData.data
				? (donorStatsData.data as unknown as DonationStats).totalDonated || 0
				: 0,
		totalCauses:
			donorStatsData?.data &&
			typeof donorStatsData.data === "object" &&
			"totalCauses" in donorStatsData.data
				? (donorStatsData.data as unknown as DonationStats).totalCauses || 0
				: 0,
		averageDonation:
			donorStatsData?.data &&
			typeof donorStatsData.data === "object" &&
			"averageDonation" in donorStatsData.data
				? (donorStatsData.data as unknown as DonationStats).averageDonation || 0
				: 0,
	};

	const isDonor = user?.role === "donor";
	const donorProfile = donorData?.profile;
	const orgProfile = orgData?.profile;
	const profile = isDonor ? donorProfile : orgProfile;
	const recentDonations = donorData?.recentDonations || [];

	// Calculate membership duration
	const [membershipDuration, setMembershipDuration] = useState("");

	useEffect(() => {
		if (profile?.joinDate) {
			const joinDate = new Date(profile.joinDate);
			const now = new Date();
			const diffTime = Math.abs(now.getTime() - joinDate.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays < 30) {
				setMembershipDuration(`${diffDays} days`);
			} else if (diffDays < 365) {
				setMembershipDuration(`${Math.floor(diffDays / 30)} months`);
			} else {
				setMembershipDuration(`${Math.floor(diffDays / 365)} years`);
			}
		}
	}, [profile]);

	if (!profile) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
			</div>
		);
	}

	// Generate badges based on donor stats
	const generateBadges = () => {
		if (!isDonor) return [];

		const badges = [];
		const totalDonations =
			donorStats.totalDonated || donorProfile?.stats?.totalDonations || 0;
		const activeCauses =
			donorStats.totalCauses || donorProfile?.stats?.activeCauses || 0;
		const impactScore =
			donorStats.averageDonation || donorProfile?.stats?.impactScore || 0;

		if (totalDonations > 1000) {
			badges.push({
				name: "Generous Donor",
				description: "Donated over $1,000",
				color: "bg-purple-100 text-purple-800",
			});
		} else if (totalDonations > 500) {
			badges.push({
				name: "Regular Donor",
				description: "Donated over $500",
				color: "bg-blue-100 text-blue-800",
			});
		} else if (totalDonations > 100) {
			badges.push({
				name: "Supporter",
				description: "Donated over $100",
				color: "bg-green-100 text-green-800",
			});
		}

		if (activeCauses >= 5) {
			badges.push({
				name: "Cause Champion",
				description: "Supporting 5+ causes",
				color: "bg-yellow-100 text-yellow-800",
			});
		} else if (activeCauses >= 3) {
			badges.push({
				name: "Cause Advocate",
				description: "Supporting 3+ causes",
				color: "bg-orange-100 text-orange-800",
			});
		}

		if (impactScore > 80) {
			badges.push({
				name: "High Impact",
				description: "Average donation over $80",
				color: "bg-red-100 text-red-800",
			});
		}

		return badges;
	};

	const badges = generateBadges();

	// Format date for display
	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "MMM d, yyyy");
		} catch {
			return "Invalid date";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Profile Header with Cover Image */}
				<div className="bg-white shadow rounded-lg overflow-hidden">
					<div className="h-48 bg-gradient-to-r from-teal-500 to-green-400 relative">
						<div className="absolute -bottom-16 left-8">
							<div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white">
								<Image
									src={
										(isDonor && donorProfile?.avatar) ||
										orgProfile?.avatar ||
										profile.avatar ||
										"/shailesh.jpg"
									}
									alt="Profile"
									className="h-full w-full object-cover"
									width={128}
									height={128}
								/>
							</div>
						</div>
					</div>

					<div className="pt-20 pb-6 px-8">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									{isDonor && donorProfile
										? `${donorProfile.firstName} ${donorProfile.lastName}`
										: orgProfile?.name}
								</h1>
								<div className="flex items-center mt-1 text-gray-600">
									<FaEnvelope className="mr-2" />
									<span>{user?.email || profile.email}</span>
								</div>
								<div className="flex items-center mt-1 text-gray-600">
									<FaCalendarAlt className="mr-2" />
									<span>Member for {membershipDuration}</span>
								</div>
							</div>

							<div className="mt-4 md:mt-0">
								<button
									onClick={() => setIsEditing(true)}
									className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
								>
									Edit Profile
								</button>
							</div>
						</div>
					</div>

					{/* Navigation Tabs */}
					<div className="border-t border-gray-200">
						<div className="flex overflow-x-auto">
							<button
								onClick={() => setActiveTab("overview")}
								className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
									activeTab === "overview"
										? "border-b-2 border-teal-500 text-teal-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Overview
							</button>
							<button
								onClick={() => setActiveTab("activity")}
								className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
									activeTab === "activity"
										? "border-b-2 border-teal-500 text-teal-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Activity
							</button>
							{isDonor && (
								<button
									onClick={() => setActiveTab("badges")}
									className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
										activeTab === "badges"
											? "border-b-2 border-teal-500 text-teal-600"
											: "text-gray-500 hover:text-gray-700"
									}`}
								>
									Badges & Achievements
								</button>
							)}
							<button
								onClick={() => setActiveTab("details")}
								className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
									activeTab === "details"
										? "border-b-2 border-teal-500 text-teal-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Details
							</button>
						</div>
					</div>
				</div>

				{/* Tab Content */}
				<div className="mt-6">
					{/* Overview Tab */}
					{activeTab === "overview" && (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							{/* Stats Cards */}
							<div className="col-span-2">
								<div className="bg-white shadow rounded-lg p-6">
									<h2 className="text-lg font-medium text-gray-900 mb-4">
										{isDonor
											? "Donation Statistics"
											: "Organization Statistics"}
									</h2>

									<div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
										{isDonor && donorProfile?.stats && (
											<>
												<div className="bg-gradient-to-br from-teal-50 to-teal-100 overflow-hidden shadow rounded-lg">
													<div className="px-4 py-5 sm:p-6">
														<dt className="text-sm font-medium text-teal-800 truncate">
															Total Donations
														</dt>
														<dd className="mt-1 text-3xl font-semibold text-teal-900">
															$
															{donorStats.totalDonated ||
																donorProfile?.stats?.totalDonations ||
																0}
														</dd>
													</div>
												</div>
												<div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow rounded-lg">
													<div className="px-4 py-5 sm:p-6">
														<dt className="text-sm font-medium text-green-800 truncate">
															Active Causes
														</dt>
														<dd className="mt-1 text-3xl font-semibold text-green-900">
															{donorStats.totalCauses ||
																donorProfile?.stats?.activeCauses ||
																0}
														</dd>
													</div>
												</div>
												<div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow rounded-lg">
													<div className="px-4 py-5 sm:p-6">
														<dt className="text-sm font-medium text-blue-800 truncate">
															Average Donation
														</dt>
														<dd className="mt-1 text-3xl font-semibold text-blue-900">
															$
															{donorStats.averageDonation ||
																donorProfile?.stats?.impactScore ||
																0}
														</dd>
													</div>
												</div>
											</>
										)}

										{!isDonor && orgProfile && (
											<>
												<div className="bg-gradient-to-br from-teal-50 to-teal-100 overflow-hidden shadow rounded-lg">
													<div className="px-4 py-5 sm:p-6">
														<dt className="text-sm font-medium text-teal-800 truncate">
															Total Campaigns
														</dt>
														<dd className="mt-1 text-3xl font-semibold text-teal-900">
															{/* Use actual data when available */}
															{3}
														</dd>
													</div>
												</div>
												<div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow rounded-lg">
													<div className="px-4 py-5 sm:p-6">
														<dt className="text-sm font-medium text-green-800 truncate">
															Active Causes
														</dt>
														<dd className="mt-1 text-3xl font-semibold text-green-900">
															{/* Use actual data when available */}
															{7}
														</dd>
													</div>
												</div>
												<div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow rounded-lg">
													<div className="px-4 py-5 sm:p-6">
														<dt className="text-sm font-medium text-blue-800 truncate">
															Total Donors
														</dt>
														<dd className="mt-1 text-3xl font-semibold text-blue-900">
															{/* Use actual data when available */}
															{24}
														</dd>
													</div>
												</div>
											</>
										)}
									</div>
								</div>
							</div>

							{/* About Section */}
							<div className="col-span-1">
								<div className="bg-white shadow rounded-lg p-6">
									<h2 className="text-lg font-medium text-gray-900 mb-4">
										{isDonor ? "About Me" : "About Organization"}
									</h2>
									<p className="text-gray-700">
										{isDonor && donorProfile
											? donorProfile.bio ||
											  "No bio provided yet. Edit your profile to add a bio."
											: orgProfile?.description ||
											  "No description provided yet."}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Activity Tab */}
					{activeTab === "activity" && (
						<div className="bg-white shadow rounded-lg p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Recent Activity
							</h2>

							{isDonor &&
							(actualDonations.length > 0 || recentDonations.length > 0) ? (
								<div className="flow-root">
									<ul className="-mb-8">
										{/* Use actual donations from API if available, otherwise fall back to recentDonations */}
										{(actualDonations.length > 0
											? actualDonations
											: recentDonations
										).map((donation, index) => (
											<li key={donation._id || index}>
												<div className="relative pb-8">
													{index !==
														(actualDonations.length > 0
															? actualDonations.length
															: recentDonations.length) -
															1 && (
														<span
															className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
															aria-hidden="true"
														></span>
													)}
													<div className="relative flex space-x-3">
														<div>
															<span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
																<svg
																	className="h-5 w-5 text-green-600"
																	xmlns="http://www.w3.org/2000/svg"
																	viewBox="0 0 20 20"
																	fill="currentColor"
																	aria-hidden="true"
																>
																	<path
																		fillRule="evenodd"
																		d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
																		clipRule="evenodd"
																	/>
																</svg>
															</span>
														</div>
														<div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
															<div>
																<p className="text-sm text-gray-700">
																	Donated{" "}
																	<span className="font-medium text-gray-900">
																		${donation.amount}
																	</span>{" "}
																	to{" "}
																	<span className="font-medium text-gray-900">
																		{donation.cause?.title || donation.cause}
																	</span>
																</p>
															</div>
															<div className="text-right text-sm whitespace-nowrap text-gray-500">
																<time
																	dateTime={donation.createdAt || donation.date}
																>
																	{formatDate(
																		donation.createdAt || donation.date
																	)}
																</time>
															</div>
														</div>
													</div>
												</div>
											</li>
										))}
									</ul>
								</div>
							) : !isDonor ? (
								<div className="flow-root">
									<ul className="-mb-8">
										{[...Array(3)].map((_, index) => (
											<li key={index}>
												<div className="relative pb-8">
													{index !== 2 && (
														<span
															className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
															aria-hidden="true"
														></span>
													)}
													<div className="relative flex space-x-3">
														<div>
															<span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
																<svg
																	className="h-5 w-5 text-blue-600"
																	xmlns="http://www.w3.org/2000/svg"
																	viewBox="0 0 20 20"
																	fill="currentColor"
																	aria-hidden="true"
																>
																	<path
																		fillRule="evenodd"
																		d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
																		clipRule="evenodd"
																	/>
																</svg>
															</span>
														</div>
														<div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
															<div>
																<p className="text-sm text-gray-700">
																	{index === 0 ? (
																		<>
																			Created a new cause{" "}
																			<span className="font-medium text-gray-900">
																				Clean Water Initiative
																			</span>
																		</>
																	) : index === 1 ? (
																		<>
																			Received{" "}
																			<span className="font-medium text-gray-900">
																				5 new donations
																			</span>
																		</>
																	) : (
																		<>
																			Launched a new campaign{" "}
																			<span className="font-medium text-gray-900">
																				Summer Fundraiser
																			</span>
																		</>
																	)}
																</p>
															</div>
															<div className="text-right text-sm whitespace-nowrap text-gray-500">
																<time>
																	{index === 0
																		? "2 days ago"
																		: index === 1
																		? "1 week ago"
																		: "2 weeks ago"}
																</time>
															</div>
														</div>
													</div>
												</div>
											</li>
										))}
									</ul>
								</div>
							) : (
								<div className="text-center py-8">
									<svg
										className="mx-auto h-12 w-12 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									<h3 className="mt-2 text-sm font-medium text-gray-900">
										No activity yet
									</h3>
									<p className="mt-1 text-sm text-gray-500">
										Start donating to causes you care about.
									</p>
								</div>
							)}
						</div>
					)}

					{/* Badges Tab */}
					{activeTab === "badges" && isDonor && (
						<div className="bg-white shadow rounded-lg p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Badges & Achievements
							</h2>

							{badges.length > 0 ? (
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{badges.map((badge, index) => (
										<div
											key={index}
											className={`${badge.color} rounded-lg p-4 flex items-center`}
										>
											<div className="flex-shrink-0 mr-3">
												<FaMedal className="h-6 w-6" />
											</div>
											<div>
												<h3 className="text-sm font-medium">{badge.name}</h3>
												<p className="text-xs mt-1">{badge.description}</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<svg
										className="mx-auto h-12 w-12 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
										/>
									</svg>
									<h3 className="mt-2 text-sm font-medium text-gray-900">
										No badges yet
									</h3>
									<p className="mt-1 text-sm text-gray-500">
										Continue donating to earn badges and achievements.
									</p>
								</div>
							)}

							{/* Progress Towards Next Badge */}
							<div className="mt-6">
								<h3 className="text-sm font-medium text-gray-900 mb-2">
									Progress towards next badge
								</h3>
								<div className="bg-gray-200 rounded-full h-2.5">
									<div
										className="bg-teal-600 h-2.5 rounded-full"
										style={{
											width: `${Math.min(
												(donorStats.totalDonated ||
													donorProfile?.stats?.totalDonations ||
													0) / 10,
												100
											)}%`,
										}}
									></div>
								</div>
								<p className="text-xs text-gray-500 mt-2">
									{(donorStats.totalDonated ||
										donorProfile?.stats?.totalDonations ||
										0) < 100 ? (
										<>
											Donate $
											{100 -
												(donorStats.totalDonated ||
													donorProfile?.stats?.totalDonations ||
													0)}{" "}
											more to earn the &quot;Supporter&quot; badge
										</>
									) : (donorStats.totalDonated ||
											donorProfile?.stats?.totalDonations ||
											0) < 500 ? (
										<>
											Donate $
											{500 -
												(donorStats.totalDonated ||
													donorProfile?.stats?.totalDonations ||
													0)}{" "}
											more to earn the &quot;Regular Donor&quot; badge
										</>
									) : (donorStats.totalDonated ||
											donorProfile?.stats?.totalDonations ||
											0) < 1000 ? (
										<>
											Donate $
											{1000 -
												(donorStats.totalDonated ||
													donorProfile?.stats?.totalDonations ||
													0)}{" "}
											more to earn the &quot;Generous Donor&quot; badge
										</>
									) : (
										<>You&apos;ve earned all available donation badges!</>
									)}
								</p>
							</div>
						</div>
					)}

					{/* Details Tab */}
					{activeTab === "details" && (
						<div className="bg-white shadow rounded-lg p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Contact Information
							</h2>

							<div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
								<div>
									<div className="flex items-center">
										<FaEnvelope className="h-5 w-5 text-gray-400 mr-2" />
										<dt className="text-sm font-medium text-gray-500">Email</dt>
									</div>
									<dd className="mt-1 text-sm text-gray-900 ml-7">
										{user?.email || profile.email}
									</dd>
								</div>

								<div>
									<div className="flex items-center">
										<FaPhone className="h-5 w-5 text-gray-400 mr-2" />
										<dt className="text-sm font-medium text-gray-500">Phone</dt>
									</div>
									<dd className="mt-1 text-sm text-gray-900 ml-7">
										{profile.phoneNumber || "Not provided"}
									</dd>
								</div>

								<div className="sm:col-span-2">
									<div className="flex items-center">
										<FaMapMarkerAlt className="h-5 w-5 text-gray-400 mr-2" />
										<dt className="text-sm font-medium text-gray-500">
											Address
										</dt>
									</div>
									<dd className="mt-1 text-sm text-gray-900 ml-7">
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

								{!isDonor && orgProfile?.website && (
									<div className="sm:col-span-2">
										<div className="flex items-center">
											<FaGlobe className="h-5 w-5 text-gray-400 mr-2" />
											<dt className="text-sm font-medium text-gray-500">
												Website
											</dt>
										</div>
										<dd className="mt-1 text-sm text-gray-900 ml-7">
											<a
												href={orgProfile.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-teal-600 hover:text-teal-500"
											>
												{orgProfile.website}
											</a>
										</dd>
									</div>
								)}

								<div className="sm:col-span-2">
									<div className="flex items-center">
										<FaCalendarAlt className="h-5 w-5 text-gray-400 mr-2" />
										<dt className="text-sm font-medium text-gray-500">
											Member Since
										</dt>
									</div>
									<dd className="mt-1 text-sm text-gray-900 ml-7">
										{profile.joinDate
											? formatDate(profile.joinDate)
											: "Unknown"}
									</dd>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Edit Profile Modal */}
			{isEditing && profile && (
				<EditProfileForm
					profile={
						profile as unknown as TypesDonorProfile | TypesOrganizationProfile
					}
					isDonor={isDonor}
					onClose={() => setIsEditing(false)}
				/>
			)}
		</div>
	);
}
