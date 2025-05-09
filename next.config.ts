import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "storage.googleapis.com",
      "firebasestorage.googleapis.com",
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
