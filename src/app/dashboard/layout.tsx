"use client";

import RealTimeNotificationList from "@/components/notifications/RealTimeNotificationList";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/lib/AuthGuard";
import { RootState } from "@/store/store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
	useGetDonorProfileQuery,
	useGetOrganizationProfileQuery,
} from "@/store/api/profileApi";
import { useGetUnreadCountQuery } from "@/store/api/messageApi";
import { getProfileImageUrl } from "@/utils/url";
import {
	FaBars,
	FaBell,
	FaChartBar,
	FaHandsHelping,
	FaHeart,
	FaHome,
	FaSignOutAlt,
	FaTimes,
	FaUsers,
	FaComments,
} from "react-icons/fa";
import { useSelector } from "react-redux";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const { user } = useSelector((state: RootState) => state.auth);
	const { logout } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	// Use real-time notifications
	const { unreadCount } = useSocket();

	// Fetch profile data based on user role
	const { data: donorData } = useGetDonorProfileQuery(undefined, {
		skip: user?.role !== "donor",
	});

	const { data: orgData } = useGetOrganizationProfileQuery(undefined, {
		skip: user?.role !== "organization",
	});

	// Get unread message count
	const { data: unreadMessagesData } = useGetUnreadCountQuery();

	// Get profile image
	const profileImage =
		user?.role === "donor"
			? donorData?.profile?.profileImage
			: orgData?.profile?.logo;

	useEffect(() => {
		const handleScroll = () => {
			const isScrolled = window.scrollY > 10;
			if (isScrolled !== scrolled) {
				setScrolled(isScrolled);
			}
		};

		document.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			document.removeEventListener("scroll", handleScroll);
		};
	}, [scrolled]);

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
					{
						icon: FaComments,
						text: "Messages",
						path: "/dashboard/messages",
					},
					{
						icon: FaChartBar,
						text: "Analytics",
						path: "/dashboard/analytics/donations",
					},
			  ]
			: [
					{
						icon: FaUsers,
						text: "Campaigns",
						path: "/dashboard/campaigns",
					},
					{
						icon: FaHandsHelping,
						text: "Causes",
						path: "/dashboard/causes",
					},
					{
						icon: FaUsers,
						text: "Donation",
						path: "/dashboard/donations/pending",
					},
					{
						icon: FaHeart,
						text: "Donors",
						path: "/dashboard/donors",
					},
					{
						icon: FaComments,
						text: "Messages",
						path: "/dashboard/messages",
					},
					{
						icon: FaChartBar,
						text: "Analytics",
						path: "/dashboard/analytics",
					},
			  ]),
	];

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gradient-to-br from-teal-100 via-teal-50 to-teal-200">
				{/* Top Navigation Bar */}
				<div
					className={`fixed top-0 left-0 right-0 z-40 bg-white shadow-md h-16 flex items-center px-4 lg:pl-6 transition-all duration-300 ${
						scrolled ? "shadow-lg" : ""
					}`}
				>
					{/* Left side: Hamburger menu (mobile only) + Logo */}
					<div className="flex items-center space-x-4">
						{/* Mobile Hamburger Menu Button */}
						<button
							onClick={toggleMobileMenu}
							className="lg:hidden p-2 rounded-lg text-teal-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
							aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
						>
							{isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
						</button>

						{/* GreenGive logo/text */}
						<span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
							GreenGive
						</span>
					</div>

					{/* Spacer */}
					<div className="flex-1" />

					{/* Right side: Profile + Notifications */}
					<div className="flex items-center space-x-4">
						{/* Profile Button */}
						<Link
							href="/dashboard/profile"
							className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
							title="Profile"
						>
							<div className="h-8 w-8 rounded-full border-2 border-teal-200 overflow-hidden bg-gray-200">
								{profileImage ? (
									<Image
										src={getProfileImageUrl(profileImage)}
										alt="Profile"
										className="h-full w-full object-cover"
										width={32}
										height={32}
										onError={(e) => {
											// Fallback to default avatar on error
											e.currentTarget.src = "/default-avatar.svg";
										}}
									/>
								) : (
									<div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-green-500">
										<span className="text-white text-xs font-bold">
											{user?.email?.[0]?.toUpperCase() || "?"}
										</span>
									</div>
								)}
							</div>
						</Link>

						{/* Notification Button */}
						<button
							onClick={toggleNotifications}
							className="relative p-2 rounded-full hover:bg-gray-100"
						>
							<FaBell className="h-6 w-6 text-teal-600" />
							{unreadCount > 0 && (
								<span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
									{unreadCount}
								</span>
							)}
						</button>
					</div>
				</div>

				{/* Notifications Panel */}
				{showNotifications && (
					<div className="fixed top-16 right-4 z-50">
						<RealTimeNotificationList
							onClose={() => setShowNotifications(false)}
						/>
					</div>
				)}

				{/* Sidebar */}
				<aside
					className={`fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-2xl transform ${
						isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
					} lg:translate-x-0 transition-transform duration-300 ease-in-out pt-16 overflow-y-auto`}
				>
					<div className="h-full flex flex-col">
						{/* Sidebar navigation */}
						<nav className="flex-1 px-4 py-6 space-y-2">
							{menuItems.map((item) => (
								<Link
									key={item.path}
									href={item.path}
									className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
										pathname === item.path
											? "bg-teal-50 text-teal-600"
											: "text-gray-700 hover:bg-teal-50 hover:text-teal-600"
									}`}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<div className="flex items-center">
										<item.icon className="mr-3 h-5 w-5" />
										{item.text}
									</div>
									{item.text === "Messages" &&
										unreadMessagesData?.count &&
										unreadMessagesData.count > 0 && (
											<span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
												{unreadMessagesData.count}
											</span>
										)}
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
			</div>
		</AuthGuard>
	);
}
