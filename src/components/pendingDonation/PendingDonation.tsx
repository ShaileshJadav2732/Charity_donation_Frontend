"use client";
import {
	useGetOrganizationDonationsQuery,
	useMarkDonationAsReceivedMutation,
	useMarkDonationAsConfirmedMutation,
	useUpdateDonationStatusMutation,
} from "@/store/api/donationApi";
import { Donation, organizationDonation } from "@/types/donation";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import Image from "next/image";
import React, { useRef, useState } from "react";
import {
	FiChevronLeft,
	FiChevronRight,
	FiEye,
	FiRefreshCw,
	FiSearch,
	FiCamera,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

interface OrganizationDonationsProps {
	organizationId: string;
}

const OrganizationDonations: React.FC<OrganizationDonationsProps> = ({
	organizationId,
}) => {
	const [status, setStatus] = useState<string>("PENDING");
	const [page, setPage] = useState<number>(1);
	const [limit] = useState<number>(10);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [showDonationModal, setShowDonationModal] = useState(false);
	const [selectedDonation, setSelectedDonation] =
		useState<organizationDonation | null>(null);

	// Loading states for individual actions
	const [loadingStates] = useState<Record<string, boolean>>({});

	const { data, isLoading, isFetching, isError, refetch } =
		useGetOrganizationDonationsQuery({
			organizationId,
			params: {
				status,
				page,
				limit,
			},
		});

	const [markAsReceived] = useMarkDonationAsReceivedMutation();
	const [markAsConfirmed] = useMarkDonationAsConfirmedMutation();
	const [updateDonationStatus] = useUpdateDonationStatusMutation();

	const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
	const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
	const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
	const [isMarkingReceived, setIsMarkingReceived] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Receipt upload states
	const [showReceiptUploadModal, setShowReceiptUploadModal] = useState(false);
	const [isMarkingConfirmed, setIsMarkingConfirmed] = useState(false);

	// Helper function to check if donation is loading
	const isDonationLoading = (donationId: string) => {
		return loadingStates[donationId] || false;
	};

	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setStatus(e.target.value);
		setPage(1);
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	// Handle donation approval
	const handleApproveDonation = async (donationId: string) => {
		const loadingToast = toast.loading("Approving donation...");

		try {
			await updateDonationStatus({
				donationId,
				status: "APPROVED",
			}).unwrap();

			toast.dismiss(loadingToast);
			toast.success("Donation approved successfully!");

			// Refetch to update the UI
			await refetch();
		} catch (error: unknown) {
			toast.dismiss(loadingToast);

			let errorMessage = "Failed to approve donation";
			if (error && typeof error === "object") {
				if (
					"data" in error &&
					error.data &&
					typeof error.data === "object" &&
					"message" in error.data
				) {
					errorMessage = String(error.data.message);
				} else if ("message" in error) {
					errorMessage = String(error.message);
				}
			}

			toast.error(errorMessage);
		}
	};

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];

			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast.error("Please select an image file (JPEG, PNG, etc.)");
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("File size exceeds 5MB limit");
				return;
			}

			setSelectedPhoto(file);

			// Create a preview URL for the selected photo
			const reader = new FileReader();
			reader.onloadend = () => {
				setPhotoPreviewUrl(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleOpenPhotoUpload = (donationId: string) => {
		const foundDonation = data?.data.find((d) => d._id === donationId);
		setSelectedDonation(
			(foundDonation as unknown as organizationDonation) || null
		);
		setSelectedPhoto(null);
		setPhotoPreviewUrl(null);
		setShowPhotoUploadModal(true);
	};

	const handleMarkAsReceived = async () => {
		if (!selectedDonation || !selectedPhoto) {
			toast.error("Please select a photo to upload");
			return;
		}

		setIsMarkingReceived(true);
		// Show loading toast
		const loadingToast = toast.loading(
			"Uploading photo and updating donation status..."
		);

		try {
			// ✅ FIXED: Actually call the API to mark as received
			await markAsReceived({
				donationId: selectedDonation._id,
				photo: selectedPhoto,
			}).unwrap();

			// Dismiss loading toast and show success
			toast.dismiss(loadingToast);
			toast.success("Donation marked as received successfully");

			// Close modal and reset state
			setShowPhotoUploadModal(false);
			setSelectedPhoto(null);
			setPhotoPreviewUrl(null);
			setSelectedDonation(null);

			// Force refetch to update the UI
			await refetch();
		} catch (error: unknown) {
			// Dismiss loading toast
			toast.dismiss(loadingToast);

			// Extract error message using a simpler approach
			let errorMessage = "Unknown error occurred";

			if (error && typeof error === "object") {
				if (
					"data" in error &&
					error.data &&
					typeof error.data === "object" &&
					"message" in error.data
				) {
					errorMessage = String(error.data.message);
				} else if ("message" in error && typeof error.message === "string") {
					errorMessage = error.message;
				}
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			// Show error toast
			toast.error(`Error marking donation as received: ${errorMessage}`);
		} finally {
			setIsMarkingReceived(false);
		}
	};

	// Helper function to get status colors
	const getStatusColor = (status: string): string => {
		switch (status) {
			case "PENDING":
				return "bg-yellow-100 text-yellow-800";
			case "APPROVED":
				return "bg-blue-100 text-blue-800";
			case "RECEIVED":
				return "bg-green-100 text-green-800";
			case "CONFIRMED":
				return "bg-purple-100 text-purple-800";
			case "CANCELLED":
				return "bg-red-100 text-red-800"; // Fixed: was showing green
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// Receipt upload functions
	const handleOpenReceiptUpload = (donationId: string) => {
		const foundDonation = data?.data.find((d) => d._id === donationId);
		setSelectedDonation(
			(foundDonation as unknown as organizationDonation) || null
		);
		setShowReceiptUploadModal(true);
	};

	const handleMarkAsConfirmed = async () => {
		if (!selectedDonation) {
			toast.error("No donation selected");
			return;
		}

		setIsMarkingConfirmed(true);
		const loadingToast = toast.loading(
			"Marking donation as confirmed and generating PDF receipt..."
		);

		try {
			await markAsConfirmed({
				donationId: selectedDonation._id,
			}).unwrap();

			toast.dismiss(loadingToast);
			toast.success("Donation confirmed! PDF receipt auto-generated.");

			// Close modal and reset state
			setShowReceiptUploadModal(false);
			setSelectedDonation(null);

			// Force refetch to update the UI
			await refetch();
		} catch (error: unknown) {
			toast.dismiss(loadingToast);

			// Extract error message more safely
			let errorMessage = "Failed to mark donation as confirmed";
			if (error && typeof error === "object") {
				if (
					"data" in error &&
					error.data &&
					typeof error.data === "object" &&
					"message" in error.data
				) {
					errorMessage = String(error.data.message);
				} else if ("message" in error) {
					errorMessage = String(error.message);
				}
			}

			toast.error(errorMessage);
		} finally {
			setIsMarkingConfirmed(false);
		}
	};

	const filteredDonations = data?.data?.filter(
		(donation: Donation) =>
			donation.donor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			donation.description?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			{/* Header and Filters */}
			<div className="p-6 border-b border-gray-100">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">Donations</h2>
						<p className="text-sm text-gray-500 mt-1">
							Manage and track all donations to your organization
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative flex-grow max-w-md">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiSearch className="text-gray-400" />
							</div>
							<input
								type="text"
								placeholder="Search donations..."
								value={searchTerm}
								onChange={handleSearch}
								className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full transition-all"
							/>
						</div>
						<select
							value={status}
							onChange={handleStatusChange}
							className="block w-full sm:w-48 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
						>
							<option value="PENDING">Pending</option>
							<option value="APPROVED">Approved</option>
							<option value="RECEIVED">Received</option>
							<option value="CONFIRMED">Confirmed</option>
							<option value="CANCELLED">Cancelled</option>
							<option value="">All Status</option>
						</select>
						<button
							onClick={() => refetch()}
							className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
							disabled={isFetching}
						>
							<FiRefreshCw
								className={`mr-2 ${isFetching ? "animate-spin" : ""}`}
							/>
							Refresh
						</button>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			)}

			{/* Error State */}
			{isError && (
				<div className="p-8 text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
						<svg
							className="h-6 w-6 text-red-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h3 className="mt-3 text-lg font-medium text-gray-900">
						Failed to load donations
					</h3>
					<p className="mt-2 text-sm text-gray-500">
						There was an error loading the donations. Please try again.
					</p>
					<div className="mt-6">
						<button
							onClick={() => refetch()}
							className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
						>
							Try Again
						</button>
					</div>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !isError && filteredDonations?.length === 0 && (
				<div className="p-8 text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
						<svg
							className="h-6 w-6 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h3 className="mt-3 text-lg font-medium text-gray-900">
						No donations found
					</h3>
					<p className="mt-2 text-sm text-gray-500">
						{searchTerm
							? "No donations match your search criteria."
							: status === "PENDING"
							? "You don't have any pending donations."
							: status === "APPROVED"
							? "You don't have any approved donations."
							: status === "RECEIVED"
							? "You don't have any completed donations."
							: status === "CONFIRMED"
							? "You don't have any confirmed donations."
							: status === "CANCELLED"
							? "You don't have any cancelled donations."
							: "You haven't received any donations yet."}
					</p>
					{searchTerm && (
						<button
							onClick={() => setSearchTerm("")}
							className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
						>
							Clear search
						</button>
					)}
				</div>
			)}

			{/* Data Table */}
			{!isLoading &&
				!isError &&
				filteredDonations &&
				filteredDonations.length > 0 && (
					<div className="overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Donor
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Details
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Amount
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Status
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Date
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredDonations.map((donation: Donation) => (
										<tr
											key={donation._id}
											className="hover:bg-gray-50 transition-colors"
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
														<span className="text-gray-600 font-medium">
															{donation.donor?.name?.charAt(0).toUpperCase()}
														</span>
													</div>
													<div className="ml-4">
														<div className="text-sm font-medium text-gray-900">
															{donation.donor?.name || "Anonymous"}
														</div>
														<div className="text-sm text-gray-500">
															{donation.donor?.email || "No email provided"}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm font-medium text-gray-900 line-clamp-1">
													{donation.description || "No description"}
												</div>
												{donation.cause && (
													<div className="text-sm text-gray-500 mt-1">
														<span className="font-medium">Cause:</span>{" "}
														{donation.cause.title}
													</div>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-bold text-gray-900">
													{donation.type === "MONEY"
														? `₹${donation.amount?.toFixed(2) || "0.00"}`
														: `${donation.quantity || 0} ${
																donation.unit || ""
														  }`}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(
														donation.status
													)}`}
												>
													{donation.status}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{new Date(donation.createdAt).toLocaleDateString(
													"en-US",
													{
														year: "numeric",
														month: "short",
														day: "numeric",
													}
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
												<div className="flex justify-end space-x-3">
													<button
														className="text-blue-600 hover:text-blue-900 transition-colors"
														title="View Details"
														onClick={() => {
															setSelectedDonation(
																donation as unknown as organizationDonation
															);
															setShowDonationModal(true);
														}}
													>
														<FiEye className="h-5 w-5" />
													</button>
													{/* Approve button for PENDING donations */}
													{donation.status === "PENDING" && (
														<button
															className="text-green-600 hover:text-green-900 transition-colors"
															title="Approve Donation"
															onClick={() =>
																handleApproveDonation(donation._id)
															}
															disabled={isDonationLoading(donation._id)}
														>
															✅
														</button>
													)}
													{/* Mark as Received button for APPROVED donations */}
													{donation.status === "APPROVED" && (
														<button
															className="text-orange-600 hover:text-orange-900 transition-colors"
															title="Mark as Received with Photo"
															onClick={() =>
																handleOpenPhotoUpload(donation._id)
															}
															disabled={isDonationLoading(donation._id)}
														>
															<FiCamera className="h-5 w-5" />
														</button>
													)}
													{/* Mark as Confirmed button for RECEIVED donations */}
													{donation.status === "RECEIVED" && (
														<button
															className="text-purple-600 hover:text-purple-900 transition-colors"
															title="Mark as Confirmed with Receipt"
															onClick={() =>
																handleOpenReceiptUpload(donation._id)
															}
															disabled={isDonationLoading(donation._id)}
														>
															📄
														</button>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

			{/* Donation Details Modal */}
			{showDonationModal && selectedDonation && (
				<Dialog
					open={showDonationModal}
					onClose={() => {
						setShowDonationModal(false);
						setSelectedDonation(null);
					}}
					maxWidth="sm"
					fullWidth
					sx={{
						"& .MuiDialog-paper": {
							borderRadius: "12px",
							boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
						},
					}}
				>
					<DialogTitle className="text-2xl font-bold text-gray-900 border-b border-gray-200">
						Donation Details
					</DialogTitle>
					<DialogContent className="p-6 bg-white">
						<div className="space-y-4">
							<p className="text-sm text-gray-700">
								<strong className="font-medium text-gray-900">
									Donor Email:
								</strong>{" "}
								{selectedDonation.donor?.email || "N/A"}
							</p>
							<p className="text-sm text-gray-700">
								<strong className="font-medium text-gray-900">Quantity:</strong>{" "}
								{selectedDonation.quantity || 0}{" "}
								{selectedDonation.unit || "N/A"}
							</p>
							<p className="text-sm text-gray-700">
								<strong className="font-medium text-gray-900">Type:</strong>{" "}
								{selectedDonation.type || "N/A"}
							</p>
							<p className="text-sm text-gray-700">
								<strong className="font-medium text-gray-900">Cause:</strong>{" "}
								{selectedDonation.cause?.title || "N/A"}
							</p>
							<p className="text-sm text-gray-700">
								<strong className="font-medium text-gray-900">
									Scheduled Date:
								</strong>{" "}
								{selectedDonation.scheduledDate
									? new Date(
											selectedDonation.scheduledDate
									  ).toLocaleDateString()
									: "N/A"}{" "}
								at {selectedDonation.scheduledTime || "N/A"}
							</p>
							<p className="text-sm text-gray-700">
								<strong className="font-medium text-gray-900">
									Description:
								</strong>{" "}
								{selectedDonation.description || "N/A"}
							</p>
							<p className="text-sm text-gray-700">
								<strong className="font-medium text-gray-900">Status:</strong>{" "}
								<span
									className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                    ${
											selectedDonation.status === "PENDING"
												? "bg-yellow-100 text-yellow-800"
												: selectedDonation.status === "APPROVED"
												? "bg-blue-100 text-blue-800"
												: selectedDonation.status === "RECEIVED"
												? "bg-green-100 text-green-800"
												: selectedDonation.status === "CONFIRMED"
												? "bg-purple-100 text-purple-800"
												: selectedDonation.status === "CANCELLED"
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}`}
								>
									{selectedDonation.status}
								</span>
							</p>
							<p className="text-sm text-gray-700">
								<strong className="font-medium text-gray-900">
									Pickup Required:
								</strong>{" "}
								{selectedDonation.isPickup ? "Yes" : "No"}
							</p>
							{selectedDonation.isPickup && (
								<p className="text-sm text-gray-700">
									<strong className="font-medium text-gray-900">
										Pickup Address:
									</strong>{" "}
									{selectedDonation.pickupAddress
										? `${selectedDonation.pickupAddress.street || ""}, ${
												selectedDonation.pickupAddress.city || ""
										  }, ${selectedDonation.pickupAddress.state || ""}, ${
												selectedDonation.pickupAddress.zipCode || ""
										  }, ${selectedDonation.pickupAddress.country || ""}`
										: "N/A"}
								</p>
							)}
							<p className="text-sm text-gray-700">
								<strong className="font-medium text-gray-900">
									Contact Phone:
								</strong>{" "}
								{selectedDonation.contactPhone || "N/A"}
							</p>
							<p className="text-sm text-gray-700">
								<strong className="font-medium text-gray-900">
									Contact Email:
								</strong>{" "}
								{selectedDonation.contactEmail || "N/A"}
							</p>
						</div>
					</DialogContent>
					<DialogActions className="p-6 border-t border-gray-200">
						<Button
							onClick={() => {
								setShowDonationModal(false);
								setSelectedDonation(null);
							}}
							variant="contained"
							className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors"
						>
							Close
						</Button>
					</DialogActions>
				</Dialog>
			)}

			{/* Photo Upload Modal */}
			{showPhotoUploadModal && selectedDonation && (
				<Dialog
					open={showPhotoUploadModal}
					onClose={() => {
						setShowPhotoUploadModal(false);
						setSelectedPhoto(null);
						setPhotoPreviewUrl(null);
					}}
					maxWidth="sm"
					fullWidth
					sx={{
						"& .MuiDialog-paper": {
							borderRadius: "12px",
							boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
						},
					}}
				>
					<DialogTitle className="text-2xl font-bold text-gray-900 border-b border-gray-200">
						Mark Donation as Received
					</DialogTitle>
					<DialogContent className="p-6 bg-white">
						<div className="space-y-4">
							<p className="text-sm text-gray-700 mb-4">
								Upload a photo of the received donation to confirm receipt and
								notify the donor.
							</p>
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
								<p className="text-sm text-blue-800">
									📸 <strong>Photo Upload:</strong> Upload a photo to confirm
									receipt. The donor will be notified and can then confirm the
									donation to receive their PDF receipt.
								</p>
							</div>

							<div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
								{photoPreviewUrl ? (
									<div className="mb-4 relative h-64 w-full max-w-md mx-auto">
										<Image
											src={photoPreviewUrl}
											alt="Donation preview"
											className="rounded-lg shadow-sm object-contain"
											fill
											sizes="(max-width: 768px) 100vw, 400px"
										/>
									</div>
								) : (
									<div className="text-center mb-4">
										<FiCamera className="mx-auto h-12 w-12 text-gray-400" />
										<p className="mt-1 text-sm text-gray-500">
											No photo selected
										</p>
									</div>
								)}

								<input
									type="file"
									accept="image/*"
									onChange={handlePhotoChange}
									ref={fileInputRef}
									className="hidden"
									id="photo-upload"
								/>

								<label
									htmlFor="photo-upload"
									className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors"
								>
									{photoPreviewUrl ? "Change Photo" : "Select Photo"}
								</label>
							</div>

							<div className="mt-4">
								<p className="text-sm text-gray-700">
									<strong className="font-medium text-gray-900">Donor:</strong>{" "}
									{selectedDonation.donor?.name || "Anonymous"}
								</p>
								<p className="text-sm text-gray-700">
									<strong className="font-medium text-gray-900">
										Donation Type:
									</strong>{" "}
									{selectedDonation.type === "MONEY"
										? `Money (₹${
												selectedDonation.amount?.toFixed(2) || "0.00"
										  })`
										: `${selectedDonation.type} (${selectedDonation.quantity} ${
												selectedDonation.unit || ""
										  })`}
								</p>
							</div>
						</div>
					</DialogContent>
					<DialogActions className="p-6 border-t border-gray-200">
						<Button
							onClick={() => {
								setShowPhotoUploadModal(false);
								setSelectedPhoto(null);
								setPhotoPreviewUrl(null);
							}}
							variant="outlined"
							className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg px-4 py-2 transition-colors"
						>
							Cancel
						</Button>
						<Button
							onClick={handleMarkAsReceived}
							variant="contained"
							disabled={!selectedPhoto || isMarkingReceived}
							className={`bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-4 py-2 transition-colors ${
								!selectedPhoto || isMarkingReceived
									? "opacity-50 cursor-not-allowed"
									: ""
							}`}
						>
							{isMarkingReceived ? "Processing..." : "Mark as Received"}
						</Button>
					</DialogActions>
				</Dialog>
			)}

			{/* Receipt Upload Modal */}
			{showReceiptUploadModal && selectedDonation && (
				<Dialog
					open={showReceiptUploadModal}
					onClose={() => {
						setShowReceiptUploadModal(false);
					}}
					maxWidth="sm"
					fullWidth
					sx={{
						"& .MuiDialog-paper": {
							borderRadius: "12px",
							boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
						},
					}}
				>
					<DialogTitle className="text-2xl font-bold text-gray-900 border-b border-gray-200">
						Confirm Donation Completion
					</DialogTitle>
					<DialogContent className="p-6 bg-white">
						<div className="space-y-4">
							<p className="text-sm text-gray-700 mb-4">
								Mark this donation as confirmed and completed. A PDF receipt
								will be automatically generated and sent to the donor.
							</p>

							<div className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-lg p-6 bg-green-50">
								<div className="text-center">
									<div className="mx-auto h-16 w-16 text-green-600 mb-4">
										📄
									</div>
									<h3 className="text-lg font-medium text-green-900 mb-2">
										Auto-Generate PDF Receipt
									</h3>
									<p className="text-sm text-green-700 mb-4">
										A professional PDF receipt will be automatically generated
										and sent to the donor when you confirm this donation.
									</p>
									<div className="bg-white rounded-lg p-3 border border-green-200">
										<p className="text-xs text-green-600 font-medium">
											✅ No file upload required
										</p>
										<p className="text-xs text-green-600">
											✅ Automatic email notification
										</p>
										<p className="text-xs text-green-600">
											✅ Professional receipt format
										</p>
									</div>
								</div>
							</div>

							<div className="mt-4">
								<p className="text-sm text-gray-700">
									<strong className="font-medium text-gray-900">Donor:</strong>{" "}
									{selectedDonation.donor?.name || "Anonymous"}
								</p>
								<p className="text-sm text-gray-700">
									<strong className="font-medium text-gray-900">
										Donation Type:
									</strong>{" "}
									{selectedDonation.type === "MONEY"
										? `Money (₹${
												selectedDonation.amount?.toFixed(2) || "0.00"
										  })`
										: `${selectedDonation.type} (${selectedDonation.quantity} ${
												selectedDonation.unit || ""
										  })`}
								</p>
							</div>
						</div>
					</DialogContent>
					<DialogActions className="p-6 border-t border-gray-200">
						<Button
							onClick={() => {
								setShowReceiptUploadModal(false);
								setSelectedDonation(null);
							}}
							variant="outlined"
							className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg px-4 py-2 transition-colors"
						>
							Cancel
						</Button>
						<Button
							onClick={handleMarkAsConfirmed}
							variant="contained"
							disabled={isMarkingConfirmed}
							className={`bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-4 py-2 transition-colors ${
								isMarkingConfirmed ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							{isMarkingConfirmed
								? "Generating Receipt..."
								: "Confirm & Generate Receipt"}
						</Button>
					</DialogActions>
				</Dialog>
			)}

			{/* Pagination */}
			{data?.pagination && data.pagination.pages > 1 && (
				<div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
					<div className="flex flex-col sm:flex-row items-center justify-between">
						<div className="text-sm text-gray-700 mb-4 sm:mb-0">
							Showing{" "}
							<span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
							<span className="font-medium">
								{Math.min(page * limit, data.pagination.total)}
							</span>{" "}
							of <span className="font-medium">{data.pagination.total}</span>{" "}
							donations
						</div>
						<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
							<button
								onClick={() => setPage(page - 1)}
								disabled={page === 1}
								className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
							>
								<span className="sr-only">Previous</span>
								<FiChevronLeft className="h-5 w-5" />
							</button>
							{Array.from(
								{ length: Math.min(5, data.pagination.pages) },
								(_, i) => {
									let pageNum;
									if (data.pagination.pages <= 5) {
										pageNum = i + 1;
									} else if (page <= 3) {
										pageNum = i + 1;
									} else if (page >= data.pagination.pages - 2) {
										pageNum = data.pagination.pages - 4 + i;
									} else {
										pageNum = page - 2 + i;
									}
									return (
										<button
											key={pageNum}
											onClick={() => setPage(pageNum)}
											className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
												page === pageNum
													? "z-10 bg-blue-50 border-blue-500 text-blue-600"
													: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
											} transition-colors`}
										>
											{pageNum}
										</button>
									);
								}
							)}
							<button
								onClick={() => setPage(page + 1)}
								disabled={page === data.pagination.pages}
								className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
							>
								<span className="sr-only">Next</span>
								<FiChevronRight className="h-5 w-5" />
							</button>
						</nav>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrganizationDonations;
