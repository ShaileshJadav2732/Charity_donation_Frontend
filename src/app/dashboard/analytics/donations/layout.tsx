"use client";

import { DonationType } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
	FaBook,
	FaChartPie,
	FaCouch,
	FaHome,
	FaQuestion,
	FaTshirt,
	FaUtensils,
} from "react-icons/fa";
import { GiBlood } from "react-icons/gi";

interface DonationAnalyticsLayoutProps {
	children: ReactNode;
}

export default function DonationAnalyticsLayout({
	children,
}: DonationAnalyticsLayoutProps) {
	const pathname = usePathname();

	const donationTypes = [
		{
			type: DonationType.CLOTHES,
			icon: <FaTshirt className="h-4 w-4" />,
			label: "Clothes",
		},
		{
			type: DonationType.FOOD,
			icon: <FaUtensils className="h-4 w-4" />,
			label: "Food",
		},
		{
			type: DonationType.BLOOD,
			icon: <GiBlood className="h-4 w-4" />,
			label: "Blood",
		},
		{
			type: DonationType.BOOKS,
			icon: <FaBook className="h-4 w-4" />,
			label: "Books",
		},
		{
			type: DonationType.FURNITURE,
			icon: <FaCouch className="h-4 w-4" />,
			label: "Furniture",
		},
		{
			type: DonationType.HOUSEHOLD,
			icon: <FaHome className="h-4 w-4" />,
			label: "Household",
		},
		{
			type: DonationType.OTHER,
			icon: <FaQuestion className="h-4 w-4" />,
			label: "Other",
		},
	];

	return (
		<div className="flex flex-col">
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex overflow-x-auto py-3 gap-4">
						<Link
							href="/dashboard/analytics/donations"
							className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
								pathname === "/dashboard/analytics/donations" ||
								pathname === "/dashboard/analytics/donations/"
									? "bg-teal-100 text-teal-700"
									: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
							}`}
						>
							<FaChartPie className="mr-2 h-4 w-4" />
							Overview
						</Link>

						{donationTypes.map((item) => (
							<Link
								key={item.type}
								href={`/dashboard/analytics/donations/${item.type}`}
								className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
									pathname?.includes(
										`/dashboard/analytics/donations/${item.type}`
									)
										? "bg-teal-100 text-teal-700"
										: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
								}`}
							>
								<span className="mr-2">{item.icon}</span>
								{item.label}
							</Link>
						))}
					</div>
				</div>
			</div>

			<div className="flex-1 px-4 sm:px-6 lg:px-8 py-4">{children}</div>
		</div>
	);
}
