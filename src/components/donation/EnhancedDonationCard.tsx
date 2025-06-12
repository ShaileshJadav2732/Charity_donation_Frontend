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
	FaDollarSign,
	FaBoxOpen,
	FaTshirt,
	FaUtensils,
	FaBook,
	FaCouch,
	FaHome,
	FaQuestion,
} from "react-icons/fa";
import { GiBlood } from "react-icons/gi";

interface EnhancedDonationCardProps {
	donation: Donation;
	onFeedbackSubmitted?: () => void;
}

const EnhancedDonationCard: React.FC<EnhancedDonationCardProps> = ({
	donation,
}) => {
	// Helper function to get icon for donation type
	const getDonationTypeIcon = (type: string) => {
		switch (type) {
			case "MONEY":
				return <FaDollarSign className="h-5 w-5" />;
			case "CLOTHES":
				return <FaTshirt className="h-5 w-5" />;
			case "FOOD":
				return <FaUtensils className="h-5 w-5" />;
			case "BLOOD":
				return <GiBlood className="h-5 w-5" />;
			case "BOOKS":
				return <FaBook className="h-5 w-5" />;
			case "FURNITURE":
				return <FaCouch className="h-5 w-5" />;
			case "HOUSEHOLD":
				return <FaHome className="h-5 w-5" />;
			case "OTHER":
				return <FaQuestion className="h-5 w-5" />;
			default:
				return <FaBoxOpen className="h-5 w-5" />;
		}
	};

	// Helper function to get color for donation type
	const getDonationTypeColor = (type: string) => {
		switch (type) {
			case "MONEY":
				return "bg-green-100 text-green-600 border-green-200";
			case "CLOTHES":
				return "bg-blue-100 text-blue-600 border-blue-200";
			case "FOOD":
				return "bg-orange-100 text-orange-600 border-orange-200";
			case "BLOOD":
				return "bg-pink-100 text-pink-600 border-pink-200"; // Changed from red to pink
			case "BOOKS":
				return "bg-yellow-100 text-yellow-600 border-yellow-200";
			case "FURNITURE":
				return "bg-purple-100 text-purple-600 border-purple-200";
			case "HOUSEHOLD":
				return "bg-teal-100 text-teal-600 border-teal-200";
			case "OTHER":
				return "bg-gray-100 text-gray-600 border-gray-200";
			default:
				return "bg-indigo-100 text-indigo-600 border-indigo-200";
		}
	};

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
			case "REJECTED":
				return "bg-orange-100 text-orange-800 border-orange-200"; // Changed from red to orange
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
						<div className="flex items-center gap-2">
							{/* Donation Type Badge */}
							<div
								className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getDonationTypeColor(
									donation.type
								)}`}
							>
								{getDonationTypeIcon(donation.type)}
								{donation.type === "MONEY" ? "Money" : donation.type}
							</div>
							{/* Status Badge */}
							<div
								className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
									donation.status
								)}`}
							>
								{getStatusIcon(donation.status)}
								{donation.status}
							</div>
						</div>
					</div>

					{/* Donation Details - Different layout for Money vs Items */}
					{donation.type === "MONEY" ? (
						// Monetary Donation Layout
						<div className="grid grid-cols-2 gap-4 mb-4">
							<div>
								<p className="text-sm text-gray-600">Amount Donated</p>
								<p className="text-2xl font-bold text-green-600">
									₹{donation.amount?.toLocaleString()}
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
					) : (
						// Item Donation Layout
						<div className="grid grid-cols-2 gap-4 mb-4">
							<div>
								<p className="text-sm text-gray-600">Quantity</p>
								<p className="text-lg font-semibold text-gray-900">
									{donation.quantity} {donation.unit || "items"}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Scheduled Date</p>
								<p className="text-sm text-gray-900 flex items-center gap-1">
									<FaCalendarAlt className="h-3 w-3" />
									{donation.scheduledDate
										? new Date(donation.scheduledDate).toLocaleDateString()
										: new Date(donation.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					)}

					{/* Additional Item Details */}
					{donation.type !== "MONEY" && (
						<div className="grid grid-cols-2 gap-4 mb-4">
							<div>
								<p className="text-sm text-gray-600">Delivery Method</p>
								<p className="text-sm text-gray-900">
									{donation.isPickup ? "🚚 Pickup" : "📦 Drop-off"}
								</p>
							</div>
							{donation.scheduledTime && (
								<div>
									<p className="text-sm text-gray-600">Scheduled Time</p>
									<p className="text-sm text-gray-900">
										🕐 {donation.scheduledTime}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Description */}
					<div className="mb-4">
						<p className="text-sm text-gray-600">
							{donation.type === "MONEY" ? "Message" : "Description"}
						</p>
						<p className="text-sm text-gray-900">{donation.description}</p>
					</div>
				</div>

				{/* Actions Section */}
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
					<div className="flex flex-wrap items-center justify-between gap-3">
						{/* Receipt Downloads */}
						<div className="flex items-center gap-2">
							{donation.receiptImage && (
								<a
									href={
										donation.receiptImage.startsWith("http")
											? donation.receiptImage
											: `${
													process.env.NEXT_PUBLIC_API_URL?.replace(
														"/api",
														""
													) || "http://localhost:8080"
											  }${donation.receiptImage}`
									}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center px-3 py-2 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
									title={
										donation.type === "MONEY"
											? "View payment confirmation"
											: "View donation photo"
									}
								>
									<FaImage className="h-3 w-3 mr-1" />
									{donation.type === "MONEY" ? "Payment Proof" : "Photo"}
								</a>
							)}
							{donation.pdfReceiptUrl && (
								<a
									href={
										donation.pdfReceiptUrl.startsWith("http")
											? donation.pdfReceiptUrl
											: `${
													process.env.NEXT_PUBLIC_API_URL?.replace(
														"/api",
														""
													) || "http://localhost:8080"
											  }${donation.pdfReceiptUrl}`
									}
									target="_blank"
									rel="noopener noreferrer"
									download
									className="inline-flex items-center px-3 py-2 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
									title="Download PDF receipt"
								>
									<FaFilePdf className="h-3 w-3 mr-1" />
									PDF Receipt
								</a>
							)}
						</div>

						{/* Contact Information for Item Donations */}
						{donation.type !== "MONEY" && donation.contactPhone && (
							<div className="text-xs text-gray-600">
								📞 {donation.contactPhone}
							</div>
						)}
					</div>

					{/* Status Messages */}
					{donation.type === "MONEY" ? (
						// Monetary donation status messages
						<>
							{donation.status === "APPROVED" && (
								<p className="text-xs text-green-600 mt-2">
									💳 Payment processed successfully
								</p>
							)}
							{donation.status === "CONFIRMED" && donation.pdfReceiptUrl && (
								<p className="text-xs text-gray-500 mt-2">
									📄 PDF receipt was automatically generated upon confirmation
								</p>
							)}
						</>
					) : (
						// Item donation status messages
						<>
							{donation.status === "PENDING" && (
								<p className="text-xs text-yellow-600 mt-2">
									⏳ Waiting for organization approval
								</p>
							)}
							{donation.status === "APPROVED" && (
								<p className="text-xs text-blue-600 mt-2">
									✅ Approved - Please deliver as scheduled
								</p>
							)}
							{donation.status === "RECEIVED" && (
								<p className="text-xs text-green-600 mt-2">
									📦 Items received by organization
								</p>
							)}
							{donation.status === "CONFIRMED" && (
								<p className="text-xs text-green-600 mt-2">
									🎉 Donation confirmed - Thank you for your contribution!
								</p>
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default EnhancedDonationCard;
