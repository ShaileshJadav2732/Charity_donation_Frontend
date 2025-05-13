"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCampaignsQuery } from "@/store/api/campaignApi";
import {
	Search,
	Filter,
	Users,
	Calendar,
	Clock,
	MoreHorizontal,
	Heart,
} from "lucide-react";

export default function CampaignsPage() {
	const router = useRouter();
	const [searchInput, setSearchInput] = useState("");
	const [page, setPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const { data: campaignsData, isLoading } = useGetCampaignsQuery({
		page,
		search: searchInput,
	});

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
				<h1 className="text-3xl font-bold text-gray-900">Browse Campaigns</h1>
				<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
					<form
						onSubmit={handleSearch}
						className="relative flex-1 sm:flex-none"
					>
						<input
							type="text"
							placeholder="Search campaigns..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
						/>
						<button
							type="submit"
							className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
						>
							<Search className="h-5 w-5" />
						</button>
					</form>
					<button
						onClick={() => setIsFilterOpen(!isFilterOpen)}
						className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
					>
						<Filter className="h-5 w-5" />
						Filter
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<div
							key={i}
							className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
						>
							<div className="h-48 bg-gray-200 rounded-lg mb-4" />
							<div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
							<div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
							<div className="h-4 bg-gray-200 rounded w-full mb-2" />
							<div className="h-4 bg-gray-200 rounded w-2/3" />
						</div>
					))}
				</div>
			) : campaignsData?.campaigns.length === 0 ? (
				<div className="text-center py-12">
					<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No campaigns found
					</h3>
					<p className="text-gray-500">
						{searchInput
							? "Try adjusting your search"
							: "There are no campaigns available at the moment"}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{campaignsData?.campaigns.map((campaign) => (
						<div
							key={campaign.id}
							className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
						>
							<div className="relative h-48">
								<img
									src={campaign.imageUrl}
									alt={campaign.title}
									className="w-full h-full object-cover"
								/>
								<div className="absolute top-4 right-4">
									<button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
										<MoreHorizontal className="h-5 w-5 text-gray-600" />
									</button>
								</div>
							</div>
							<div className="p-6">
								<div className="flex items-center gap-2 mb-2">
									<Users className="h-5 w-5 text-teal-600" />
									<span className="text-sm font-medium text-teal-600">
										{campaign.causeCount} Causes
									</span>
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{campaign.title}
								</h3>
								<p className="text-gray-600 mb-4 line-clamp-2">
									{campaign.description}
								</p>
								<div className="space-y-3">
									<div className="flex items-center justify-between text-sm text-gray-500">
										<div className="flex items-center gap-1">
											<Calendar className="h-4 w-4" />
											<span>
												{new Date(campaign.startDate).toLocaleDateString()} -{" "}
												{new Date(campaign.endDate).toLocaleDateString()}
											</span>
										</div>
										<div className="flex items-center gap-1">
											<Heart className="h-4 w-4" />
											<span>{campaign.donorCount} donors</span>
										</div>
									</div>
									<div className="flex items-center gap-1 text-sm text-gray-500">
										<Clock className="h-4 w-4" />
										<span>
											Created{" "}
											{new Date(campaign.createdAt).toLocaleDateString()}
										</span>
									</div>
								</div>
								<button
									onClick={() => router.push(`/campaigns/${campaign.id}`)}
									className="mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors duration-200"
								>
									View Details
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{campaignsData && campaignsData.totalPages > 1 && (
				<div className="mt-8 flex justify-center gap-2">
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
						className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
					>
						Previous
					</button>
					<span className="px-4 py-2 text-gray-600">
						Page {page} of {campaignsData.totalPages}
					</span>
					<button
						onClick={() =>
							setPage((p) => Math.min(campaignsData.totalPages, p + 1))
						}
						disabled={page === campaignsData.totalPages}
						className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}
