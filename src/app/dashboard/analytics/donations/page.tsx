"use client";

import { useGetItemDonationAnalyticsQuery } from "@/store/api/donationApi";
import { DonationType } from "@/types/donation";
import {
	ItemDonationAnalytics,
	ItemDonationTypeStats,
	MonthlyTrend,
	TopCause,
} from "@/types/itemDonation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	FaArrowLeft,
	FaBook,
	FaBoxOpen,
	FaChartBar,
	FaChartPie,
	FaCouch,
	FaHandHoldingHeart,
	FaHome,
	FaQuestion,
	FaTshirt,
	FaUtensils,
} from "react-icons/fa";
import { GiBlood } from "react-icons/gi";

// Helper function to get icon for donation type
const getDonationTypeIcon = (type: string) => {
	switch (type) {
		case DonationType.CLOTHES:
			return <FaTshirt className="h-5 w-5" />;
		case DonationType.FOOD:
			return <FaUtensils className="h-5 w-5" />;
		case DonationType.BLOOD:
			return <GiBlood className="h-5 w-5" />;
		case DonationType.BOOKS:
			return <FaBook className="h-5 w-5" />;
		case DonationType.FURNITURE:
			return <FaCouch className="h-5 w-5" />;
		case DonationType.HOUSEHOLD:
			return <FaHome className="h-5 w-5" />;
		case DonationType.OTHER:
			return <FaQuestion className="h-5 w-5" />;
		default:
			return <FaBoxOpen className="h-5 w-5" />;
	}
};

// Helper function to get color for donation type
const getDonationTypeColor = (type: string) => {
	switch (type) {
		case DonationType.CLOTHES:
			return "bg-blue-100 text-blue-600";
		case DonationType.FOOD:
			return "bg-green-100 text-green-600";
		case DonationType.BLOOD:
			return "bg-red-100 text-red-600";
		case DonationType.BOOKS:
			return "bg-yellow-100 text-yellow-600";
		case DonationType.FURNITURE:
			return "bg-purple-100 text-purple-600";
		case DonationType.HOUSEHOLD:
			return "bg-teal-100 text-teal-600";
		case DonationType.OTHER:
			return "bg-gray-100 text-gray-600";
		default:
			return "bg-indigo-100 text-indigo-600";
	}
};

// Format month name
const getMonthName = (month: number) => {
	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	return monthNames[month - 1];
};

export default function DonationAnalyticsPage() {
	const router = useRouter();
	const { data, isLoading, isError } = useGetItemDonationAnalyticsQuery();

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
			</div>
		);
	}

	if (isError || !data?.success) {
		return (
			<div className="text-center py-10">
				<p className="text-red-600">Failed to load donation analytics</p>
				<button
					onClick={() => router.back()}
					className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
				>
					Go Back
				</button>
			</div>
		);
	}

	// Ensure we have valid data or provide defaults
	const defaultAnalytics: ItemDonationAnalytics = {
		donationsByType: [],
		monthlyTrend: [],
		topCauses: [],
	};
	const analytics: ItemDonationAnalytics =
		(data?.data as ItemDonationAnalytics) || defaultAnalytics;

	const { donationsByType = [], monthlyTrend = [], topCauses = [] } = analytics;

	console.log("Donation analytics:", {
		donationsByType,
		monthlyTrend,
		topCauses,
	});

	return (
		<div className="max-w-7xl mx-auto">
			<div className="mt-8 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<Link
							href="/dashboard/analytics"
							className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-2"
						>
							<FaArrowLeft className="mr-2" /> Back to Analytics
						</Link>
						<h1 className="text-2xl font-bold text-gray-900">
							Donation Analytics
						</h1>
						<p className="text-gray-600">
							Track your donation history and their impact
						</p>
					</div>
				</div>

				{/* Donation Types Overview */}
				<div className="bg-white rounded-xl shadow-md p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
						<FaChartPie className="mr-2 text-teal-600" /> Donation Types
					</h2>

					{donationsByType && donationsByType.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{donationsByType.map(
								(type: ItemDonationTypeStats, index: number) => (
									<Link
										href={`/dashboard/analytics/donations/${type.type}`}
										key={index}
										className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
									>
										<div className="flex items-center">
											<div
												className={`p-3 rounded-full mr-3 ${getDonationTypeColor(
													type.type
												)}`}
											>
												{getDonationTypeIcon(type.type)}
											</div>
											<div>
												<h3 className="font-medium text-gray-900">
													{type.type}
												</h3>
												<p className="text-sm text-gray-600">
													{type.count} donation{type.count !== 1 && "s"} (
													{type.totalQuantity} item
													{type.totalQuantity !== 1 && "s"})
												</p>
											</div>
										</div>
									</Link>
								)
							)}
						</div>
					) : (
						<div className="text-center py-8">
							<div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<FaBoxOpen className="h-8 w-8 text-gray-400" />
							</div>
							<h3 className="text-lg font-medium text-gray-900">
								No donations yet
							</h3>
							<p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
								You haven&apos;t made any donations yet. When you donate items
								like clothes, books, or food, they&apos;ll appear here.
							</p>
						</div>
					)}
				</div>

				{/* Monthly Trends */}
				{monthlyTrend && monthlyTrend.length > 0 && (
					<div className="bg-white rounded-xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
							<FaChartBar className="mr-2 text-teal-600" /> Monthly Trends
						</h2>

						<div className="overflow-x-auto">
							<div className="min-w-[600px]">
								<div className="h-64 flex items-end space-x-2">
									{monthlyTrend.map((month: MonthlyTrend, index: number) => {
										// Find the max count to normalize bar heights
										const maxCount = Math.max(
											...monthlyTrend.map((m: MonthlyTrend) => m.count)
										);
										const height =
											maxCount > 0 ? (month.count / maxCount) * 100 : 0;

										return (
											<div
												key={index}
												className="flex flex-col items-center flex-1"
											>
												<div
													className="w-full bg-teal-500 rounded-t-md"
													style={{ height: `${Math.max(height, 5)}%` }}
												>
													<div className="h-full w-full flex items-center justify-center text-white text-xs font-medium">
														{month.count > 0 && month.count}
													</div>
												</div>
												<div className="text-xs text-gray-600 mt-1">
													{getMonthName(month.month)} {month.year}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Top Causes */}
				{topCauses && topCauses.length > 0 && (
					<div className="bg-white rounded-xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
							<FaHandHoldingHeart className="mr-2 text-teal-600" /> Top Causes
							Receiving Donations
						</h2>

						<div className="space-y-4">
							{topCauses.map((cause: TopCause, index: number) => (
								<div
									key={index}
									className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
								>
									<div className="flex justify-between items-start">
										<div>
											<h3 className="font-medium text-gray-900">
												{cause.causeName}
											</h3>
											<p className="text-sm text-gray-600">
												{cause.count} donation{cause.count !== 1 && "s"} (
												{cause.totalQuantity} item
												{cause.totalQuantity !== 1 && "s"})
											</p>
										</div>
										<div className="flex space-x-1">
											{cause.types.map((type: DonationType, idx: number) => (
												<div
													key={idx}
													className={`p-2 rounded-full ${getDonationTypeColor(
														type
													)}`}
													title={type}
												>
													{getDonationTypeIcon(type)}
												</div>
											))}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
