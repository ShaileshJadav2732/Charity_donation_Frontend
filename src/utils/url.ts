/**
 * Utility functions for URL construction
 */

/**
 * Get the base URL for API calls (includes /api)
 */
export const getApiBaseUrl = (): string => {
	return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
};

/**
 * Get the base URL for static files (excludes /api)
 */
export const getStaticBaseUrl = (): string => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
	return apiUrl.replace("/api", "");
};

/**
 * Construct a full URL for static files (images, documents, etc.)
 * @param path - The relative path starting with /uploads/...
 */
export const getStaticFileUrl = (path: string): string => {
	if (!path) return "";
	return `${getStaticBaseUrl()}${path}`;
};

/**
 * Construct a full URL for profile images
 * @param imagePath - The relative path to the profile image or full Cloudinary URL
 */
export const getProfileImageUrl = (imagePath?: string): string => {
	if (!imagePath) return "";

	// AGGRESSIVE FILTERING: Only allow Cloudinary URLs
	if (imagePath.startsWith("http")) {
		// Only allow Cloudinary URLs
		if (
			imagePath.includes("cloudinary.com") ||
			imagePath.includes("res.cloudinary.com")
		) {
			return imagePath;
		} else {
			console.warn("Non-Cloudinary URL blocked:", imagePath);
			return "";
		}
	}

	// Block ALL local file paths - we only use Cloudinary now
	console.warn("Local file path blocked, using fallback avatar:", imagePath);
	return "";
};

/**
 * Construct a full URL for receipt images
 * @param imagePath - The relative path to the receipt image or full Cloudinary URL
 */
export const getReceiptImageUrl = (imagePath?: string): string => {
	if (!imagePath) return "";

	// If it's already a full URL (Cloudinary), return as is
	if (imagePath.startsWith("http")) {
		return imagePath;
	}

	// Otherwise, construct local URL
	return getStaticFileUrl(imagePath);
};
