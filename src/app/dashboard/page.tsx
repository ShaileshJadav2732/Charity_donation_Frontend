"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	FaHeart,
	FaChartLine,
	FaHandHoldingHeart,
	FaCalendarAlt,
	FaSpinner,
	FaDownload,
} from "react-icons/fa";

// Mock data for the dashboard
const mockDonorStats = {
	totalDonations: 2500,
	causesSupported: 5,
	impactScore: 85,
	organizationsSupported: 3,
};

const mockOrgStats = {
	totalFundsRaised: 15000,
	activeCampaigns: 3,
	totalDonors: 45,
	successRate: 92,
};

const mockRecentDonations = [
	{
		id: 1,
		cause: {
			title: "Education for All",
			category: "Education",
			image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWR1Y2F0aW9ufGVufDB8fDB8fHww",
		},
		amount: 500,
		date: "2024-03-15",
		impact: "Supports 2 students for a month",
		donor: { name: "John Doe" },
	},
	{
		id: 2,
		cause: {
			title: "Clean Water Initiative",
			category: "Environment",
			image: "https://images.unsplash.com/photo-1589634749000-1e72f8a198c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2F0ZXJ8ZW58MHx8MHx8fDA%3D",
		},
		amount: 750,
		date: "2024-03-14",
		impact: "Provides clean water to 50 families",
		donor: { name: "Jane Smith" },
	},
	{
		id: 3,
		cause: {
			title: "Medical Aid",
			category: "Healthcare",
			image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVhbHRoY2FyZXxlbnwwfHwwfHx8MA%3D%3D",
		},
		amount: 1000,
		date: "2024-03-13",
		impact: "Supports medical supplies for 1 month",
		donor: { name: "Anonymous" },
	},
];

const mockAnalytics = {
	monthlyDonations: [
		{ month: "January", amount: 2500 },
		{ month: "February", amount: 3200 },
		{ month: "March", amount: 2800 },
	],
	categoryDistribution: [
		{ category: "Education", amount: 5000 },
		{ category: "Healthcare", amount: 3500 },
		{ category: "Environment", amount: 2000 },
	],
};

