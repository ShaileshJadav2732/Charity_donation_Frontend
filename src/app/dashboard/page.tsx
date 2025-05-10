"use client";

import { useGetDashboardDataQuery } from "@/store/api/dashboardApi";
import { FiTrendingUp, FiUsers, FiAward, FiHome } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function DashboardPage() {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const { data: dashboardData, isLoading, error } = useGetDashboardDataQuery();

	useEffect(() => {
		if (!user) {
			router.push("/login");
		}
	}, [user, router]);

	const { stats, recentActivity } = dashboardData || {
		stats: {
			totalDonations: 0,
			donationGrowth: 0,
			causesSupported: 0,
			activeCategories: 0,
			impactScore: 0,
			impactPercentile: 0,
			organizationsCount: 0,
			supportingOrganizations: 0,
		},
		recentActivity: [],
	};

	return (
		<div className="h-screen overflow-hidden">
			<div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					{user?.role === "donor"
						? "Donor Dashboard"
						: "Organization Dashboard"}
				</h1>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
					{/* Total Donations */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									{user?.role === "donor"
										? "Total Donations"
										: "Total Received"}
								</p>
								<p className="text-2xl font-semibold text-gray-900">
									${stats.totalDonations.toLocaleString()}
								</p>
							</div>
							<div className="p-3 bg-emerald-50 rounded-full">
								<FiTrendingUp className="h-6 w-6 text-emerald-600" />
							</div>
						</div>
						<div className="mt-4">
							<span
								className={`text-sm font-medium ${
									stats.donationGrowth >= 0
										? "text-emerald-600"
										: "text-red-600"
								}`}
							>
								{stats.donationGrowth >= 0 ? "+" : ""}
								{stats.donationGrowth.toFixed(1)}% from last month
							</span>
						</div>
					</div>

					{/* Causes/Campaigns */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									{user?.role === "donor"
										? "Causes Supported"
										: "Active Campaigns"}
								</p>
								<p className="text-2xl font-semibold text-gray-900">
									{stats.causesSupported}
								</p>
							</div>
							<div className="p-3 bg-blue-50 rounded-full">
								<FiUsers className="h-6 w-6 text-blue-600" />
							</div>
						</div>
						<div className="mt-4">
							<span className="text-sm text-gray-600">
								Active in {stats.activeCategories} categories
							</span>
						</div>
					</div>

					{/* Impact Score */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									{user?.role === "donor"
										? "Impact Score"
										: "Organization Score"}
								</p>
								<p className="text-2xl font-semibold text-gray-900">
									{stats.impactScore}
								</p>
							</div>
							<div className="p-3 bg-purple-50 rounded-full">
								<FiAward className="h-6 w-6 text-purple-600" />
							</div>
						</div>
						<div className="mt-4">
							<span className="text-sm text-gray-600">
								Top {stats.impactPercentile}%{" "}
								{user?.role === "donor" ? "of donors" : "of organizations"}
							</span>
						</div>
					</div>

					{/* Organizations/Donors */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									{user?.role === "donor" ? "Organizations" : "Active Donors"}
								</p>
								<p className="text-2xl font-semibold text-gray-900">
									{stats.organizationsCount}
								</p>
							</div>
							<div className="p-3 bg-orange-50 rounded-full">
								<FiHome className="h-6 w-6 text-orange-600" />
							</div>
						</div>
						<div className="mt-4">
							<span className="text-sm text-gray-600">
								{user?.role === "donor"
									? `Supporting ${stats.supportingOrganizations} organizations`
									: `${stats.supportingOrganizations} regular donors`}
							</span>
						</div>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="bg-white rounded-lg shadow">
					<div className="px-6 py-5 border-b border-gray-200">
						<h2 className="text-lg font-medium text-gray-900">
							Recent Activity
						</h2>
					</div>
					<div className="divide-y divide-gray-200">
						{recentActivity.length > 0 ? (
							recentActivity.map((activity) => (
								<div key={activity.id} className="px-6 py-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-900">
												{user?.role === "donor"
													? `Donated $${activity.amount?.toLocaleString()} to ${
															activity.campaignName
													  }`
													: `Received $${activity.amount?.toLocaleString()} from ${
															activity.organizationName
													  }`}
											</p>
											<p className="text-sm text-gray-500">
												{formatDistanceToNow(new Date(activity.timestamp), {
													addSuffix: true,
												})}
											</p>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="px-6 py-4">
								<p className="text-sm text-gray-500">No recent activity</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
