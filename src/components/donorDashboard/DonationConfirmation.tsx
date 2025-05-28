"use client";
import { useConfirmDonationReceiptMutation } from "@/store/api/donationApi";
import { Donation } from "@/types/donation";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { getReceiptImageUrl } from "@/utils/url";
import { parseError } from "@/types";

interface DonationConfirmationProps {
	donation: Donation;
	onConfirmed: () => void;
}

const DonationConfirmation: React.FC<DonationConfirmationProps> = ({
	donation,
}) => {
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);

	const [retryCount, setRetryCount] = useState(0);
	const [confirmReceipt, { isLoading }] = useConfirmDonationReceiptMutation();

	const handleConfirmReceipt = async () => {
		try {
			const loadingToast = toast.loading("Confirming donation receipt...");

			await confirmReceipt({ donationId: donation._id }).unwrap();

			toast.dismiss(loadingToast);
			setShowConfirmationModal(false);
		} catch (error: unknown) {
			const errorMessage = parseError(error);
			setRetryCount((prev) => prev + 1);

			if (retryCount < 2) {
				toast.error(
					`❌ Failed to confirm receipt: ${errorMessage}. Please try again.`,
					{
						duration: 6000,
					}
				);
			} else {
				toast.error(
					`❌ Failed to confirm receipt after ${
						retryCount + 1
					} attempts: ${errorMessage}`,
					{
						duration: 8000,
					}
				);
			}
		}
	};

	return (
		<>
			<button
				onClick={() => setShowConfirmationModal(true)}
				disabled={isLoading}
				className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
			>
				<FiCheckCircle className="text-lg" />
				{isLoading ? "Processing..." : "Confirm Receipt"}
			</button>

			{showConfirmationModal && (
				<Dialog
					open={showConfirmationModal}
					onClose={() => setShowConfirmationModal(false)}
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
						Confirm Donation Receipt
					</DialogTitle>
					<DialogContent className="p-6 bg-white">
						<div className="space-y-6">
							{/* Donation Details */}
							<div className="bg-gray-50 rounded-lg p-4">
								<h4 className="font-semibold text-gray-900 mb-3">
									Donation Details
								</h4>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-gray-600">Organization:</span>
										<p className="font-medium text-gray-900">
											{donation.organization?.name}
										</p>
									</div>
									<div>
										<span className="text-gray-600">Cause:</span>
										<p className="font-medium text-gray-900">
											{donation.cause?.title}
										</p>
									</div>
									<div>
										<span className="text-gray-600">
											{donation.type === "MONEY" ? "Amount:" : "Type:"}
										</span>
										<p className="font-medium text-gray-900">
											{donation.type === "MONEY"
												? `₹${donation.amount?.toLocaleString()}`
												: donation.type}
										</p>
									</div>
									<div>
										<span className="text-gray-600">Date:</span>
										<p className="font-medium text-gray-900">
											{new Date(donation.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
							</div>

							{/* Confirmation Message */}
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<div className="flex items-start">
									<FiCheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
									<div>
										<h4 className="font-medium text-blue-900 mb-1">
											Confirm Receipt
										</h4>
										<p className="text-sm text-blue-800">
											Please confirm that you recognize this donation and the
											receipt photo uploaded by the organization. This action
											will mark the donation as completed and notify the
											organization.
										</p>
									</div>
								</div>
							</div>

							{/* Receipt Image */}
							{donation.receiptImage && (
								<div>
									<h4 className="font-semibold text-gray-900 mb-3">
										Receipt Photo
									</h4>
									<div className="flex justify-center">
										<div className="relative h-64 w-full max-w-md rounded-lg overflow-hidden border border-gray-200 shadow-sm">
											<Image
												src={getReceiptImageUrl(donation.receiptImage)}
												alt="Donation receipt"
												fill
												style={{ objectFit: "contain" }}
												className="rounded-lg"
											/>
										</div>
									</div>
								</div>
							)}
						</div>
					</DialogContent>
					<DialogActions className="p-6 bg-gray-50 border-t border-gray-200 gap-3">
						<Button
							onClick={() => setShowConfirmationModal(false)}
							variant="outlined"
							disabled={isLoading}
							className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg px-6 py-2 transition-all duration-200 disabled:opacity-50"
							startIcon={<FiX />}
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirmReceipt}
							variant="contained"
							disabled={isLoading}
							className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg px-6 py-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
								isLoading ? "opacity-75 cursor-not-allowed transform-none" : ""
							}`}
							startIcon={
								isLoading ? (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								) : (
									<FiCheckCircle />
								)
							}
						>
							{isLoading ? "Confirming..." : "Yes, Confirm Receipt"}
						</Button>
					</DialogActions>
				</Dialog>
			)}
		</>
	);
};

export default DonationConfirmation;
