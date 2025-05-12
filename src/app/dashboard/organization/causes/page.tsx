// src/app/dashboard/organization/causes/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useGetOrganizationCausesQuery } from "@/store/api/causesApi";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { RootState } from "@/store/store";
import { FaSearch, FaTag, FaHeart } from "react-icons/fa";

export default function OrganizationCausesPage() {
	const searchParams = useSearchParams();
	const { user } = useSelector((state: RootState) => state.auth);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [tag, setTag] = useState("");
	const [notification, setNotification] = useState<{
		type: "error" | "success";
		message: string;
	} | null>(null);

	// Check for 'new' query param to show success notification
	useEffect(() => {
		if (searchParams.get("new") === "true") {
			setPage(1); // Reset to first page to show new cause
			setNotification({
				type: "success",
				message: "Cause created successfully",
			});
			setTimeout(() => setNotification(null), 5000); // Auto-dismiss after 5s
		}
	}, [searchParams]);

	// Protect route for organizations only
	useRouteGuard("organization");

	if (!user?.id) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-100 text-red-800 p-4 rounded-lg text-center">
					User not authenticated. Please log in.
				</div>
			</div>
		);
	}

	const { data, isLoading, error } = useGetOrganizationCausesQuery({
		organizationId: user._id,
		params: { page, limit: 10, search, tag },
	});

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-100 text-red-800 p-4 rounded-lg text-center">
					Error loading your causes. Please try again later.
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 space-y-6">
			{notification && (
				<div
					className={`p-4 rounded-lg ${
						notification.type === "error"
							? "bg-red-100 text-red-800"
							: "bg-green-100 text-green-800"
					}`}
				>
					{notification.message}
				</div>
			)}

			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
					My Organization Causes
				</h1>
				<Link
					href="/dashboard/causes/create"
					className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
				>
					<FaHeart className="mr-2" /> Create Cause
				</Link>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="relative">
					<input
						type="text"
						placeholder="Search your causes..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
					/>
					<FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
				</div>
				<div className="relative">
					<input
						type="text"
						placeholder="Filter by tag..."
						value={tag}
						onChange={(e) => setTag(e.target.value)}
						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
					/>
					<FaTag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<div
							key={i}
							className="bg-white rounded-xl shadow-md p-6 animate-pulse"
						>
							<div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
							<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-1/2"></div>
						</div>
					))}
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{data?.causes?.map((cause: any) => (
							<Link
								key={cause.id}
								href={`/dashboard/causes/${cause.id}`}
								className="block"
							>
								<div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
									<img
										src={cause.imageUrl || "/placeholder.png"}
										alt={cause.title}
										className="w-full h-48 object-cover rounded-lg mb-4"
									/>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										{cause.title}
									</h3>
									<p className="text-sm text-gray-600 mb-4 line-clamp-2">
										{cause.description}
									</p>
									<div className="flex flex-wrap gap-2 mb-4">
										{cause.tags.map((tag) => (
											<span
												key={tag}
												className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs"
											>
												{tag}
											</span>
										))}
									</div>
									<div className="flex justify-between items-center text-sm text-gray-600">
										<span>
											${cause.raisedAmount.toLocaleString()} / $
											{cause.targetAmount.toLocaleString()}
										</span>
										<span className="flex items-center">
											<FaHeart className="mr-1 text-teal-600" />{" "}
											{cause.organizationName}
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>

					{data && data.total > 0 && (
						<div className="flex justify-center gap-4 mt-8">
							<button
								onClick={() => setPage(page - 1)}
								disabled={page === 1}
								className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-200"
							>
								Previous
							</button>
							<button
								onClick={() => setPage(page + 1)}
								disabled={page * 10 >= data.total}
								className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-200"
							>
								Next
							</button>
						</div>
					)}

					{data?.causes?.length === 0 && (
						<div className="text-center py-8 text-gray-600">
							No causes found
						</div>
					)}
				</>
			)}
		</div>
	);
}
