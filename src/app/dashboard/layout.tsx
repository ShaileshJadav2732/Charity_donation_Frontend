"use client";

import { useAuth } from "@/hooks/useAuth";
import { RootState } from "@/store/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	FaBars,
	FaHandsHelping,
	FaHeart,
	FaHome,
	FaSignOutAlt,
	FaTimes,
	FaUser,
	FaUsers,
} from "react-icons/fa";
import { useSelector } from "react-redux";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.auth
	);
	const { logout } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (!isClient) return;

		if (!isAuthenticated) {
			router.push("/login");
			return;
		}

		if (user && !user.profileCompleted) {
			router.push("/complete-profile");
		}
	}, [isAuthenticated, user, router, isClient]);

	const handleLogout = async () => {
		await logout();
		setIsMobileMenuOpen(false);
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	if (!isClient || !isAuthenticated || !user) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-teal-50 to-teal-200">
				<div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-sm w-full">
					<div className="animate-spin h-10 w-10 text-teal-600 mx-auto">
						<svg className="w-full h-full" viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
								fill="none"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
					<p className="mt-4 text-lg font-medium text-gray-600">
						Loading dashboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-teal-100 via-teal-50 to-teal-200">
			{/* Mobile menu button */}
			<div className="lg:hidden fixed top-4 right-4 z-50">
				<button
					onClick={toggleMobileMenu}
					className="p-3 rounded-full text-teal-600 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
					aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
				>
					{isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
				</button>
			</div>

			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl transform ${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				} lg:translate-x-0 transition-transform duration-300 ease-in-out`}
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
						{user.role === "donor" ? (
							<>
								<Link
									href="/dashboard/causes"
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
						) : (
							<>
								<Link
									href="/dashboard/campaigns"
									className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<FaUsers className="mr-3 h-5 w-5 text-teal-600" />
									Campaigns
								</Link>
								<Link
									href="/dashboard/donors"
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
						<button
							onClick={handleLogout}
							className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
						>
							<FaSignOutAlt className="mr-3 h-5 w-5 text-teal-600" />
							Logout
						</button>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="lg:ml-72 min-h-screen">
				<div className="p-8">{children}</div>
			</main>

			{/* Overlay for mobile menu */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}
		</div>
	);
}
