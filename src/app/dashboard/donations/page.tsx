"use client";

import {
	useGetDonorDonationsQuery,
	useGetDonorStatsQuery,
} from "@/store/api/donationApi";
import { Donation, DonationStats } from "@/types/donation";
import Link from "next/link";
import { useState } from "react";
import {
	FaBoxOpen,
	FaCalendarAlt,
	FaChartLine,
	FaHandHoldingHeart,
	FaHeart,
} from "react-icons/fa";
import { StatusReceiptDisplay } from "@/components/ui/ReceiptDownload";

export default function DonationsPage() {
	const [activeTab, setActiveTab] = useState<"all" | "approved" | "pending">(
		"all"
	);
	const [page, setPage] = useState(1);
	const limit = 10;

	const {
		data: statsData,
		isLoading: isStatsLoading,
		isError: isStatsError,
	} = useGetDonorStatsQuery();
	const {
		data: donationsData,
		isLoading: isDonationsLoading,
		isError: isDonationsError,
	} = useGetDonorDonationsQuery({
		status:
			activeTab === "all"
				? undefined
				: activeTab === "approved"
				? "APPROVED"
				: "PENDING",
		page,
		limit,
	});
	console.log("donationsData", donationsData);

	if (isStatsLoading || isDonationsLoading) {
		return <p className="text-gray-700 text-center py-10">Loading...</p>;
	}

	if (
		isStatsError ||
		!statsData?.success ||
		isDonationsError ||
		!donationsData?.success
	) {
		return (
			<p className="text-red-600 text-center py-10">
				Failed to load donation data
			</p>
		);
	}

	const stats = statsData.data as DonationStats;
	const donations = donationsData.data as Donation[];
	const pagination = donationsData.pagination;

	const DonationCard = ({ donation }: { donation: Donation }) => (
		<div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
			<div className="flex justify-between items-start mb-4">
				<div>
					<h3 className="text-lg font-semibold text-gray-900">
						{donation.cause.title}
					</h3>
					<p className="text-sm text-gray-600">
						<span className="flex items-center mt-1">
							<FaCalendarAlt className="h-4 w-4 text-gray-400 mr-2" />
							{new Date(donation.createdAt).toLocaleDateString()}
						</span>
					</p>
					<p className="text-sm text-gray-600 mt-1">
						Organization: {donation.organization.name}
					</p>
				</div>
				<div className="flex flex-col items-end gap-2">
					<span
						className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
							donation.status === "CONFIRMED"
								? "bg-green-100 text-green-800"
								: donation.status === "PENDING"
								? "bg-yellow-100 text-yellow-800"
								: donation.status === "RECEIVED"
								? "bg-blue-100 text-blue-800"
								: donation.status === "APPROVED"
								? "bg-purple-100 text-purple-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{donation.status.charAt(0).toUpperCase() +
							donation.status.slice(1).toLowerCase()}
					</span>

					<Link
						href={`/dashboard/donations/status/${donation._id}`}
						className="text-sm text-primary hover:text-primary-dark"
					>
						View Details
					</Link>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4 mb-4">
				<div>
					<p className="text-sm text-gray-600">
						{donation.type === "MONEY" ? "Amount" : "Type"}
					</p>
					<p className="text-lg font-semibold text-gray-900">
						{donation.type === "MONEY"
							? `₹${donation.amount?.toLocaleString()}`
							: donation.type}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600">Impact</p>
					<p className="text-sm text-gray-900">{donation.description}</p>
				</div>
			</div>

			<StatusReceiptDisplay donation={donation} />
		</div>
	);

	return (
		<div className="max-w-7xl mx-auto">
			<div className="mt-12 space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
					<p className="text-gray-600">Track your donations and their impact</p>
				</div>

				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Total Donated
								</p>
								<p className="text-2xl font-bold text-gray-900">
									₹{stats.monetary?.totalDonated?.toLocaleString() || "0"}
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
								<p className="text-sm font-medium text-gray-600">
									Total Impact
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.totalCauses || 0} cause
									{(stats.totalCauses || 0) !== 1 && "s"}
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
								<p className="text-sm font-medium text-gray-600">
									Average Donation
								</p>
								<p className="text-2xl font-bold text-gray-900">
									₹
									{Math.round(
										stats.monetary?.averageDonation || 0
									).toLocaleString()}
								</p>
							</div>
							<div className="bg-blue-100 p-3 rounded-full">
								<FaChartLine className="h-6 w-6 text-blue-600" />
							</div>
						</div>
					</div>
				</div>

				{/* Item Donations Overview */}
				{stats.items && stats.items.totalDonations > 0 && (
					<div className="mt-8">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold text-gray-900">
								Item Donations
							</h2>
							<Link
								href="/dashboard/donations/items"
								className="text-teal-600 hover:text-teal-700 text-sm font-medium"
							>
								View Detailed Analytics →
							</Link>
						</div>
						<div className="bg-white rounded-xl shadow-md p-6">
							<div className="mb-4">
								<p className="text-sm font-medium text-gray-600">
									Total Item Donations
								</p>
								<p className="text-xl font-bold text-gray-900">
									{stats.items.totalDonations} item
									{stats.items.totalDonations !== 1 && "s"}
								</p>
							</div>

							{stats.items.byType && stats.items.byType.length > 0 && (
								<div className="mt-4">
									<p className="text-sm font-medium text-gray-600 mb-2">
										Donations by Type
									</p>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{stats.items.byType.map((item, index) => (
											<Link
												href={`/dashboard/donations/items/${item.type}`}
												key={index}
												className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
											>
												<p className="text-sm font-medium text-gray-800">
													{item.type}
												</p>
												<div className="flex justify-between mt-1">
													<p className="text-sm text-gray-600">
														{item.count} donation{item.count !== 1 && "s"}
													</p>
													<p className="text-sm text-gray-600">
														{item.totalQuantity} item
														{item.totalQuantity !== 1 && "s"}
													</p>
												</div>
											</Link>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Filter Tabs */}
				<div className="border-b border-gray-200">
					<nav className="flex flex-wrap space-x-4 md:space-x-8">
						<button
							onClick={() => setActiveTab("all")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "all"
									? "border-teal-600 text-teal-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							All Donations
						</button>
						<button
							onClick={() => setActiveTab("approved")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "approved"
									? "border-teal-600 text-teal-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							Approved
						</button>
						<button
							onClick={() => setActiveTab("pending")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "pending"
									? "border-teal-600 text-teal-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							Pending
						</button>
						{stats.items && stats.items.totalDonations > 0 && (
							<Link
								href="/dashboard/donations/items"
								className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-teal-600 hover:border-teal-600 flex items-center"
							>
								<FaBoxOpen className="mr-2" /> Item Analytics
							</Link>
						)}
					</nav>
				</div>

				{/* Donations List */}
				<div className="grid gap-6 md:grid-cols-2">
					{donations && donations.length > 0 ? (
						donations.map((donation: Donation) => (
							<DonationCard key={donation._id} donation={donation} />
						))
					) : (
						<p className="text-gray-600 text-center col-span-2">
							No donations found.
						</p>
					)}
				</div>

				{/* Pagination */}
				{pagination && pagination.pages > 1 && (
					<div className="flex justify-center space-x-2 mt-6">
						<button
							onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
							disabled={page === 1}
							className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
						>
							Previous
						</button>
						<span className="px-4 py-2">
							Page {page} of {pagination.pages}
						</span>
						<button
							onClick={() =>
								setPage((prev) => Math.min(prev + 1, pagination.pages))
							}
							disabled={page === pagination.pages}
							className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
						>
							Next
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
