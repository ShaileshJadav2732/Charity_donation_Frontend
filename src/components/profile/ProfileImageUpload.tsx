"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { Camera, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUploadProfileImageMutation } from "@/store/api/profileApi";
import Image from "next/image";
import { getProfileImageUrl } from "@/utils/url";

interface ProfileImageUploadProps {
	currentImage?: string;
	onImageUpdate?: (imageUrl: string) => void;
	className?: string;
}

export default function ProfileImageUpload({
	currentImage,
	onImageUpdate,
	className = "",
}: ProfileImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadProfileImage] = useUploadProfileImageMutation();

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
			setPreviewImage(e.target?.result as string);
		};
		reader.readAsDataURL(file);

		// Upload file
		handleUpload(file);
	};

	const handleUpload = async (file: File) => {
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("profileImage", file);

			const result = await uploadProfileImage(formData).unwrap();

			if (result.profileImage) {
				toast.success("Profile image updated successfully!");
				onImageUpdate?.(result.profileImage);
				setPreviewImage(null);
			}
		} catch (error) {
			const errorMessage =
				error && typeof error === "object" && "data" in error
					? (error as { data?: { message?: string } }).data?.message
					: "Failed to upload image";
			toast.error(errorMessage || "Failed to upload image");
			setPreviewImage(null);
		} finally {
			setIsUploading(false);
		}
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleRemovePreview = () => {
		setPreviewImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const displayImage = previewImage || getProfileImageUrl(currentImage);

	return (
		<div className={`relative ${className}`}>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
			/>

			<div className="relative group">
				{/* Profile Image Display */}
				<div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg">
					{displayImage ? (
						<Image
							src={displayImage}
							alt="Profile"
							className="h-full w-full object-cover"
							width={128}
							height={128}
						/>
					) : (
						<div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-green-500">
							<Camera className="h-8 w-8 text-white" />
						</div>
					)}
				</div>

				{/* Upload Button Overlay */}
				<motion.button
					onClick={handleButtonClick}
					disabled={isUploading}
					className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					{isUploading ? (
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
					) : (
						<Upload className="h-6 w-6 text-white" />
					)}
				</motion.button>

				{/* Remove Preview Button */}
				{previewImage && (
					<button
						onClick={handleRemovePreview}
						className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			{/* Upload Instructions */}
			<div className="mt-4 text-center">
				<button
					onClick={handleButtonClick}
					disabled={isUploading}
					className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
				>
					{isUploading ? "Uploading..." : "Change Photo"}
				</button>
				<p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
			</div>
		</div>
	);
}
