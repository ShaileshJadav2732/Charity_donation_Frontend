"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { FaHandsHelping, FaHeart, FaUsers, FaChartLine } from "react-icons/fa";

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const DonorDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">$2,500</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <FaHeart className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600">+12% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Causes Supported</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaHandsHelping className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-purple-600">Active in 3 categories</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Impact Score</p>
              <p className="text-2xl font-bold text-gray-900">85</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaChartLine className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-blue-600">Top 15% of donors</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Organizations</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaUsers className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-orange-600">Supporting 5 organizations</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="bg-teal-100 p-2 rounded-full mr-4">
                <FaHeart className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Donated $50 to Save the Ocean Campaign
                </p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const OrganizationDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Raised</p>
              <p className="text-2xl font-bold text-gray-900">$25,000</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <FaHeart className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600">+15% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaHandsHelping className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-purple-600">2 ending soon</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donors</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUsers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-blue-600">12 new this month</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">92%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaChartLine className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-orange-600">Campaign completion rate</p>
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="bg-teal-100 p-2 rounded-full mr-4">
                <FaUsers className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  John Doe donated $100 to Clean Water Initiative
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.role === "donor" ? "Donor" : "Organization"}!
        </h1>
        <p className="text-gray-600">Here's an overview of your activities</p>
      </div>

      {user?.role === "donor" ? <DonorDashboard /> : <OrganizationDashboard />}
    </div>
  );
}
