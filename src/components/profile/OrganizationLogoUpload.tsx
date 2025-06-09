"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { Camera, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUploadOrganizationLogoMutation } from "@/store/api/uploadApi";
import Image from "next/image";
import { getProfileImageUrl } from "@/utils/url";

interface OrganizationLogoUploadProps {
	currentLogo?: string;
	onLogoUpdate?: (logoUrl: string) => void;
	className?: string;
}

export default function OrganizationLogoUpload({
	currentLogo,
	onLogoUpdate,
	className = "",
}: OrganizationLogoUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewLogo, setPreviewLogo] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadOrganizationLogo] = useUploadOrganizationLogoMutation();

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size must be less than 5MB");
			return;
		}

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setPreviewLogo(e.target?.result as string);
		};
		reader.readAsDataURL(file);

		// Upload file
		handleUpload(file);
	};

	const handleUpload = async (file: File) => {
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("image", file);

			const result = await uploadOrganizationLogo(formData).unwrap();

			if (result.data?.url) {
				toast.success("Logo uploaded successfully!");
				onLogoUpdate?.(result.data.url);
				setPreviewLogo(null);
			}
		} catch (error) {
			toast.error("Failed to upload logo. Please try again.");
			setPreviewLogo(null);
		} finally {
			setIsUploading(false);
		}
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleRemovePreview = () => {
		setPreviewLogo(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const displayLogo = previewLogo || getProfileImageUrl(currentLogo);

	return (
		<div className={`relative ${className}`}>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
			/>

			<div className="flex flex-col items-center space-y-4">
				{/* Logo Display */}
				<div className="relative">
					<div className="h-32 w-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
						{displayLogo ? (
							<Image
								src={displayLogo}
								alt="Organization Logo"
								className="h-full w-full object-cover"
								width={128}
								height={128}
								onError={(e) => {
									e.currentTarget.style.display = "none";
									const parent = e.currentTarget.parentElement;
									if (parent) {
										parent.innerHTML = `
											<div class="flex items-center justify-center h-full w-full bg-gray-100">
												<span class="text-gray-400 text-sm">No Logo</span>
											</div>
										`;
									}
								}}
							/>
						) : (
							<div className="flex flex-col items-center justify-center text-gray-400">
								<Camera size={32} />
								<span className="text-xs mt-1">No Logo</span>
							</div>
						)}
					</div>

					{/* Remove Preview Button */}
					{previewLogo && (
						<button
							onClick={handleRemovePreview}
							className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
						>
							<X size={16} />
						</button>
					)}

					{/* Upload Progress Overlay */}
					{isUploading && (
						<div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
							<div className="text-white text-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
								<span className="text-sm">Uploading...</span>
							</div>
						</div>
					)}
				</div>

				{/* Upload Button */}
				<motion.button
					type="button"
					onClick={handleButtonClick}
					disabled={isUploading}
					className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-teal-400 disabled:cursor-not-allowed"
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<Upload size={16} />
					<span>{currentLogo ? "Change Logo" : "Upload Logo"}</span>
				</motion.button>

				{/* Helper Text */}
				<p className="text-xs text-gray-500 text-center">
					Upload a logo for your organization (max 5MB)
					<br />
					Recommended: Square image, 400x400px
				</p>
			</div>
		</div>
	);
}
