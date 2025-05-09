"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { FiHome, FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
	const router = useRouter();
	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.auth
	);
	const { logout } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);

	// Set isClient to true when component mounts (client-side only)
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Redirect if user is not authenticated
	useEffect(() => {
		if (isClient && !isAuthenticated) {
			router.push("/login");
		}

		// Redirect if profile is not completed
		if (isClient && user && !user.profileCompleted) {
			router.push("/complete-profile");
		}
	}, [isAuthenticated, user, router, isClient]);

	const handleLogout = async () => {
		await logout();
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	// Show loading state while checking authentication
	if (!isClient || !isAuthenticated || !user) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<p className="text-lg">Loading...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Mobile menu button */}
			<div className="lg:hidden fixed top-4 right-4 z-50">
				<button
					onClick={toggleMobileMenu}
					className="p-2 rounded-md text-gray-700 bg-white shadow-md focus:outline-none"
				>
					{isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
				</button>
			</div>

			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform ${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				} lg:translate-x-0 transition-transform duration-300 ease-in-out`}
			>
				<div className="h-full flex flex-col">
					{/* Sidebar header */}
					<div className="px-4 py-6 border-b">
						<h2 className="text-xl font-semibold text-gray-800">
							Charity Donation
						</h2>
						<p className="mt-1 text-sm text-gray-600">
							{user.role === "donor"
								? "Donor Dashboard"
								: "Organization Dashboard"}
						</p>
					</div>

					{/* Sidebar navigation */}
					<nav className="flex-1 px-2 py-4 space-y-1">
						<Link
							href="/dashboard"
							className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
							onClick={() => setIsMobileMenuOpen(false)}
						>
							<FiHome className="mr-3" />
							Dashboard
						</Link>

						<Link
							href="/dashboard/profile"
							className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
							onClick={() => setIsMobileMenuOpen(false)}
						>
							<FiUser className="mr-3" />
							Profile
						</Link>

						{/* Add more navigation links based on user role */}
						{user.role === "donor" && <>{/* Donor specific links */}</>}

						{user.role === "organization" && (
							<>{/* Organization specific links */}</>
						)}
					</nav>

					{/* Sidebar footer */}
					<div className="px-4 py-4 border-t">
						<button
							onClick={handleLogout}
							className="flex items-center w-full px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
						>
							<FiLogOut className="mr-3" />
							Logout
						</button>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="lg:ml-64 min-h-screen">
				<div className="p-6">{children}</div>
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
};

export default DashboardLayout;
