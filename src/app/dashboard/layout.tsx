"use client";

import { useAuth } from "@/hooks/useAuth";
import { RootState } from "@/store/store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
	FaBars,
	FaHandsHelping,
	FaHeart,
	FaHome,
	FaSignOutAlt,
	FaTimes,
	FaUser,
	FaUsers,
	FaBell,
	FaChartBar,
	FaComments,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useGetUserNotificationsQuery } from "@/store/api/notificationApi";
import NotificationList from "@/components/notifications/NotificationList";
import AuthGuard from '@/lib/AuthGuard';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.auth
	);
	const { logout } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);

	const { data: notificationData } = useGetUserNotificationsQuery({
		limit: 5,
		unreadOnly: true,
	});

	const handleLogout = async () => {
		await logout();
		setIsMobileMenuOpen(false);
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const toggleNotifications = () => {
		setShowNotifications(!showNotifications);
	};

	const menuItems = [
		{ icon: FaHome, text: "Home", path: "/dashboard/home" },
		{ icon: FaUser, text: "Profile", path: "/dashboard/profile" },
		...(user?.role === "donor"
			? [
				{
					icon: FaHandsHelping,
					text: "Causes",
					path: "/dashboard/causes",
				},
				{
					icon: FaHeart,
					text: "My Donations",
					path: "/dashboard/donations",
				},
			]
			: [
				{
					icon: FaUsers,
					text: "Campaigns",
					path: "/dashboard/campaigns",
				},
				{
					icon: FaHeart,
					text: "Donors",
					path: "/dashboard/donors",
				},
				{
					icon: FaChartBar,
					text: "Analytics",
					path: "/dashboard/analytics",
				},
				{
					icon: FaComments,
					text: "Feedback",
					path: "/dashboard/feedback",
				},
			]),
	];

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gradient-to-br from-teal-100 via-teal-50 to-teal-200">
				{/* Top Navigation Bar */}
				<div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md h-16 flex items-center px-4 lg:pl-80">
					<div className="flex-1" />
					<div className="flex items-center space-x-4">
						<button
							onClick={toggleNotifications}
							className="relative p-2 rounded-full hover:bg-gray-100"
						>
							<FaBell className="h-6 w-6 text-teal-600" />
							{notificationData?.unreadCount ? (
								<span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
									{notificationData.unreadCount}
								</span>
							) : null}
						</button>
					</div>
				</div>

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

				{/* Notifications Panel */}
				{showNotifications && (
					<div className="fixed top-16 right-4 z-50">
						<div className="bg-white rounded-lg shadow-xl">
							<NotificationList onClose={() => setShowNotifications(false)} />
						</div>
					</div>
				)}

				{/* Sidebar */}
				<aside
					className={`fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-2xl transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
						} lg:translate-x-0 transition-transform duration-300 ease-in-out pt-16`}
				>
					<div className="h-full flex flex-col">
						{/* Sidebar header */}
						<div className="px-6 py-8 border-b border-gray-200">
							<h2 className="text-2xl font-bold text-teal-600">GreenGive</h2>
							<p className="mt-2 text-sm text-gray-600">
								{user?.role === "donor"
									? "Donor Dashboard"
									: "Organization Dashboard"}
							</p>
						</div>

						{/* Sidebar navigation */}
						<nav className="flex-1 px-4 py-6 space-y-2">
							{menuItems.map((item) => (
								<Link
									key={item.path}
									href={item.path}
									className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${pathname === item.path
										? "bg-teal-50 text-teal-600"
										: "text-gray-700 hover:bg-teal-50 hover:text-teal-600"
										}`}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<item.icon className="mr-3 h-5 w-5" />
									{item.text}
								</Link>
							))}
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
				<main className="lg:ml-72 pt-16 min-h-screen">
					<div className="p-8">{children}</div>
				</main>

				{/* Overlay for mobile menu */}
				{isMobileMenuOpen && (
					<div
						className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
						onClick={() => setIsMobileMenuOpen(false)}
					/>
				)}
			</div>
		</AuthGuard>
	);
}
