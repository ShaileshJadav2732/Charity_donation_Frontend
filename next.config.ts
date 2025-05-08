import { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: [
			"lh3.googleusercontent.com", // Google user profile images
			"storage.googleapis.com", // Firebase Storage (if you're using it)
			"firebasestorage.googleapis.com", // Alternative Firebase Storage domain
		],
	},
	reactStrictMode: true,
	server: {
		port: 3001,
	},
	// Keep your existing configuration
};

export default nextConfig;
