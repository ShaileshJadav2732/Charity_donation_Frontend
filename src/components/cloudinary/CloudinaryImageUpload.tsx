"use client";

import { CLOUDINARY_CONFIG } from "@/config/cloudinary.config";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Typography,
} from "@mui/material";
import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface CloudinaryImageUploadProps {
	onImageUpload: (imageUrl: string, publicId: string) => void;
	currentImageUrl?: string;
	disabled?: boolean;
	className?: string;
	label?: string;
	helperText?: string;
}

const CloudinaryImageUpload: React.FC<CloudinaryImageUploadProps> = ({
	onImageUpload,
	currentImageUrl,
	disabled = false,
	className = "",
	label = "Upload Image",
	helperText = "Upload an image for your cause (max 5MB)",
}) => {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || "");
	const [error, setError] = useState<string>("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const validateFile = (file: File): string | null => {
		// Check file size (5MB limit)
		if (file.size > CLOUDINARY_CONFIG.maxFileSize) {
			return "File size must be less than 5MB";
		}

		// Check file type
		const fileExtension = file.name.split(".").pop()?.toLowerCase();
		if (
			!fileExtension ||
			!CLOUDINARY_CONFIG.allowedFormats.includes(fileExtension)
		) {
			return `File type not supported. Allowed formats: ${CLOUDINARY_CONFIG.allowedFormats.join(
				", "
			)}`;
		}

		return null;
	};

	const uploadToCloudinary = async (
		file: File
	): Promise<{ url: string; public_id: string }> => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
		formData.append("folder", CLOUDINARY_CONFIG.folder);

		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
			{
				method: "POST",
				body: formData,
			}
		);

		if (!response.ok) {
			throw new Error("Failed to upload image");
		}

		const data = await response.json();
		return {
			url: data.secure_url,
			public_id: data.public_id,
		};
	};

	const handleFileSelect = useCallback(
		async (file: File) => {
			setError("");

			// Validate file
			const validationError = validateFile(file);
			if (validationError) {
				setError(validationError);
				toast.error(validationError);
				return;
			}

			// Create preview
			const previewUrl = URL.createObjectURL(file);
			setPreviewUrl(previewUrl);
			setIsUploading(true);

			try {
				const result = await uploadToCloudinary(file);
				onImageUpload(result.url, result.public_id);
				toast.success("Image uploaded successfully!");
			} catch (error) {
				setError("Failed to upload image. Please try again.");
				toast.error("Failed to upload image. Please try again.");
				setPreviewUrl(currentImageUrl || "");
			} finally {
				setIsUploading(false);
				// Clean up preview URL
				URL.revokeObjectURL(previewUrl);
			}
		},
		[onImageUpload, currentImageUrl]
	);

	const handleFileInputChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			const file = event.dataTransfer.files?.[0];
			if (file) {
				handleFileSelect(file);
			}
		},
		[handleFileSelect]
	);

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	const handleRemoveImage = () => {
		setPreviewUrl("");
		setError("");
		onImageUpload("", "");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	return (
		<Box className={className}>
			<Typography variant="subtitle1" gutterBottom>
				{label}
			</Typography>

			<Box
				sx={{
					border: "2px dashed #ccc",
					borderRadius: 2,
					p: 3,
					textAlign: "center",
					cursor: disabled ? "not-allowed" : "pointer",
					backgroundColor: disabled ? "#f5f5f5" : "transparent",
					transition: "all 0.3s ease",
					"&:hover": {
						borderColor: disabled ? "#ccc" : "#287068",
						backgroundColor: disabled ? "#f5f5f5" : "#f8f9fa",
					},
				}}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onClick={!disabled && !isUploading ? triggerFileInput : undefined}
			>
				{previewUrl ? (
					<Box sx={{ position: "relative", display: "inline-block" }}>
						<Image
							src={previewUrl}
							alt="Preview"
							width={200}
							height={150}
							style={{
								objectFit: "cover",
								borderRadius: "8px",
							}}
						/>
						{!disabled && (
							<Button
								size="small"
								sx={{
									position: "absolute",
									top: -8,
									right: -8,
									minWidth: "auto",
									width: 32,
									height: 32,
									borderRadius: "50%",
									backgroundColor: "#ef4444",
									color: "white",
									"&:hover": {
										backgroundColor: "#dc2626",
									},
								}}
								onClick={(e) => {
									e.stopPropagation();
									handleRemoveImage();
								}}
							>
								<X size={16} />
							</Button>
						)}
					</Box>
				) : (
					<Box>
						{isUploading ? (
							<Box>
								<CircularProgress size={40} sx={{ color: "#287068", mb: 2 }} />
								<Typography variant="body2" color="text.secondary">
									Uploading image...
								</Typography>
							</Box>
						) : (
							<Box>
								<ImageIcon
									size={48}
									color="#ccc"
									style={{ marginBottom: 16 }}
								/>
								<Typography variant="body1" gutterBottom>
									{disabled
										? "Image upload disabled"
										: "Click to upload or drag and drop"}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{helperText}
								</Typography>
							</Box>
						)}
					</Box>
				)}
			</Box>

			{error && (
				<Alert severity="error" sx={{ mt: 2 }}>
					{error}
				</Alert>
			)}

			<input
				ref={fileInputRef}
				type="file"
				accept={CLOUDINARY_CONFIG.allowedFormats
					.map((format) => `.${format}`)
					.join(",")}
				onChange={handleFileInputChange}
				style={{ display: "none" }}
				disabled={disabled || isUploading}
			/>
		</Box>
	);
};

export default CloudinaryImageUpload;
