"use client";

import { FaDownload, FaImage, FaFilePdf, FaEye } from "react-icons/fa";
import { getReceiptImageUrl } from "@/utils/url";
import { toast } from "react-hot-toast";

interface ReceiptDownloadProps {
	receiptImage?: string;
	pdfReceiptUrl?: string;
<<<<<<< Updated upstream
	donationStatus: string;
	donationId: string;
=======
	// donationStatus: string; // Unused
	// donationId: string; // Unused
>>>>>>> Stashed changes
	className?: string;
	showLabels?: boolean;
	size?: "sm" | "md" | "lg";
}

export default function ReceiptDownload({
	receiptImage,
	pdfReceiptUrl,
<<<<<<< Updated upstream
	donationStatus,
	donationId,
=======
	// donationStatus, // Unused
	// donationId, // Unused
>>>>>>> Stashed changes
	className = "",
	showLabels = true,
	size = "md",
}: ReceiptDownloadProps) {
	const handleDownload = (url: string, type: "photo" | "pdf") => {
		try {
			window.open(getReceiptImageUrl(url), "_blank");
<<<<<<< Updated upstream
			toast.success(`${type === "pdf" ? "PDF receipt" : "Photo"} opened successfully`);
		} catch (error) {
=======
			toast.success(
				`${type === "pdf" ? "PDF receipt" : "Photo"} opened successfully`
			);
		} catch {
>>>>>>> Stashed changes
			toast.error(`Failed to open ${type === "pdf" ? "PDF receipt" : "photo"}`);
		}
	};

	const getSizeClasses = () => {
		switch (size) {
			case "sm":
				return {
					button: "px-2 py-1 text-xs",
					icon: "h-3 w-3",
					gap: "gap-2",
				};
			case "lg":
				return {
					button: "px-6 py-3 text-base",
					icon: "h-5 w-5",
					gap: "gap-4",
				};
			default:
				return {
					button: "px-4 py-2 text-sm",
					icon: "h-4 w-4",
					gap: "gap-3",
				};
		}
	};

	const sizeClasses = getSizeClasses();

	// Don't render if no receipts are available
	if (!receiptImage && !pdfReceiptUrl) {
		return null;
	}

	return (
		<div className={`flex flex-wrap ${sizeClasses.gap} ${className}`}>
			{/* Photo Receipt */}
			{receiptImage && (
				<button
					onClick={() => handleDownload(receiptImage, "photo")}
					className={`inline-flex items-center ${sizeClasses.button} bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
					title="View donation photo"
				>
					<FaImage className={`${sizeClasses.icon} mr-2`} />
					{showLabels && (size === "sm" ? "Photo" : "View Photo")}
				</button>
			)}

			{/* PDF Receipt */}
			{pdfReceiptUrl && (
				<button
					onClick={() => handleDownload(pdfReceiptUrl, "pdf")}
					className={`inline-flex items-center ${sizeClasses.button} bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
					title="Download PDF receipt"
				>
					<FaDownload className={`${sizeClasses.icon} mr-2`} />
					{showLabels && (size === "sm" ? "PDF" : "PDF Receipt")}
				</button>
			)}
		</div>
	);
}

// Alternative component for inline display
export function InlineReceiptLinks({
	receiptImage,
	pdfReceiptUrl,
<<<<<<< Updated upstream
	donationStatus,
=======
	// donationStatus, // Unused
>>>>>>> Stashed changes
	className = "",
}: {
	receiptImage?: string;
	pdfReceiptUrl?: string;
<<<<<<< Updated upstream
	donationStatus: string;
=======
	// donationStatus: string; // Unused
>>>>>>> Stashed changes
	className?: string;
}) {
	if (!receiptImage && !pdfReceiptUrl) {
		return null;
	}

	return (
		<div className={`flex items-center space-x-4 ${className}`}>
			{receiptImage && (
				<a
					href={getReceiptImageUrl(receiptImage)}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 transition-colors"
				>
					<FaEye className="h-4 w-4 mr-1" />
					View Photo
				</a>
			)}
			{pdfReceiptUrl && (
				<a
					href={getReceiptImageUrl(pdfReceiptUrl)}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 transition-colors"
				>
					<FaFilePdf className="h-4 w-4 mr-1" />
					PDF Receipt
				</a>
			)}
		</div>
	);
}

// Status-aware receipt display
export function StatusReceiptDisplay({
	donation,
	className = "",
}: {
	donation: {
		_id: string;
		status: string;
		receiptImage?: string;
		pdfReceiptUrl?: string;
	};
	className?: string;
}) {
	const getStatusMessage = () => {
		switch (donation.status) {
			case "RECEIVED":
<<<<<<< Updated upstream
				return "Donation received! Photo and receipt generated.";
			case "CONFIRMED":
				return "Donation confirmed and completed.";
=======
				return "Donation received! Photo uploaded.";
			case "CONFIRMED":
				return "Donation confirmed and completed. Receipt generated.";
>>>>>>> Stashed changes
			default:
				return "";
		}
	};

<<<<<<< Updated upstream
	const showReceipts = donation.status === "RECEIVED" || donation.status === "CONFIRMED";
=======
	const showReceipts =
		donation.status === "RECEIVED" || donation.status === "CONFIRMED";
>>>>>>> Stashed changes
	const hasReceipts = donation.receiptImage || donation.pdfReceiptUrl;

	if (!showReceipts || !hasReceipts) {
		return null;
	}

	return (
		<div className={`pt-4 border-t ${className}`}>
			<div className="flex items-center justify-between">
				<p className="text-sm text-gray-600">{getStatusMessage()}</p>
				<InlineReceiptLinks
					receiptImage={donation.receiptImage}
					pdfReceiptUrl={donation.pdfReceiptUrl}
<<<<<<< Updated upstream
					donationStatus={donation.status}
				/>
			</div>
			{donation.status === "RECEIVED" && donation.pdfReceiptUrl && (
				<p className="text-xs text-gray-500 mt-1">
					📄 PDF receipt was automatically generated
=======
				/>
			</div>
			{donation.status === "CONFIRMED" && donation.pdfReceiptUrl && (
				<p className="text-xs text-gray-500 mt-1">
					📄 PDF receipt was automatically generated upon confirmation
>>>>>>> Stashed changes
				</p>
			)}
		</div>
	);
}
