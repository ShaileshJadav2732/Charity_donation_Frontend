import { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: [
			"lh3.googleusercontent.com",
			"storage.googleapis.com",
			"firebasestorage.googleapis.com",
			"st2.depositphotos.com",
			"localhost",
			"res.cloudinary.com",
			"cloudinary.com",
		],
	},
	reactStrictMode: true,
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:8080/api/:path*",
			},
		];
	},
};

export default nextConfig;
