"use client";

import { Donation } from "@/types/donation";
import React from "react";

import {
	FaCalendarAlt,
	FaCheckCircle,
	FaClock,
	FaDownload,
	FaExclamationTriangle,
	FaFilePdf,
	FaImage,
} from "react-icons/fa";

interface EnhancedDonationCardProps {
	donation: Donation;
	onFeedbackSubmitted?: () => void;
}

const EnhancedDonationCard: React.FC<EnhancedDonationCardProps> = ({
	donation,
}) => {
	// Check if feedback already exists for this donation

	const getStatusColor = (status: string) => {
		switch (status) {
			case "CONFIRMED":
				return "bg-green-100 text-green-800 border-green-200";
			case "RECEIVED":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "APPROVED":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "PENDING":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "CONFIRMED":
				return <FaCheckCircle className="h-4 w-4" />;
			case "RECEIVED":
				return <FaDownload className="h-4 w-4" />;
			case "APPROVED":
				return <FaClock className="h-4 w-4" />;
			case "PENDING":
				return <FaExclamationTriangle className="h-4 w-4" />;
			default:
				return <FaClock className="h-4 w-4" />;
		}
	};

	return (
		<>
			<div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
				{/* Header with Status */}
				<div className="p-6 pb-4">
					<div className="flex items-start justify-between mb-4">
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-gray-900 mb-1">
								{donation.cause?.title}
							</h3>
							<p className="text-sm text-gray-600">
								{donation.organization?.name}
							</p>
						</div>
						<div
							className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
								donation.status
							)}`}
						>
							{getStatusIcon(donation.status)}
							{donation.status}
						</div>
					</div>

					{/* Donation Details */}
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
							<p className="text-sm text-gray-600">Date</p>
							<p className="text-sm text-gray-900 flex items-center gap-1">
								<FaCalendarAlt className="h-3 w-3" />
								{new Date(donation.createdAt).toLocaleDateString()}
							</p>
						</div>
					</div>

					{/* Description */}
					<div className="mb-4">
						<p className="text-sm text-gray-600">Impact</p>
						<p className="text-sm text-gray-900">{donation.description}</p>
					</div>
				</div>

				{/* Actions Section */}
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
					<div className="flex flex-wrap items-center justify-between gap-3">
						{/* Receipt Downloads */}
						<div className="flex items-center gap-2">
							{donation.receiptImage && (
								<button
									className="inline-flex items-center px-3 py-2 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
									title="View donation photo"
								>
									<FaImage className="h-3 w-3 mr-1" />
									Photo
								</button>
							)}
							{donation.pdfReceiptUrl && (
								<button
									className="inline-flex items-center px-3 py-2 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
									title="Download PDF receipt"
								>
									<FaFilePdf className="h-3 w-3 mr-1" />
									PDF Receipt
								</button>
							)}
						</div>
					</div>

					{/* Status Message */}
					{donation.status === "CONFIRMED" && donation.pdfReceiptUrl && (
						<p className="text-xs text-gray-500 mt-2">
							📄 PDF receipt was automatically generated upon confirmation
						</p>
					)}
				</div>
			</div>
		</>
	);
};

export default EnhancedDonationCard;
