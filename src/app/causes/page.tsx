"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCausesQuery } from "@/store/api/causeApi";
import { DonationType } from "@/types/cause";
import {
	Search,
	Filter,
	Heart,
	DollarSign,
	Gift,
	Clock,
	Users,
	MoreHorizontal,
	LucideIcon,
} from "lucide-react";

const donationTypeIcons: Record<DonationType, LucideIcon> = {
	[DonationType.MONETARY]: DollarSign,
	[DonationType.IN_KIND]: Gift,
	[DonationType.VOLUNTEER]: Users,
};

export default function CausesPage() {
	const router = useRouter();
	const [searchInput, setSearchInput] = useState("");
	const [page, setPage] = useState(1);
	const [selectedDonationType, setSelectedDonationType] = useState<
		DonationType | "all"
	>("all");
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const { data: causesData, isLoading } = useGetCausesQuery({
		page,
		search: searchInput,
		donationType:
			selectedDonationType !== "all" ? selectedDonationType : undefined,
	});

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
	};

	const handleDonationTypeChange = (type: DonationType | "all") => {
		setSelectedDonationType(type);
		setPage(1);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
				<h1 className="text-3xl font-bold text-gray-900">Browse Causes</h1>
				<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
					<form
						onSubmit={handleSearch}
						className="relative flex-1 sm:flex-none"
					>
						<input
							type="text"
							placeholder="Search causes..."
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

			{isFilterOpen && (
				<div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
					<h3 className="text-sm font-medium text-gray-700 mb-3">
						Donation Type
					</h3>
					<div className="flex flex-wrap gap-2">
						<button
							onClick={() => handleDonationTypeChange("all")}
							className={`px-3 py-1.5 rounded-full text-sm ${
								selectedDonationType === "all"
									? "bg-teal-100 text-teal-800"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							All Types
						</button>
						{Object.values(DonationType).map((type) => {
							const Icon = donationTypeIcons[type];
							return (
								<button
									key={type}
									onClick={() => handleDonationTypeChange(type)}
									className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
										selectedDonationType === type
											? "bg-teal-100 text-teal-800"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									<Icon className="h-4 w-4" />
									{type.charAt(0) +
										type.slice(1).toLowerCase().replace("_", " ")}
								</button>
							);
						})}
					</div>
				</div>
			)}

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
			) : causesData?.causes.length === 0 ? (
				<div className="text-center py-12">
					<Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No causes found
					</h3>
					<p className="text-gray-500">
						{searchInput || selectedDonationType !== "all"
							? "Try adjusting your search or filters"
							: "There are no causes available at the moment"}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{causesData?.causes.map((cause) => {
						const primaryDonationType = cause.acceptedDonationTypes[0];
						const DonationIcon = donationTypeIcons[primaryDonationType];
						return (
							<div
								key={cause.id}
								className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
							>
								<div className="relative h-48">
									<img
										src={cause.imageUrl}
										alt={cause.title}
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
										<DonationIcon className="h-5 w-5 text-teal-600" />
										<span className="text-sm font-medium text-teal-600">
											{primaryDonationType.charAt(0) +
												primaryDonationType
													.slice(1)
													.toLowerCase()
													.replace("_", " ")}
										</span>
									</div>
									<h3 className="text-xl font-semibold text-gray-900 mb-2">
										{cause.title}
									</h3>
									<p className="text-gray-600 mb-4 line-clamp-2">
										{cause.description}
									</p>
									<div className="space-y-3">
										<div>
											<div className="flex justify-between text-sm mb-1">
												<span className="text-gray-600">Progress</span>
												<span className="font-medium text-gray-900">
													${cause.raisedAmount} / ${cause.targetAmount}
												</span>
											</div>
											<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
												<div
													className="h-full bg-teal-600 rounded-full"
													style={{
														width: `${Math.min(
															(cause.raisedAmount / cause.targetAmount) * 100,
															100
														)}%`,
													}}
												/>
											</div>
										</div>
										<div className="flex items-center justify-between text-sm text-gray-500">
											<div className="flex items-center gap-1">
												<Clock className="h-4 w-4" />
												<span>
													{new Date(cause.createdAt).toLocaleDateString()}
												</span>
											</div>
											<div className="flex items-center gap-1">
												<Users className="h-4 w-4" />
												<span>{cause.donorCount} donors</span>
											</div>
										</div>
									</div>
									<button
										onClick={() => router.push(`/causes/${cause.id}`)}
										className="mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors duration-200"
									>
										View Details
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{causesData && causesData.totalPages > 1 && (
				<div className="mt-8 flex justify-center gap-2">
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
						className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
					>
						Previous
					</button>
					<span className="px-4 py-2 text-gray-600">
						Page {page} of {causesData.totalPages}
					</span>
					<button
						onClick={() =>
							setPage((p) => Math.min(causesData.totalPages, p + 1))
						}
						disabled={page === causesData.totalPages}
						className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}
