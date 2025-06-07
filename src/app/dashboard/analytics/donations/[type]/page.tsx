"use client";

import { useGetItemDonationTypeAnalyticsQuery } from "@/store/api/donationApi";
import { DonationType } from "@/types/donation";
import { ItemDonationTypeAnalytics } from "@/types/itemDonation";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import {
	FaArrowLeft,
	FaBook,
	FaBoxOpen,
	FaBuilding,
	FaCalendarAlt,
	FaChartBar,
	FaCouch,
	FaHandHoldingHeart,
	FaHome,
	FaListAlt,
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
		case DonationType.TOYS:
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

// Format date
const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

export default function DonationTypeAnalyticsPage({
	params,
}: {
	params: Promise<{ type: string }>;
}) {
	const router = useRouter();
	const { type } = use(params);
	const decodedType = decodeURIComponent(type);

	const { data, isLoading, isError } =
		useGetItemDonationTypeAnalyticsQuery(decodedType);

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
				<p className="text-red-600">
					Failed to load donation analytics for {decodedType}
				</p>
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
	const analytics: ItemDonationTypeAnalytics =
		(data.data as ItemDonationTypeAnalytics) || {
			type: decodedType as DonationType,
			stats: { totalDonations: 0, totalQuantity: 0, avgQuantity: 0 },
			recentDonations: [],
			monthlyTrend: [],
			topCauses: [],
		};

	const {
		stats = { totalDonations: 0, totalQuantity: 0, avgQuantity: 0 },
		recentDonations = [],
		monthlyTrend = [],
		topCauses = [],
	} = analytics;

	return (
		<div className="max-w-7xl mx-auto">
			<div className="mt-8 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<Link
							href="/dashboard/analytics/donations"
							className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-2"
						>
							<FaArrowLeft className="mr-2" /> Back to Donation Analytics
						</Link>
						<div className="flex items-center">
							<div
								className={`p-3 rounded-full mr-3 ${getDonationTypeColor(
									decodedType
								)}`}
							>
								{getDonationTypeIcon(decodedType)}
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									{decodedType} Donations
								</h1>
								<p className="text-gray-600">
									Detailed analytics for your {decodedType.toLowerCase()}{" "}
									donations
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Total Donations
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.totalDonations}
								</p>
							</div>
							<div
								className={`p-3 rounded-full ${getDonationTypeColor(
									decodedType
								)}`}
							>
								{getDonationTypeIcon(decodedType)}
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Total Quantity
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.totalQuantity} item{stats.totalQuantity !== 1 && "s"}
								</p>
							</div>
							<div className="bg-purple-100 p-3 rounded-full">
								<FaBoxOpen className="h-6 w-6 text-purple-600" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Average Quantity
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.avgQuantity} per donation
								</p>
							</div>
							<div className="bg-blue-100 p-3 rounded-full">
								<FaChartBar className="h-6 w-6 text-blue-600" />
							</div>
						</div>
					</div>
				</div>

				{/* No Data Message */}
				{stats.totalDonations === 0 && (
					<div className="bg-white rounded-xl shadow-md p-8 text-center mt-6">
						<div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<div
								className={`p-3 rounded-full ${getDonationTypeColor(
									decodedType
								)}`}
							>
								{getDonationTypeIcon(decodedType)}
							</div>
						</div>
						<h3 className="text-lg font-medium text-gray-900">
							No {decodedType.toLowerCase()} donations yet
						</h3>
						<p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
							You haven&apos;t made any {decodedType.toLowerCase()} donations
							yet. When you donate {decodedType.toLowerCase()}, your donation
							history and impact will appear here.
						</p>
						<Link
							href="/dashboard/donations"
							className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
						>
							Return to Donations
						</Link>
					</div>
				)}

				{/* Monthly Trends */}
				{monthlyTrend && monthlyTrend.length > 0 && (
					<div className="bg-white rounded-xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
							<FaChartBar className="mr-2 text-teal-600" /> Monthly Trends
						</h2>

						<div className="overflow-x-auto">
							<div className="min-w-[600px]">
								<div className="h-64 flex items-end space-x-2">
									{monthlyTrend.map((month, index) => {
										// Find the max count to normalize bar heights
										const maxCount = Math.max(
											...monthlyTrend.map((m) => m.count)
										);
										const height =
											maxCount > 0 ? (month.count / maxCount) * 100 : 0;

										return (
											<div
												key={index}
												className="flex flex-col items-center flex-1"
											>
												<div
													className={`w-full rounded-t-md ${getDonationTypeColor(
														decodedType
													)
														.split(" ")[0]
														.replace("bg-", "bg-")
														.replace("100", "500")}`}
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

				{/* Recent Donations */}
				{stats.totalDonations > 0 && (
					<div className="bg-white rounded-xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
							<FaListAlt className="mr-2 text-teal-600" /> Recent Donations
						</h2>

						{recentDonations && recentDonations.length > 0 ? (
							<div className="space-y-4">
								{recentDonations.map((donation, index) => (
									<div
										key={index}
										className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
									>
										<div className="flex justify-between items-start">
											<div>
												<div className="flex items-center">
													<FaCalendarAlt className="text-gray-400 mr-2" />
													<span className="text-sm text-gray-600">
														{formatDate(donation.createdAt)}
													</span>
												</div>
												<h3 className="font-medium text-gray-900 mt-1">
													{donation.description}
												</h3>
												<p className="text-sm text-gray-600">
													{donation.quantity} {donation.unit || "item"}
													{donation.quantity !== 1 && "s"}
												</p>
												{donation.cause && (
													<div className="flex items-center mt-1">
														<FaHandHoldingHeart className="text-gray-400 mr-2" />
														<span className="text-sm text-gray-600">
															{donation.cause.title}
														</span>
													</div>
												)}
											</div>
											{donation.organization && (
												<div className="flex items-center">
													<FaBuilding className="text-gray-400 mr-2" />
													<span className="text-sm text-gray-600">
														{donation.organization.name}
													</span>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-6">
								<p className="text-gray-600">No recent donations to display.</p>
							</div>
						)}
					</div>
				)}

				{/* Top Causes */}
				{topCauses && topCauses.length > 0 && (
					<div className="bg-white rounded-xl shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
							<FaHandHoldingHeart className="mr-2 text-teal-600" /> Top Causes
						</h2>

						<div className="space-y-4">
							{topCauses.map((cause, index) => (
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
