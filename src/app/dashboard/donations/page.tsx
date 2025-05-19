"use client";

import { useState } from "react";
import {
  FaCalendarAlt,
  FaChartLine,
  FaDownload,
  FaHandHoldingHeart,
  FaHeart,
} from "react-icons/fa";
import { useGetDonorStatsQuery, useGetDonorDonationsQuery } from "@/store/api/donationApi";
import { Donation, DonationStats } from "@/types/donation";

export default function DonationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "pending">("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: statsData, isLoading: isStatsLoading, isError: isStatsError } = useGetDonorStatsQuery();
  const { data: donationsData, isLoading: isDonationsLoading, isError: isDonationsError } = useGetDonorDonationsQuery({
    status: activeTab === "all" ? undefined : activeTab === "completed" ? "CONFIRMED" : "PENDING",
    page,
    limit,
  });
  console.log("donationsData", donationsData)

  if (isStatsLoading || isDonationsLoading) {
    return <p className="text-gray-700 text-center py-10">Loading...</p>;
  }

  if (isStatsError || !statsData?.success || isDonationsError || !donationsData?.success) {
    return <p className="text-red-600 text-center py-10">Failed to load donation data</p>;
  }

  const stats: DonationStats = statsData.data;
  const donations: Donation[] = donationsData.data.donations;
  const pagination = donationsData.pagination;

  const DonationCard = ({ donation }: { donation: Donation }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{donation.cause.title}</h3>
          <p className="text-sm text-gray-600">
            <span className="flex items-center mt-1">
              <FaCalendarAlt className="h-4 w-4 text-gray-400 mr-2" />
              {new Date(donation.createdAt).toLocaleDateString()}
            </span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Organization: {donation.organization.name}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${donation.status === "CONFIRMED"
            ? "bg-green-100 text-green-800"
            : donation.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
            }`}
        >
          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">{donation.type === "MONEY" ? "Amount" : "Type"}</p>
          <p className="text-lg font-semibold text-gray-900">
            {donation.type === "MONEY" ? `₹${donation.amount?.toLocaleString()}` : donation.type}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Impact</p>
          <p className="text-sm text-gray-900">{donation.description}</p>
        </div>
      </div>

      {donation.status === "CONFIRMED" && donation.receiptImage && (
        <div className="flex items-center justify-end pt-4 border-t">
          <a
            href={donation.receiptImage}
            className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700"
          >
            <FaDownload className="h-4 w-4 mr-2" />
            Download Receipt
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mt-12 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
          <p className="text-gray-600">Track your donations and their impact</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Donated</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{stats.totalDonated.toLocaleString()}
                </p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <FaHeart className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCauses} cause{stats.totalCauses !== 1 && "s"}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaHandHoldingHeart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Donation</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{Math.round(stats.averageDonation).toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaChartLine className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "all"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              All Donations
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "completed"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "pending"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Pending
            </button>
          </nav>
        </div>

        {/* Donations List */}
        <div className="grid gap-6 md:grid-cols-2">
          {donationsData && donationsData.data.length > 0 ? (
            donationsData.data.map((donation) => (
              <DonationCard key={donation._id} donation={donation} />
            ))
          ) : (
            <p className="text-gray-600 text-center col-span-2">No donations found.</p>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}