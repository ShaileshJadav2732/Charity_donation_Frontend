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
<<<<<<< Updated upstream
=======
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:8080/api/:path*",
			},
		];
	},
>>>>>>> Stashed changes
};

export default nextConfig;
