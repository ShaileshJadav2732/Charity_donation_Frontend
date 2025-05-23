"use client";

import { FaFilePdf, FaImage, FaDownload, FaCheckCircle, FaClock } from "react-icons/fa";
import { getReceiptImageUrl } from "@/utils/url";

interface ReceiptSummaryProps {
	donation: {
		_id: string;
		status: string;
		receiptImage?: string;
		pdfReceiptUrl?: string;
		confirmationDate?: string;
		createdAt: string;
	};
	className?: string;
}

export default function ReceiptSummary({ donation, className = "" }: ReceiptSummaryProps) {
	const getStatusInfo = () => {
		switch (donation.status) {
			case "PENDING":
				return {
					icon: FaClock,
					color: "text-yellow-600",
					bgColor: "bg-yellow-50",
					borderColor: "border-yellow-200",
					title: "Donation Pending",
					description: "Your donation is awaiting approval from the organization.",
				};
			case "APPROVED":
				return {
					icon: FaCheckCircle,
					color: "text-blue-600",
					bgColor: "bg-blue-50",
					borderColor: "border-blue-200",
					title: "Donation Approved",
					description: "Your donation has been approved and is awaiting receipt.",
				};
			case "RECEIVED":
				return {
					icon: FaCheckCircle,
					color: "text-green-600",
					bgColor: "bg-green-50",
					borderColor: "border-green-200",
					title: "Donation Received",
					description: "Your donation has been received. Photo and PDF receipt are available.",
				};
			case "CONFIRMED":
				return {
					icon: FaCheckCircle,
					color: "text-purple-600",
					bgColor: "bg-purple-50",
					borderColor: "border-purple-200",
					title: "Donation Confirmed",
					description: "Your donation has been confirmed and completed. All receipts are available.",
				};
			default:
				return {
					icon: FaClock,
					color: "text-gray-600",
					bgColor: "bg-gray-50",
					borderColor: "border-gray-200",
					title: "Donation Status",
					description: "Check the status of your donation.",
				};
		}
	};

	const statusInfo = getStatusInfo();
	const StatusIcon = statusInfo.icon;

	const hasReceipts = donation.receiptImage || donation.pdfReceiptUrl;
	const showReceipts = (donation.status === "RECEIVED" || donation.status === "CONFIRMED") && hasReceipts;

	return (
		<div className={`bg-white rounded-lg border shadow-sm ${className}`}>
			{/* Status Header */}
			<div className={`p-4 rounded-t-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border-b`}>
				<div className="flex items-center space-x-3">
					<div className={`p-2 rounded-full bg-white`}>
						<StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
					</div>
					<div>
						<h3 className={`font-semibold ${statusInfo.color}`}>{statusInfo.title}</h3>
						<p className="text-sm text-gray-600">{statusInfo.description}</p>
					</div>
				</div>
			</div>

			{/* Receipt Section */}
			{showReceipts && (
				<div className="p-4">
					<h4 className="font-medium text-gray-900 mb-3">Available Receipts</h4>
					<div className="space-y-3">
						{/* Photo Receipt */}
						{donation.receiptImage && (
							<div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
								<div className="flex items-center space-x-3">
									<div className="p-2 bg-teal-100 rounded-full">
										<FaImage className="h-4 w-4 text-teal-600" />
									</div>
									<div>
										<p className="font-medium text-teal-900">Donation Photo</p>
										<p className="text-sm text-teal-700">
											Photo uploaded by organization when received
										</p>
									</div>
								</div>
								<a
									href={getReceiptImageUrl(donation.receiptImage)}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-100 rounded-md hover:bg-teal-200 transition-colors"
								>
									View Photo
								</a>
							</div>
						)}

						{/* PDF Receipt */}
						{donation.pdfReceiptUrl && (
							<div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
								<div className="flex items-center space-x-3">
									<div className="p-2 bg-purple-100 rounded-full">
										<FaFilePdf className="h-4 w-4 text-purple-600" />
									</div>
									<div>
										<p className="font-medium text-purple-900">PDF Receipt</p>
										<p className="text-sm text-purple-700">
											Automatically generated official receipt
										</p>
									</div>
								</div>
								<a
									href={getReceiptImageUrl(donation.pdfReceiptUrl)}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
								>
									<FaDownload className="h-3 w-3 mr-1" />
									Download PDF
								</a>
							</div>
						)}
					</div>

					{/* Auto-generation Notice */}
					{donation.status === "RECEIVED" && donation.pdfReceiptUrl && (
						<div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
							<p className="text-sm text-blue-800">
								<strong>📄 Auto-Generated:</strong> The PDF receipt was automatically created when your donation was marked as received. This serves as your official donation receipt.
							</p>
						</div>
					)}
				</div>
			)}

			{/* No Receipts Message */}
			{!showReceipts && (donation.status === "RECEIVED" || donation.status === "CONFIRMED") && (
				<div className="p-4">
					<div className="text-center py-6">
						<div className="mx-auto h-12 w-12 text-gray-400 mb-3">
							📄
						</div>
						<p className="text-sm text-gray-600">
							No receipts are available for this donation yet.
						</p>
					</div>
				</div>
			)}

			{/* Timeline */}
			<div className="px-4 pb-4">
				<div className="border-t pt-3">
					<p className="text-xs text-gray-500">
						Donation created: {new Date(donation.createdAt).toLocaleDateString()}
						{donation.confirmationDate && (
							<span className="ml-2">
								• Confirmed: {new Date(donation.confirmationDate).toLocaleDateString()}
							</span>
						)}
					</p>
				</div>
			</div>
		</div>
	);
}

// Compact version for cards
export function CompactReceiptSummary({
	donation,
	className = "",
}: {
	donation: {
		status: string;
		receiptImage?: string;
		pdfReceiptUrl?: string;
	};
	className?: string;
}) {
	const hasPhoto = !!donation.receiptImage;
	const hasPdf = !!donation.pdfReceiptUrl;
	const showReceipts = (donation.status === "RECEIVED" || donation.status === "CONFIRMED") && (hasPhoto || hasPdf);

	if (!showReceipts) return null;

	return (
		<div className={`flex items-center space-x-2 ${className}`}>
			{hasPhoto && (
				<span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
					📷 Photo
				</span>
			)}
			{hasPdf && (
				<span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
					📄 PDF
				</span>
			)}
		</div>
	);
}
