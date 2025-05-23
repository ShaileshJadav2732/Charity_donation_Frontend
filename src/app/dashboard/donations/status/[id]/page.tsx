"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	useGetDonationByIdQuery,
	useUpdateDonationStatusMutation,
} from "@/store/api/donationApi";
import { DonationStatus } from "@/types/donation";
import { toast } from "react-hot-toast";
import { getReceiptImageUrl } from "@/utils/url";
import { FaDownload, FaImage } from "react-icons/fa";
import { ReceiptStatusIndicator } from "@/components/ui/ReceiptNotification";

const StatusUpdatePage = () => {
	const params = useParams();
	const router = useRouter();
	const donationId = params.id as string;

	const [selectedStatus, setSelectedStatus] = useState<DonationStatus>(
		DonationStatus.PENDING
	);

	const {
		data: donation,
		isLoading,
		error,
	} = useGetDonationByIdQuery(donationId);
	const [updateStatus, { isLoading: isUpdating }] =
		useUpdateDonationStatusMutation();

	useEffect(() => {
		if (donation) {
			setSelectedStatus(donation.status as DonationStatus);
		}
	}, [donation]);

	const handleStatusUpdate = async () => {
		try {
			await updateStatus({
				donationId,
				status: selectedStatus,
			}).unwrap();

			toast.success("Donation status updated successfully");
			router.push("/dashboard/donations"); // Redirect back to donations list
		} catch (error: any) {
			toast.error(error?.data?.message || "Failed to update status");
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-red-500">Error loading donation details</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
				<h1 className="text-2xl font-bold mb-6">Update Donation Status</h1>

				{donation && (
					<div className="space-y-6">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<h3 className="font-semibold text-gray-700">Donation ID</h3>
								<p className="text-gray-600">{donation._id}</p>
							</div>
							<div>
								<h3 className="font-semibold text-gray-700">Current Status</h3>
								<div className="flex items-center space-x-2">
									<p className="text-gray-600">{donation.status}</p>
									<ReceiptStatusIndicator
										hasPhoto={!!donation.receiptImage}
										hasPdfReceipt={!!donation.pdfReceiptUrl}
										status={donation.status}
									/>
								</div>
							</div>
							<div>
								<h3 className="font-semibold text-gray-700">Donor</h3>
								<p className="text-gray-600">{donation.donor.name}</p>
							</div>
							<div>
								<h3 className="font-semibold text-gray-700">Type</h3>
								<p className="text-gray-600">{donation.type}</p>
							</div>
							{donation.amount && (
								<div>
									<h3 className="font-semibold text-gray-700">Amount</h3>
									<p className="text-gray-600">${donation.amount.toFixed(2)}</p>
								</div>
							)}
							{donation.quantity && (
								<div>
									<h3 className="font-semibold text-gray-700">Quantity</h3>
									<p className="text-gray-600">
										{donation.quantity} {donation.unit}
									</p>
								</div>
							)}
						</div>

						{/* Receipt Section */}
						{(donation.status === "RECEIVED" ||
							donation.status === "CONFIRMED") &&
							(donation.receiptImage || donation.pdfReceiptUrl) && (
								<div className="mt-6 p-4 bg-gray-50 rounded-lg">
									<h3 className="font-semibold text-gray-700 mb-3">
										Available Receipts
									</h3>
									<div className="flex flex-wrap gap-3">
										{donation.receiptImage && (
											<a
												href={getReceiptImageUrl(donation.receiptImage)}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
											>
												<FaImage className="h-4 w-4 mr-2" />
												View Photo
											</a>
										)}
										{donation.pdfReceiptUrl && (
											<a
												href={getReceiptImageUrl(donation.pdfReceiptUrl)}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
											>
												<FaDownload className="h-4 w-4 mr-2" />
												Download PDF Receipt
											</a>
										)}
									</div>
									{donation.status === "RECEIVED" && (
										<p className="text-sm text-gray-600 mt-2">
											📄 PDF receipt was automatically generated when your
											donation was received.
										</p>
									)}
								</div>
							)}

						<div className="mt-6">
							<label
								htmlFor="status"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								New Status
							</label>
							<select
								id="status"
								value={selectedStatus}
								onChange={(e) =>
									setSelectedStatus(e.target.value as DonationStatus)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
							>
								{Object.values(DonationStatus).map((status) => (
									<option key={status} value={status}>
										{status}
									</option>
								))}
							</select>
						</div>

						<div className="flex justify-end space-x-4 mt-6">
							<button
								onClick={() => router.back()}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleStatusUpdate}
								disabled={isUpdating || selectedStatus === donation.status}
								className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isUpdating ? "Updating..." : "Update Status"}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default StatusUpdatePage;
