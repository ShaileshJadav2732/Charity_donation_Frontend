// Frontend-only Cloudinary configuration (no Node.js dependencies)

// Cloudinary configuration for frontend
export const CLOUDINARY_CONFIG = {
	cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "charity",
	folder: "charity-donation/causes",
	maxFileSize: 5 * 1024 * 1024, // 5MB
	allowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
	transformation: {
		width: 800,
		height: 600,
		crop: "fill",
		quality: "auto",
		fetch_format: "auto",
	},
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (
	publicId: string,
	options?: {
		width?: number;
		height?: number;
		crop?: string;
		quality?: string;
	}
): string => {
	if (!publicId || !CLOUDINARY_CONFIG.cloudName) {
		return "";
	}

	const {
		width = 800,
		height = 600,
		crop = "fill",
		quality = "auto",
	} = options || {};

	return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_auto/${publicId}`;
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string => {
	if (!url || !url.includes("cloudinary.com")) {
		return "";
	}

	try {
		const parts = url.split("/");
		const uploadIndex = parts.findIndex((part) => part === "upload");
		if (uploadIndex === -1) return "";

		// Get everything after the transformation parameters
		const afterUpload = parts.slice(uploadIndex + 1);
		// Remove version if present (starts with 'v' followed by numbers)
		const withoutVersion = afterUpload.filter((part) => !/^v\d+$/.test(part));
		// Join the remaining parts and remove file extension
		const publicId = withoutVersion.join("/").replace(/\.[^/.]+$/, "");

		return publicId;
	} catch {
		// Silently handle error
		return "";
	}
};
