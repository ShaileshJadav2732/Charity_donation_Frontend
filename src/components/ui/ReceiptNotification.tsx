"use client";

import { getReceiptImageUrl } from "@/utils/url";
import { useEffect, useState } from "react";
import { FaDownload, FaFilePdf, FaTimes } from "react-icons/fa";

interface ReceiptNotificationProps {
	show: boolean;
	onClose: () => void;
	donationId: string;
	pdfReceiptUrl?: string;
	donorName?: string;
	autoHide?: boolean;
	autoHideDelay?: number;
}

export default function ReceiptNotification({
	show,
	onClose,

	pdfReceiptUrl,
	donorName = "the donor",
	autoHide = true,
	autoHideDelay = 5000,
}: ReceiptNotificationProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (show) {
			setIsVisible(true);
			if (autoHide) {
				const timer = setTimeout(() => {
					handleClose();
				}, autoHideDelay);
				return () => clearTimeout(timer);
			}
		}
	}, [show, autoHide, autoHideDelay]);

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(() => {
			onClose();
		}, 300); // Wait for animation to complete
	};

	const handleDownload = () => {
		if (pdfReceiptUrl) {
			window.open(getReceiptImageUrl(pdfReceiptUrl), "_blank");
		}
	};

	if (!show) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end">
			<div
				className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out ${
					isVisible
						? "translate-y-0 opacity-100 scale-100"
						: "translate-y-2 opacity-0 scale-95"
				}`}
			>
				<div className="p-4">
					<div className="flex items-start">
						<div className="flex-shrink-0">
							<div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
								<FaFilePdf className="h-6 w-6 text-green-600" />
							</div>
						</div>
						<div className="ml-3 w-0 flex-1 pt-0.5">
							<p className="text-sm font-medium text-gray-900">
								PDF Receipt Generated!
							</p>
							<p className="mt-1 text-sm text-gray-500">
								A PDF receipt has been automatically generated for {donorName}s
								donation.
							</p>
							<div className="mt-3 flex space-x-2">
								{pdfReceiptUrl && (
									<button
										onClick={handleDownload}
										className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
									>
										<FaDownload className="h-3 w-3 mr-1" />
										View PDF
									</button>
								)}
							</div>
						</div>
						<div className="ml-4 flex-shrink-0 flex">
							<button
								onClick={handleClose}
								className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								<span className="sr-only">Close</span>
								<FaTimes className="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Toast-style notification for PDF receipt generation
export function ReceiptGeneratedToast({
	donationId,
	pdfReceiptUrl,
	onDownload,
}: {
	donationId: string;
	pdfReceiptUrl?: string;
	onDownload?: () => void;
}) {
	const handleDownload = () => {
		if (pdfReceiptUrl) {
			window.open(getReceiptImageUrl(pdfReceiptUrl), "_blank");
			onDownload?.();
		}
	};

	return (
		<div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
			<div className="flex-shrink-0">
				<FaFilePdf className="h-5 w-5 text-green-600" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-green-800">
					PDF Receipt Generated
				</p>
				<p className="text-sm text-green-600">
					Automatic receipt created for donation #{donationId.slice(-8)}
				</p>
			</div>
			{pdfReceiptUrl && (
				<div className="flex-shrink-0">
					<button
						onClick={handleDownload}
						className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
					>
						<FaDownload className="h-3 w-3 mr-1" />
						View
					</button>
				</div>
			)}
		</div>
	);
}

// Inline status indicator for receipts
export function ReceiptStatusIndicator({
	hasPhoto,
	hasPdfReceipt,
	status,
	className = "",
}: {
	hasPhoto: boolean;
	hasPdfReceipt: boolean;
	status: string;
	className?: string;
}) {
	if (status !== "RECEIVED" && status !== "CONFIRMED") {
		return null;
	}

	return (
		<div className={`flex items-center space-x-2 text-xs ${className}`}>
			{hasPhoto && (
				<span className="inline-flex items-center px-2 py-1 rounded-full bg-teal-100 text-teal-800">
					📷 Photo
				</span>
			)}
			{hasPdfReceipt && (
				<span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
					📄 PDF Receipt
				</span>
			)}
			{!hasPhoto && !hasPdfReceipt && (
				<span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600">
					No receipts available
				</span>
			)}
		</div>
	);
}
