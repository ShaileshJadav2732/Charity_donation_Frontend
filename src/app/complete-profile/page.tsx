"use client";

import NoSSR from "@/components/common/NoSSR";
import DonorProfileForm from "@/components/profile/DonorProfileForm";
import OrganizationProfileForm from "@/components/profile/OrganizationProfileForm";
import { RootState } from "@/store/store";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import { FiAlertCircle, FiUser, FiLogOut } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function CompleteProfilePage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-teal-50 to-teal-200 py-12 px-4 sm:px-6 lg:px-8">
			<NoSSR>
				<CompleteProfileContent />
			</NoSSR>
		</div>
	);
}
function CompleteProfileContent() {
	const { user, isLoading } = useSelector((state: RootState) => state.auth);
	const { logout } = useAuth();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Authentication and redirect logic handled by AuthContext

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	// ✅ Show loading until client + auth is ready
	if (!isClient || isLoading || !user) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="flex items-center justify-center"
			>
				<div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-sm w-full">
					<svg
						className="animate-spin h-10 w-10 text-teal-600 mx-auto"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					<p className="mt-4 text-lg font-medium text-gray-600"></p>
				</div>
			</motion.div>
		);
	}

	// ✅ Error state: invalid user role
	if (!user.role || !["donor", "organization"].includes(user.role)) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-md w-full"
			>
				<FiAlertCircle
					className="h-12 w-12 text-red-500 mx-auto"
					aria-hidden="true"
				/>
				<h1 className="mt-4 text-2xl font-bold text-gray-900">Profile Error</h1>
				<p className="mt-2 text-gray-600">
					We couldn’t find your user role. Please refresh the page or try
					logging in again.
				</p>
			</motion.div>
		);
	}

	// ✅ Main content
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="w-full max-w-2xl"
		>
			<div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
				{/* Header with logout button */}
				<div className="px-8 py-4 border-b border-gray-100 bg-gray-50">
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-2">
							<FiUser className="h-5 w-5 text-teal-600" />
							<span className="text-sm font-medium text-gray-600">
								Profile Setup
							</span>
						</div>
						<div className="flex items-center space-x-3">
							<span className="text-gray-300">|</span>
							<button
								onClick={handleLogout}
								className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-800 transition-colors"
							>
								<FiLogOut className="h-4 w-4" />
								<span>Logout</span>
							</button>
						</div>
					</div>
				</div>

				<div className="px-8 py-10 text-center">
					<div className="flex justify-center mb-6">
						<FiUser className="h-16 w-16 text-teal-600" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900">
						Complete Your {user.role === "donor" ? "Donor" : "Organization"}{" "}
						Profile
					</h1>
					<p className="mt-2 text-sm text-gray-600">
						Add your details to unlock the full GreenGive experience.
					</p>
				</div>
				<div className="px-8 pb-8">
					{user.role === "donor" ? (
						<DonorProfileForm />
					) : (
						<OrganizationProfileForm />
					)}
				</div>
			</div>
		</motion.div>
	);
}