export default function DashboardPage() {
	const user = useSelector((state: RootState) => state.auth.user);

	// Not authenticated
	if (!user) {
		return (
			<div className="text-center py-12">
				<p className="text-red-600">Please log in to view the dashboard.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-gray-600">
					Welcome back, {user?.email || "User"}
				</p>
			</div>

			{user.role === "donor" ? (
				<DonorDashboard
					donorStats={mockDonorStats}
					recentDonations={mockRecentDonations}
					analytics={mockAnalytics}
				/>
			) : (
				<OrganizationDashboard
					orgStats={mockOrgStats}
					recentDonations={mockRecentDonations}
					analytics={mockAnalytics}
				/>
			)}
		</div>
	);
}

// Separate components for donor and organization dashboards
const DonorDashboard = ({
	donorStats,
	recentDonations,
	analytics,
}: {
	donorStats: typeof mockDonorStats;
	recentDonations: typeof mockRecentDonations;
	analytics: typeof mockAnalytics;
}) => (
	<div className="space-y-6">
		{/* Stats Overview */}
		<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
			<div className="bg-white rounded-xl shadow-md p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600">Total Donations</p>
						<p className="text-2xl font-bold text-gray-900">
							${donorStats.totalDonations.toLocaleString()}
						</p>
					</div>
					<div className="bg-teal-100 p-3 rounded-full">
						<FaHeart className="h-6 w-6 text-teal-600" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-md p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600">Causes Supported</p>
						<p className="text-2xl font-bold text-gray-900">
							{donorStats.causesSupported}
						</p>
					</div>
					<div className="bg-purple-100 p-3 rounded-full">
						<FaHandHoldingHeart className="h-6 w-6 text-purple-600" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-md p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600">Impact Score</p>
						<p className="text-2xl font-bold text-gray-900">
							{donorStats.impactScore}
						</p>
					</div>
					<div className="bg-blue-100 p-3 rounded-full">
						<FaChartLine className="h-6 w-6 text-blue-600" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-md p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600">Organizations</p>
						<p className="text-2xl font-bold text-gray-900">
							{donorStats.organizationsSupported}
						</p>
					</div>
					<div className="bg-green-100 p-3 rounded-full">
						<FaHandHoldingHeart className="h-6 w-6 text-green-600" />
					</div>
				</div>
			</div>
		</div>

		{/* Recent Donations */}
		<div className="bg-white rounded-xl shadow-md p-6">
			<h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h2>
			<div className="space-y-4">
				{recentDonations.map((donation) => (
					<div
						key={donation.id}
						className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
					>
						<div className="flex items-center space-x-4">
							{donation.cause.image && (
								<img
									src={donation.cause.image}
									alt={donation.cause.title}
									className="w-12 h-12 rounded-lg object-cover"
								/>
							)}
							<div>
								<h3 className="font-medium text-gray-900">{donation.cause.title}</h3>
								<p className="text-sm text-gray-600">{donation.impact}</p>
							</div>
						</div>
						<div className="text-right">
							<p className="font-semibold text-gray-900">
								${donation.amount.toLocaleString()}
							</p>
							<p className="text-sm text-gray-600">
								<span className="flex items-center">
									<FaCalendarAlt className="h-4 w-4 text-gray-400 mr-2" />
									{new Date(donation.date).toLocaleDateString()}
								</span>
							</p>
						</div>
					</div>
				))}
			</div>
		</div>

		{/* Analytics Section */}
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div className="bg-white rounded-xl shadow-md p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Donations</h2>
				<div className="space-y-4">
					{analytics.monthlyDonations.map((item) => (
						<div key={item.month} className="flex items-center justify-between">
							<span className="text-gray-600">{item.month}</span>
							<span className="font-semibold">${item.amount.toLocaleString()}</span>
						</div>
					))}
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-md p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
				<div className="space-y-4">
					{analytics.categoryDistribution.map((item) => (
						<div key={item.category} className="flex items-center justify-between">
							<span className="text-gray-600">{item.category}</span>
							<span className="font-semibold">${item.amount.toLocaleString()}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	</div>
);

const OrganizationDashboard = ({
	orgStats,
	recentDonations,
	analytics,
}: {
	orgStats: typeof mockOrgStats;
	recentDonations: typeof mockRecentDonations;
	analytics: typeof mockAnalytics;
}) => (
	<div className="space-y-6">
		{/* Stats Overview */}
		<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
			<div className="bg-white rounded-xl shadow-md p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600">Total Funds Raised</p>
						<p className="text-2xl font-bold text-gray-900">
							${orgStats.totalFundsRaised.toLocaleString()}
						</p>
					</div>
					<div className="bg-teal-100 p-3 rounded-full">
						<FaHeart className="h-6 w-6 text-teal-600" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-md p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600">Active Campaigns</p>
						<p className="text-2xl font-bold text-gray-900">
							{orgStats.activeCampaigns}
						</p>
					</div>
					<div className="bg-purple-100 p-3 rounded-full">
						<FaHandHoldingHeart className="h-6 w-6 text-purple-600" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-md p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600">Total Donors</p>
						<p className="text-2xl font-bold text-gray-900">
							{orgStats.totalDonors}
						</p>
					</div>
					<div className="bg-blue-100 p-3 rounded-full">
						<FaChartLine className="h-6 w-6 text-blue-600" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-md p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600">Success Rate</p>
						<p className="text-2xl font-bold text-gray-900">
							{orgStats.successRate}%
						</p>
					</div>
					<div className="bg-green-100 p-3 rounded-full">
						<FaHandHoldingHeart className="h-6 w-6 text-green-600" />
					</div>
				</div>
			</div>
		</div>

		{/* Recent Donations */}
		<div className="bg-white rounded-xl shadow-md p-6">
			<h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h2>
			<div className="space-y-4">
				{recentDonations.map((donation) => (
					<div
						key={donation.id}
						className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
					>
						<div className="flex items-center space-x-4">
							{donation.cause.image && (
								<img
									src={donation.cause.image}
									alt={donation.cause.title}
									className="w-12 h-12 rounded-lg object-cover"
								/>
							)}
							<div>
								<h3 className="font-medium text-gray-900">{donation.cause.title}</h3>
								<p className="text-sm text-gray-600">
									Donor: {donation.donor?.name || "Anonymous"}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="font-semibold text-gray-900">
								${donation.amount.toLocaleString()}
							</p>
							<p className="text-sm text-gray-600">
								<span className="flex items-center">
									<FaCalendarAlt className="h-4 w-4 text-gray-400 mr-2" />
									{new Date(donation.date).toLocaleDateString()}
								</span>
							</p>
						</div>
					</div>
				))}
			</div>
		</div>

		{/* Analytics Section */}
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div className="bg-white rounded-xl shadow-md p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Donations</h2>
				<div className="space-y-4">
					{analytics.monthlyDonations.map((item) => (
						<div key={item.month} className="flex items-center justify-between">
							<span className="text-gray-600">{item.month}</span>
							<span className="font-semibold">${item.amount.toLocaleString()}</span>
						</div>
					))}
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-md p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
				<div className="space-y-4">
					{analytics.categoryDistribution.map((item) => (
						<div key={item.category} className="flex items-center justify-between">
							<span className="text-gray-600">{item.category}</span>
							<span className="font-semibold">${item.amount.toLocaleString()}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	</div>
);
