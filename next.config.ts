import { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: [
			"lh3.googleusercontent.com",
			"storage.googleapis.com",
			"firebasestorage.googleapis.com",
			"st2.depositphotos.com",
			"localhost",
		],
	},
	reactStrictMode: true,
};

export default nextConfig;
