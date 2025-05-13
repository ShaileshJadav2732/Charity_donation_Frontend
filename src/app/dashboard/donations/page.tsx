"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetDonationsQuery, useCancelDonationMutation } from "@/store/api/donationApi";
import { DonationStatus } from "@/types/donation";
import { FaDownload, FaTimes, FaCheck, FaSpinner } from "react-icons/fa";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { toast } from "react-hot-toast";

export default function DonationsPage() {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<DonationStatus | "">("");
	const { isAuthorized } = useRouteGuard({ allowedRoles: ["donor"], redirectTo: "/dashboard" });

	const { data: donationsData, isLoading } = useGetDonationsQuery({
		page,
		limit: 10,
		status: statusFilter || undefined
	});
	const [cancelDonation] = useCancelDonationMutation();

	const handleCancelDonation = async (id: string) => {
		try {
			await cancelDonation(id).unwrap();
			toast.success("Donation cancelled successfully");
		} catch (error) {
			toast.error("Failed to cancel donation");
			console.error("Cancel donation error:", error);
		}
	};

	if (!isAuthorized) return null;

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
					<p className="mt-1 text-sm text-gray-500">Track and manage your donations</p>
				</div>
				<button
					onClick={() => router.push("/dashboard/donations/new")}
					className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
				>
					Make New Donation
				</button>
			</div>

			{/* Filters */}
			<div className="mb-6">
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value as DonationStatus | "")}
					className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
				>
					<option value="">All Status</option>
					{Object.values(DonationStatus).map((status) => (
						<option key={status} value={status}>
							{status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
						</option>
					))}
				</select>
			</div>

			{/* Donations List */}
			{isLoading ? (
				<div className="flex justify-center items-center h-64">
					<FaSpinner className="animate-spin h-8 w-8 text-teal-600" />
				</div>
			) : donationsData?.data.donations.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500">No donations found</p>
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{donationsData?.data.donations.map((donation) => (
						<div
							key={donation.id}
							className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
						>
							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										{donation.type === "MONEY"
											? `$${donation.amount?.toFixed(2)}`
											: `${donation.quantity} ${donation.unit}`}
									</h3>
									<p className="text-sm text-gray-500">{donation.organization.name}</p>
								</div>
								<span className={`px-2 py-1 text-xs font-medium rounded-full ${donation.status === DonationStatus.CONFIRMED
									? "bg-green-100 text-green-800"
									: donation.status === DonationStatus.PENDING
										? "bg-yellow-100 text-yellow-800"
										: donation.status === DonationStatus.CANCELLED
											? "bg-red-100 text-red-800"
											: "bg-gray-100 text-gray-800"
									}`}>
									{donation.status.replace(/_/g, " ")}
								</span>
							</div>

							<p className="text-gray-600 mb-4">{donation.description}</p>

							<div className="text-sm text-gray-500 mb-4">
								<p>Created: {new Date(donation.createdAt).toLocaleDateString()}</p>
								{donation.status === DonationStatus.CONFIRMED && (
									<p>Confirmed: {new Date(donation.updatedAt).toLocaleDateString()}</p>
								)}
							</div>

							<div className="flex justify-end space-x-2">
								{donation.status === DonationStatus.PENDING && (
									<button
										onClick={() => handleCancelDonation(donation.id)}
										className="text-red-600 hover:text-red-700"
										title="Cancel Donation"
									>
										<FaTimes className="h-5 w-5" />
									</button>
								)}
								{donation.status === DonationStatus.CONFIRMED && (
									<button
										onClick={() => window.open(donation.receiptImage, "_blank")}
										className="text-teal-600 hover:text-teal-700"
										title="Download Receipt"
									>
										<FaDownload className="h-5 w-5" />
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Pagination */}
			{donationsData && donationsData.data.totalPages > 1 && (
				<div className="mt-8 flex justify-center">
					<nav className="flex items-center space-x-2">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
						>
							Previous
						</button>
						<span className="text-sm text-gray-700">
							Page {page} of {donationsData.data.totalPages}
						</span>
						<button
							onClick={() => setPage((p) => Math.min(donationsData.data.totalPages, p + 1))}
							disabled={page === donationsData.data.totalPages}
							className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
						>
							Next
						</button>
					</nav>
				</div>
			)}
		</div>
	);
}
