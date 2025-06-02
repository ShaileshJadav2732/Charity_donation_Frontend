import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate configuration
if (
	!process.env.CLOUDINARY_CLOUD_NAME ||
	!process.env.CLOUDINARY_API_KEY ||
	!process.env.CLOUDINARY_API_SECRET
) {
	console.warn("⚠️ Cloudinary configuration incomplete. Please check environment variables.");
}

export default cloudinary;

// Note: Frontend config moved to separate file to avoid Node.js imports in browser

// Backend-only helper functions for Cloudinary operations

// Helper function to upload files to Cloudinary (supports images and PDFs)
export const uploadToCloudinary = async (
	file: Express.Multer.File,
	folder: string = "causes"
): Promise<{ url: string; public_id: string }> => {
	try {
		console.log("🔄 Starting Cloudinary upload...");
		console.log("📁 File path:", file.path);
		console.log("📁 File mimetype:", file.mimetype);
		console.log("📁 Folder:", folder);

		// Check if file exists
		const fs = require("fs");
		if (!fs.existsSync(file.path)) {
			throw new Error(`File does not exist at path: ${file.path}`);
		}

		// Determine resource type based on file type
		const isPdf = file.mimetype === 'application/pdf';
		const resourceType = isPdf ? "raw" : "image";

		// Different upload options for images vs PDFs
		const uploadOptions: any = {
			folder: `charity-donation/${folder}`,
			resource_type: resourceType,
		};

		// Only apply transformations to images
		if (!isPdf) {
			uploadOptions.transformation = [
				{ width: 800, height: 600, crop: "fill", quality: "auto" },
				{ fetch_format: "auto" },
			];
		}

		console.log("⚙️ Upload options:", uploadOptions);
		const result = await cloudinary.uploader.upload(file.path, uploadOptions);
		console.log("✅ Cloudinary upload successful:", result.secure_url);

		// Clean up temporary file
		const fs = require("fs");
		if (fs.existsSync(file.path)) {
			fs.unlinkSync(file.path);
		}

		return {
			url: result.secure_url,
			public_id: result.public_id,
		};
	} catch (error) {
		// Clean up temporary file even on error
		const fs = require("fs");
		if (file.path && fs.existsSync(file.path)) {
			fs.unlinkSync(file.path);
		}
		console.error("Cloudinary upload error:", error);
		throw new Error("Failed to upload file to Cloudinary");
	}
};

// Helper function to upload buffer to Cloudinary (for memory uploads)
export const uploadBufferToCloudinary = async (
	buffer: Buffer,
	folder: string = "causes",
	transformation?: any
): Promise<{ url: string; public_id: string; secure_url: string }> => {
	try {
		console.log("🔄 Starting Cloudinary buffer upload...");
		console.log("📁 Folder:", folder);

		return new Promise((resolve, reject) => {
			const uploadOptions: any = {
				folder: `charity-donation/${folder}`,
				resource_type: "image",
			};

			// Apply transformations if provided
			if (transformation) {
				uploadOptions.transformation = transformation;
			} else {
				uploadOptions.transformation = [
					{ width: 800, height: 600, crop: "fill", quality: "auto" },
					{ fetch_format: "auto" },
				];
			}

			console.log("⚙️ Upload options:", uploadOptions);

			cloudinary.uploader.upload_stream(
				uploadOptions,
				(error, result) => {
					if (error) {
						console.error("❌ Cloudinary buffer upload error:", error);
						reject(new Error("Failed to upload buffer to Cloudinary"));
					} else if (result) {
						console.log("✅ Cloudinary buffer upload successful:", result.secure_url);
						resolve({
							url: result.secure_url,
							public_id: result.public_id,
							secure_url: result.secure_url,
						});
					} else {
						reject(new Error("No result from Cloudinary upload"));
					}
				}
			).end(buffer);
		});
	} catch (error) {
		console.error("Cloudinary buffer upload error:", error);
		throw new Error("Failed to upload buffer to Cloudinary");
	}
};

// Helper function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
	try {
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.error("Cloudinary delete error:", error);
		throw new Error("Failed to delete file from Cloudinary");
	}
};
