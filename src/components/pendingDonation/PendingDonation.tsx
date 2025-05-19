"use client";
import { useGetOrganizationDonationsQuery } from "@/store/api/donationApi";
import React, { useState } from "react";
import { FiCheckCircle, FiEye, FiRefreshCw, FiSearch } from "react-icons/fi";

interface OrganizationDonationsProps {
	organizationId: string;
}

const OrganizationDonations: React.FC<OrganizationDonationsProps> = ({
	organizationId,
}) => {
	const [status, setStatus] = useState<string>("PENDING");
	const [page, setPage] = useState<number>(1);
	const [limit] = useState<number>(10);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const { data, isLoading, isFetching, isError, refetch } =
		useGetOrganizationDonationsQuery({
			organizationId,
		});
	console.log("donation datataa", data);
	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setStatus(e.target.value);
		setPage(1);
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const filteredDonations = data?.data.filter(
		(donation) =>
			donation.donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			donation.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="bg-white rounded-lg shadow-sm overflow-hidden">
			{/* Header and Filters */}
			<div className="p-6 border-b border-gray-200">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<h2 className="text-xl font-semibold text-gray-800">
						Donations
						{status && (
							<span className="ml-2 text-sm text-gray-500">
								({status.toLowerCase()})
							</span>
						)}
					</h2>

					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiSearch className="text-gray-400" />
							</div>
							<input
								type="text"
								placeholder="Search donations..."
								value={searchTerm}
								onChange={handleSearch}
								className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-64"
							/>
						</div>

						<select
							value={status}
							onChange={handleStatusChange}
							className="block w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="PENDING">Pending</option>
							<option value="APPROVED">Approved</option>
							<option value="COMPLETED">Completed</option>
							<option value="CANCELLED">Cancelled</option>
							<option value="">All Status</option>
						</select>

						<button
							onClick={() => refetch()}
							className="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100"
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
			{/* {isError && (
				<div className="p-6 text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
						<FiXCircle className="w-8 h-8 text-red-500" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Failed to load donations
					</h3>
					<p className="text-gray-500 mb-4">
						There was an error loading the donations. Please try again.
					</p>
					<button
						onClick={() => refetch()}
						className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						Try Again
					</button>
				</div>
			)} */}

			{/* Empty State */}
			{!isLoading && !isError && filteredDonations?.length === 0 && (
				<div className="p-6 text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
						<svg
							className="w-8 h-8 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-1">
						No donations found
					</h3>
					<p className="text-gray-500">
						There are no donations matching your current filters.
					</p>
				</div>
			)}

			{/* Data Table */}
			{!isLoading &&
				!isError &&
				filteredDonations &&
				filteredDonations.length > 0 && (
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
										Description
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
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredDonations.map((donation) => (
									<tr key={donation._id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div>
													<div className="text-sm font-medium text-gray-900">
														{donation.donor.name}
													</div>
													<div className="text-sm text-gray-500">
														{donation.donor.email}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-900">
												{donation.description}
											</div>
											{donation.cause && (
												<div className="text-sm text-gray-500">
													For: {donation.cause.title}
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												${donation.amount.toFixed(2)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
												donation.status === "PENDING"
													? "bg-yellow-100 text-yellow-800"
													: ""
											}
                      ${
												donation.status === "APPROVED"
													? "bg-blue-100 text-blue-800"
													: ""
											}
                      ${
												donation.status === "COMPLETED"
													? "bg-green-100 text-green-800"
													: ""
											}
                      ${
												donation.status === "CANCELLED"
													? "bg-red-100 text-red-800"
													: ""
											}
                    `}
											>
												{donation.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(donation.createdAt).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<button className="text-blue-600 hover:text-blue-900 mr-3 flex items-center">
												<FiEye className="mr-1" /> View
											</button>
											{donation.status === "PENDING" && (
												<button className="text-green-600 hover:text-green-900 flex items-center">
													<FiCheckCircle className="mr-1" /> Approve
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

			{/* Pagination */}
			{!isLoading && !isError && data && data.pagination.pages > 1 && (
				<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
					<div className="flex-1 flex justify-between sm:hidden">
						<button
							onClick={() => setPage(Math.max(page - 1, 1))}
							disabled={page === 1}
							className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
								page === 1
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "bg-white text-gray-700 hover:bg-gray-50"
							}`}
						>
							Previous
						</button>
						<button
							onClick={() => setPage(Math.min(page + 1, data.pagination.pages))}
							disabled={page === data.pagination.pages}
							className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
								page === data.pagination.pages
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "bg-white text-gray-700 hover:bg-gray-50"
							}`}
						>
							Next
						</button>
					</div>
					<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
						<div>
							<p className="text-sm text-gray-700">
								Showing{" "}
								<span className="font-medium">
									{data.data.length > 0 ? (page - 1) * limit + 1 : 0}
								</span>{" "}
								to{" "}
								<span className="font-medium">
									{Math.min(page * limit, data.pagination.total)}
								</span>{" "}
								of <span className="font-medium">{data.pagination.total}</span>{" "}
								results
							</p>
						</div>
						<div>
							<nav
								className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
								aria-label="Pagination"
							>
								<button
									onClick={() => setPage(1)}
									disabled={page === 1}
									className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
										page === 1
											? "text-gray-300 cursor-not-allowed"
											: "text-gray-500 hover:bg-gray-50"
									}`}
								>
									<span className="sr-only">First</span>
									<svg
										className="h-5 w-5"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</button>

								{Array.from({ length: Math.min(5, data.pagination.pages) }).map(
									(_, idx) => {
										const pageNum = page > 2 ? page - 2 + idx : idx + 1;
										if (pageNum <= data.pagination.pages) {
											return (
												<button
													key={pageNum}
													onClick={() => setPage(pageNum)}
													className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
														page === pageNum
															? "z-10 bg-blue-50 border-blue-500 text-blue-600"
															: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
													}`}
												>
													{pageNum}
												</button>
											);
										}
										return null;
									}
								)}

								<button
									onClick={() => setPage(data.pagination.pages)}
									disabled={page === data.pagination.pages}
									className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
										page === data.pagination.pages
											? "text-gray-300 cursor-not-allowed"
											: "text-gray-500 hover:bg-gray-50"
									}`}
								>
									<span className="sr-only">Last</span>
									<svg
										className="h-5 w-5"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</nav>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrganizationDonations;
