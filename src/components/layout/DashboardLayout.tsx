"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import {
	FaHome,
	FaUser,
	FaSignOutAlt,
	FaBars,
	FaTimes,
	FaHeart,
	FaHandsHelping,
	FaUsers,
	FaExclamationCircle,
	FaHandHoldingHeart,
} from "react-icons/fa";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
	const router = useRouter();
	const { user, isAuthenticated, error } = useSelector(
		(state: RootState) => state.auth
	);
	const { logout: authLogout } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);

	// Debug state
	useEffect(() => {
		setIsClient(true);
		console.log("DashboardLayout: State", {
			isClient,
			isAuthenticated,
			user,
			profileCompleted: user?.profileCompleted,
			error,
		});
	}, [isClient, isAuthenticated, user, error]);

	// Redirect if not authenticated or profile incomplete
	useEffect(() => {
		if (!isClient) return;

		if (!isAuthenticated) {
			console.log("DashboardLayout: Not authenticated, redirecting to /login");
			router.push("/login");
			return;
		}

		if (user && !user.profileCompleted) {
			console.log(
				"DashboardLayout: Profile not completed, redirecting to /complete-profile"
			);
			router.push("/complete-profile");
		}
	}, [isAuthenticated, user, router, isClient]);

	const handleLogout = async () => {
		console.log("DashboardLayout: Initiating logout");
		await authLogout();
		setIsMobileMenuOpen(false);
	};

	// Loading or error state
	if (!isClient || !isAuthenticated || !user) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-teal-50 to-teal-200"
			>
				<div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-md w-full">
					{error ? (
						<>
							<FaExclamationCircle
								className="h-12 w-12 text-red-500 mx-auto"
								aria-hidden="true"
							/>
							<p className="mt-4 text-lg font-medium text-gray-600">{error}</p>
							<a
								href="/login"
								className="mt-6 inline-block px-6 py-3 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
							>
								Go to Login
							</a>
						</>
					) : (
						<>
							<svg
								className="animate-spin h-10 w-10 text-teal-600 mx-auto"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
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
							<p className="mt-4 text-lg font-medium text-gray-600">
								Loading dashboard...
							</p>
						</>
					)}
				</div>
			</motion.div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-teal-100 via-teal-50 to-teal-200">
			{/* Mobile menu button */}
			<motion.div
				className="lg:hidden fixed top-4 right-4 z-50"
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
			>
				<button
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					className="p-3 rounded-full text-teal-600 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
					aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
				>
					{isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
				</button>
			</motion.div>

			{/* Sidebar */}
			<motion.aside
				className={`fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl transform ${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				} lg:translate-x-0 transition-transform duration-300 ease-in-out`}
				initial={{ x: -288 }}
				animate={{ x: isMobileMenuOpen ? 0 : -288 }}
				transition={{ duration: 0.3 }}
			>
				<div className="h-full flex flex-col">
					{/* Sidebar header */}
					<div className="px-6 py-8 border-b border-gray-200">
						<h2 className="text-2xl font-bold text-teal-600">GreenGive</h2>
						<p className="mt-2 text-sm text-gray-600">
							{user.role === "donor"
								? "Donor Dashboard"
								: "Organization Dashboard"}
						</p>
					</div>

					{/* Sidebar navigation */}
					<nav className="flex-1 px-4 py-6 space-y-2">
						<Link
							href="/dashboard"
							className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
							onClick={() => setIsMobileMenuOpen(false)}
						>
							<FaHome className="mr-3 h-5 w-5 text-teal-600" />
							Dashboard
						</Link>
						<Link
							href="/dashboard/profile"
							className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
							onClick={() => setIsMobileMenuOpen(false)}
						>
							<FaUser className="mr-3 h-5 w-5 text-teal-600" />
							Profile
						</Link>
						{user.role === "donor" && (
							<>
								<Link
									href="/dashboard/donations/new"
									className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<FaHandHoldingHeart className="mr-3 h-5 w-5 text-teal-600" />
									Donate Now
								</Link>
								<Link
									href="/causes"
									className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<FaHandsHelping className="mr-3 h-5 w-5 text-teal-600" />
									Causes
								</Link>
								<Link
									href="/dashboard/donations"
									className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<FaHeart className="mr-3 h-5 w-5 text-teal-600" />
									My Donations
								</Link>
							</>
						)}
						{user.role === "organization" && (
							<>
								<Link
									href="/campaigns"
									className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<FaUsers className="mr-3 h-5 w-5 text-teal-600" />
									Campaigns
								</Link>
								<Link
									href="/donors"
									className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<FaHeart className="mr-3 h-5 w-5 text-teal-600" />
									Donors
								</Link>
							</>
						)}
					</nav>

					{/* Sidebar footer */}
					<div className="px-6 py-6 border-t border-gray-200">
						<motion.button
							onClick={handleLogout}
							className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<FaSignOutAlt className="mr-3 h-5 w-5 text-teal-600" />
							Logout
						</motion.button>
					</div>
				</div>
			</motion.aside>

			{/* Main content */}
			<main className="lg:ml-72 min-h-screen">
				<div className="p-8">{children}</div>
			</main>

			{/* Overlay for mobile menu */}
			{isMobileMenuOpen && (
				<motion.div
					className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				/>
			)}
		</div>
	);
};

export default DashboardLayout;
