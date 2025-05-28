"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	useGetDonationByIdQuery,
	useUpdateDonationStatusMutation,
} from "@/store/api/donationApi";
import { DonationStatus } from "@/types/donation";
import { toast } from "react-hot-toast";

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
		} catch (error: unknown) {
			const errorResponse = error as { data?: { message?: string } };
			toast.error(errorResponse?.data?.message || "Failed to update status");
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
								<p className="text-gray-600">{donation.status}</p>
							</div>
							<div>
								<h3 className="font-semibold text-gray-700">Donor</h3>
								<p className="text-gray-600">{donation.donor.name}</p>
							</div>
							<div>
								<h3 className="font-semibold text-gray-700">Type</h3>
								<p className="text-gray-600">{donation.type}</p>
							</div>
						</div>

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
