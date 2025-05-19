"use client";
import { useGetOrganizationDonationsQuery } from "@/store/api/donationApi";
import { Donation } from "@/types/donation";
import React, { useState } from "react";
import { FiCheckCircle, FiEye, FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface OrganizationDonationsProps {
	organizationId: string;
}

const OrganizationDonations: React.FC<OrganizationDonationsProps> = ({
	organizationId
}) => {
	const [status, setStatus] = useState<string>("PENDING");
	const [page, setPage] = useState<number>(1);
	const [limit] = useState<number>(10);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const { data, isLoading, isFetching, isError, refetch } =
		useGetOrganizationDonationsQuery({
			organizationId,
			params: {
				status,
				page,
				limit
			}
		});

	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setStatus(e.target.value);
		setPage(1);
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const filteredDonations = data?.data?.filter(
		(donation: Donation) =>
			donation.donor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			donation.description?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			{/* Header and Filters */}
			<div className="p-6 border-b border-gray-100">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">Donations</h2>
						<p className="text-sm text-gray-500 mt-1">
							Manage and track all donations to your organization
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative flex-grow max-w-md">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiSearch className="text-gray-400" />
							</div>
							<input
								type="text"
								placeholder="Search donations..."
								value={searchTerm}
								onChange={handleSearch}
								className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full transition-all"
							/>
						</div>

						<select
							value={status}
							onChange={handleStatusChange}
							className="block w-full sm:w-48 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
						>
							<option value="PENDING">Pending</option>
							<option value="APPROVED">Approved</option>
							<option value="COMPLETED">Completed</option>
							<option value="CANCELLED">Cancelled</option>
							<option value="">All Status</option>
						</select>

						<button
							onClick={() => refetch()}
							className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
							disabled={isFetching}
						>
							<FiRefreshCw
								className={`mr-2 ${isFetching ? "animate-spin" : ""}`}
							/>
							Refresh
						</button>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			)}

			{/* Error State */}
			{isError && (
				<div className="p-8 text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
						<svg
							className="h-6 w-6 text-red-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h3 className="mt-3 text-lg font-medium text-gray-900">
						Failed to load donations
					</h3>
					<p className="mt-2 text-sm text-gray-500">
						There was an error loading the donations. Please try again.
					</p>
					<div className="mt-6">
						<button
							onClick={() => refetch()}
							className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
						>
							Try Again
						</button>
					</div>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !isError && filteredDonations?.length === 0 && (
				<div className="p-8 text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
						<svg
							className="h-6 w-6 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h3 className="mt-3 text-lg font-medium text-gray-900">
						No donations found
					</h3>
					<p className="mt-2 text-sm text-gray-500">
						{searchTerm
							? "No donations match your search criteria."
							: status === "PENDING"
								? "You don't have any pending donations."
								: status === "APPROVED"
									? "You don't have any approved donations."
									: status === "COMPLETED"
										? "You don't have any completed donations."
										: status === "CANCELLED"
											? "You don't have any cancelled donations."
											: "You haven't received any donations yet."}
					</p>
					{searchTerm && (
						<button
							onClick={() => setSearchTerm("")}
							className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
						>
							Clear search
						</button>
					)}
				</div>
			)}

			{/* Data Table */}
			{!isLoading &&
				!isError &&
				filteredDonations &&
				filteredDonations.length > 0 && (
					<div className="overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Donor
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Details
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Amount
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Status
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Date
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredDonations.map((donation: Donation) => (
										<tr key={donation._id} className="hover:bg-gray-50 transition-colors">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
														<span className="text-gray-600 font-medium">
															{donation.donor?.name?.charAt(0).toUpperCase()}
														</span>
													</div>
													<div className="ml-4">
														<div className="text-sm font-medium text-gray-900">
															{donation.donor?.name || "Anonymous"}
														</div>
														<div className="text-sm text-gray-500">
															{donation.donor?.email || "No email provided"}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm font-medium text-gray-900 line-clamp-1">
													{donation.description || "No description"}
												</div>
												{donation.cause && (
													<div className="text-sm text-gray-500 mt-1">
														<span className="font-medium">Cause:</span> {donation.cause.title}
													</div>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-bold text-gray-900">
													${donation.amount?.toFixed(2) || "0.00"}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full 
                            ${donation.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : ""}
                            ${donation.status === "APPROVED" ? "bg-blue-100 text-blue-800" : ""}
                            ${donation.status === "COMPLETED" ? "bg-green-100 text-green-800" : ""}
                            ${donation.status === "CANCELLED" ? "bg-red-100 text-red-800" : ""}
                          `}
												>
													{donation.status}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{new Date(donation.createdAt).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'short',
													day: 'numeric'
												})}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
												<div className="flex justify-end space-x-3">
													<button
														className="text-blue-600 hover:text-blue-900 transition-colors"
														title="View Details"
														onClick={() => {
															// Handle view action
														}}
													>
														<FiEye className="h-5 w-5" />
													</button>
													{donation.status === "PENDING" && (
														<button
															className="text-green-600 hover:text-green-900 transition-colors"
															title="Approve Donation"
															onClick={() => {
																// Handle approve action
															}}
														>
															<FiCheckCircle className="h-5 w-5" />
														</button>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

			{/* Pagination */}
			{data?.pagination && data.pagination.pages > 1 && (
				<div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
					<div className="flex flex-col sm:flex-row items-center justify-between">
						<div className="text-sm text-gray-700 mb-4 sm:mb-0">
							Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
							<span className="font-medium">{Math.min(page * limit, data.pagination.total)}</span> of{' '}
							<span className="font-medium">{data.pagination.total}</span> donations
						</div>
						<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
							<button
								onClick={() => setPage(page - 1)}
								disabled={page === 1}
								className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
							>
								<span className="sr-only">Previous</span>
								<FiChevronLeft className="h-5 w-5" />
							</button>
							{Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
								let pageNum;
								if (data.pagination.pages <= 5) {
									pageNum = i + 1;
								} else if (page <= 3) {
									pageNum = i + 1;
								} else if (page >= data.pagination.pages - 2) {
									pageNum = data.pagination.pages - 4 + i;
								} else {
									pageNum = page - 2 + i;
								}
								return (
									<button
										key={pageNum}
										onClick={() => setPage(pageNum)}
										className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNum
											? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
											: 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
											} transition-colors`}
									>
										{pageNum}
									</button>
								);
							})}
							<button
								onClick={() => setPage(page + 1)}
								disabled={page === data.pagination.pages}
								className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
							>
								<span className="sr-only">Next</span>
								<FiChevronRight className="h-5 w-5" />
							</button>
						</nav>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrganizationDonations;