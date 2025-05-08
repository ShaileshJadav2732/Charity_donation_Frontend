"use client";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../hooks/reduxHooks";
import {
	FaUser,
	FaGift,
	FaHandsHelping,
	FaSignOutAlt,
	FaBars,
} from "react-icons/fa";
import { useState } from "react";

export default function DonorSidebar({ onLogout }: { onLogout: () => void }) {
	const router = useRouter();
	const { user } = useAppSelector((state) => state.auth);
	const [open, setOpen] = useState(false);

	return (
		<div className="flex flex-col h-full bg-white border-r shadow-lg w-64 min-w-[16rem]">
			{/* Hamburger for mobile */}
			<div className="md:hidden flex items-center p-4">
				<button onClick={() => setOpen(!open)}>
					<FaBars size={24} />
				</button>
			</div>
			{/* Sidebar content */}
			<div className={`flex-1 flex flex-col ${open ? "" : "hidden md:flex"}`}>
				<div className="flex flex-col items-center py-8">
					<div className="h-20 w-20 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center">
						{user?.photoURL ? (
							<img
								src={user.photoURL}
								alt="Profile"
								className="h-full w-full object-cover"
							/>
						) : (
							<FaUser className="text-indigo-400 text-4xl" />
						)}
					</div>
					<div className="mt-4 text-center">
						<div className="font-semibold text-lg">
							{user?.displayName || user?.email?.split("@")[0] || "Donor"}
						</div>
						<div className="text-xs text-gray-500">{user?.email}</div>
					</div>
				</div>
				<nav className="flex-1 px-4 space-y-2">
					<button
						className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-indigo-50 text-gray-700"
						onClick={() => router.push("/donor/dashboard")}
					>
						<FaUser /> Profile
					</button>
					<button
						className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-indigo-50 text-gray-700"
						onClick={() => router.push("/donor/donations")}
					>
						<FaGift /> Donations
					</button>
					<button
						className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-indigo-50 text-gray-700"
						onClick={() => router.push("/charity")}
					>
						<FaHandsHelping /> Charity
					</button>
				</nav>
				<div className="mt-auto mb-4 px-4">
					<button
						className="w-full flex items-center gap-3 px-4 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
						onClick={onLogout}
					>
						<FaSignOutAlt /> Logout
					</button>
				</div>
			</div>
		</div>
	);
}
