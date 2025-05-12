// // src/app/dashboard/campaigns/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// // import { useGetCampaignsQuery } from "@/store/api/campaignApi";
// import { useRouteGuard } from "@/hooks/useRouteGuard";
// import {
// 	FaSearch,
// 	FaTag,
// 	FaCalendarAlt,
// 	FaHeart,
// 	FaDonate,
// } from "react-icons/fa";
// import { DonationType } from "@/types/campaings";

// export default function CampaignsPage() {
// 	const searchParams = useSearchParams();
// 	const [page, setPage] = useState(1);
// 	const [search, setSearch] = useState("");
// 	const [status, setStatus] = useState("all");
// 	const [tag, setTag] = useState("");
// 	const [notification, setNotification] = useState<{
// 		type: "error" | "success";
// 		message: string;
// 	} | null>(null);

// 	// Check for 'new' query param to show success notification
// 	useEffect(() => {
// 		if (searchParams.get("new") === "true") {
// 			setPage(1); // Reset to first page to show new campaign
// 			setNotification({
// 				type: "success",
// 				message: "Campaign created successfully",
// 			});
// 			setTimeout(() => setNotification(null), 5000); // Auto-dismiss after 5s
// 		}
// 	}, [searchParams]);

// 	const { data, isLoading, error } = useGetCampaignsQuery({
// 		page,
// 		limit: 10,
// 		search,
// 		status,
// 		tag,
// 	});

// 	// Protect route for organizations only
// 	useRouteGuard("organization");

// 	if (error) {
// 		return (
// 			<div className="container mx-auto px-4 py-8">
// 				<div className="bg-red-100 text-red-800 p-4 rounded-lg text-center">
// 					Error loading campaigns. Please try again later.
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="container mx-auto px-4 py-8 space-y-6">
// 			{notification && (
// 				<div
// 					className={`p-4 rounded-lg ${
// 						notification.type === "error"
// 							? "bg-red-100 text-red-800"
// 							: "bg-green-100 text-green-800"
// 					}`}
// 				>
// 					{notification.message}
// 				</div>
// 			)}

// 			<div className="flex justify-between items-center">
// 				<h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
// 				<Link
// 					href="/dashboard/campaigns/create"
// 					className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
// 				>
// 					<FaHeart className="mr-2" /> Create Campaign
// 				</Link>
// 			</div>

// 			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// 				<div className="relative">
// 					<input
// 						type="text"
// 						placeholder="Search campaigns..."
// 						value={search}
// 						onChange={(e) => setSearch(e.target.value)}
// 						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
// 					/>
// 					<FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// 				</div>
// 				<div className="relative">
// 					<select
// 						value={status}
// 						onChange={(e) => setStatus(e.target.value)}
// 						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
// 					>
// 						<option value="all">All Status</option>
// 						<option value="draft">Draft</option>
// 						<option value="active">Active</option>
// 						<option value="completed">Completed</option>
// 						<option value="cancelled">Cancelled</option>
// 					</select>
// 					<FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// 				</div>
// 				<div className="relative">
// 					<input
// 						type="text"
// 						placeholder="Filter by tag..."
// 						value={tag}
// 						onChange={(e) => setTag(e.target.value)}
// 						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
// 					/>
// 					<FaTag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// 				</div>
// 			</div>

// 			{isLoading ? (
// 				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// 					{[...Array(6)].map((_, i) => (
// 						<div
// 							key={i}
// 							className="bg-white rounded-xl shadow-md p-6 animate-pulse"
// 						>
// 							<div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
// 							<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
// 							<div className="h-4 bg-gray-200 rounded w-1/2"></div>
// 						</div>
// 					))}
// 				</div>
// 			) : (
// 				<>
// 					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// 						{data?.campaigns?.map((campaign) => (
// 							<Link
// 								key={campaign.id}
// 								href={`/dashboard/campaigns/${campaign.id}`}
// 								className="block"
// 							>
// 								<div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
// 									<div className="relative">
// 										<img
// 											src={campaign.imageUrl || "/placeholder.png"}
// 											alt={campaign.title}
// 											className="w-full h-48 object-cover rounded-lg mb-4"
// 										/>
// 										<span
// 											className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
// 												campaign.status === "active"
// 													? "bg-green-100 text-green-800"
// 													: campaign.status === "completed"
// 													? "bg-blue-100 text-blue-800"
// 													: campaign.status === "cancelled"
// 													? "bg-red-100 text-red-800"
// 													: "bg-gray-100 text-gray-800"
// 											}`}
// 										>
// 											{campaign.status}
// 										</span>
// 									</div>
// 									<h3 className="text-lg font-semibold text-gray-900 mb-2">
// 										{campaign.title}
// 									</h3>
// 									<p className="text-sm text-gray-600 mb-4 line-clamp-2">
// 										{campaign.description}
// 									</p>
// 									<div className="flex flex-wrap gap-2 mb-4">
// 										{campaign.acceptedDonationTypes.map((type) => (
// 											<span
// 												key={type}
// 												className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs flex items-center"
// 											>
// 												<FaDonate className="mr-1" /> {type}
// 											</span>
// 										))}
// 									</div>
// 									<div className="flex justify-between items-center text-sm text-gray-600">
// 										<span>
// 											${campaign.totalRaisedAmount.toLocaleString()} / $
// 											{campaign.totalTargetAmount.toLocaleString()}
// 										</span>
// 										<span className="flex items-center">
// 											<FaHeart className="mr-1 text-teal-600" />{" "}
// 											{campaign.totalSupporters} supporters
// 										</span>
// 									</div>
// 								</div>
// 							</Link>
// 						))}
// 					</div>

// 					{data && data.total > 0 && (
// 						<div className="flex justify-center gap-4 mt-8">
// 							<button
// 								onClick={() => setPage(page - 1)}
// 								disabled={page === 1}
// 								className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-200"
// 							>
// 								Previous
// 							</button>
// 							<button
// 								onClick={() => setPage(page + 1)}
// 								disabled={page * 10 >= data.total}
// 								className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-200"
// 							>
// 								Next
// 							</button>
// 						</div>
// 					)}

// 					{data?.campaigns?.length === 0 && (
// 						<div className="text-center py-8 text-gray-600">
// 							No campaigns found
// 						</div>
// 					)}
// 				</>
// 			)}
// 		</div>
// 	);
// }
import React from "react";

const page = () => {
	return <div>page</div>;
};

export default page;
