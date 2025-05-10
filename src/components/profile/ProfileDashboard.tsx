import React from "react";
import {
	FiUser,
	FiSettings,
	FiHeart,
	FiCreditCard,
	FiBell,
} from "react-icons/fi";
import { motion } from "framer-motion";

interface ProfileStats {
	totalDonations: number;
	activeCauses: number;
	impactScore: number;
}

const ProfileDashboard: React.FC = () => {
	// Mock data - replace with actual data from your backend
	const userProfile = {
		name: "John Doe",
		email: "john.doe@example.com",
		avatar: "/default-avatar.png",
		joinDate: "January 2024",
		stats: {
			totalDonations: 1250,
			activeCauses: 3,
			impactScore: 85,
		},
	};

	const recentDonations = [
		{ id: 1, cause: "Education Fund", amount: 500, date: "2024-03-15" },
		{ id: 2, cause: "Disaster Relief", amount: 300, date: "2024-03-10" },
		{ id: 3, cause: "Medical Aid", amount: 450, date: "2024-03-05" },
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header Section */}
			<div className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900">
							Profile Dashboard
						</h1>
						<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
							Edit Profile
						</button>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Profile Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="lg:col-span-1"
					>
						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex flex-col items-center">
								<div className="relative">
									<img
										src={userProfile.avatar}
										alt={userProfile.name}
										className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
									/>
									<div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
										<FiUser className="text-white" />
									</div>
								</div>
								<h2 className="mt-4 text-xl font-semibold text-gray-900">
									{userProfile.name}
								</h2>
								<p className="text-gray-500">{userProfile.email}</p>
								<p className="text-sm text-gray-400 mt-1">
									Member since {userProfile.joinDate}
								</p>
							</div>

							<div className="mt-6 space-y-4">
								<button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
									<FiSettings className="mr-2" />
									Account Settings
								</button>
								<button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
									<FiBell className="mr-2" />
									Notification Preferences
								</button>
							</div>
						</div>
					</motion.div>

					{/* Stats and Recent Activity */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="lg:col-span-2 space-y-8"
					>
						{/* Stats Grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-white rounded-xl shadow-sm p-6">
								<div className="flex items-center">
									<div className="p-3 rounded-full bg-blue-100">
										<FiHeart className="text-blue-600" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-500">
											Total Donations
										</p>
										<p className="text-2xl font-semibold text-gray-900">
											${userProfile.stats.totalDonations}
										</p>
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-sm p-6">
								<div className="flex items-center">
									<div className="p-3 rounded-full bg-green-100">
										<FiCreditCard className="text-green-600" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-500">
											Active Causes
										</p>
										<p className="text-2xl font-semibold text-gray-900">
											{userProfile.stats.activeCauses}
										</p>
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-sm p-6">
								<div className="flex items-center">
									<div className="p-3 rounded-full bg-purple-100">
										<FiUser className="text-purple-600" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-500">
											Impact Score
										</p>
										<p className="text-2xl font-semibold text-gray-900">
											{userProfile.stats.impactScore}%
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Recent Donations */}
						<div className="bg-white rounded-xl shadow-sm">
							<div className="p-6 border-b border-gray-200">
								<h3 className="text-lg font-semibold text-gray-900">
									Recent Donations
								</h3>
							</div>
							<div className="divide-y divide-gray-200">
								{recentDonations.map((donation) => (
									<div key={donation.id} className="p-6">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-gray-900">
													{donation.cause}
												</p>
												<p className="text-sm text-gray-500">{donation.date}</p>
											</div>
											<p className="text-sm font-semibold text-green-600">
												${donation.amount}
											</p>
										</div>
									</div>
								))}
							</div>
							<div className="p-6 border-t border-gray-200">
								<button className="w-full text-blue-600 hover:text-blue-700 font-medium">
									View All Donations
								</button>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default ProfileDashboard;
