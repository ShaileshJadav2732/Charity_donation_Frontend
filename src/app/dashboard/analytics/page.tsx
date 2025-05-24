<<<<<<< Updated upstream
import React from 'react'

const analytics = () => {
  return (
	 <div>analytics</div>
  )
}

export default analytics
=======
"use client";

import Link from "next/link";
import {
	FaChartBar,
	FaChartPie,
	FaHandHoldingHeart,
	FaArrowUp,
} from "react-icons/fa";

export default function AnalyticsPage() {
	return (
		<div className="max-w-7xl mx-auto">
			<div className="mt-8 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Analytics Dashboard
						</h1>
						<p className="text-gray-600">
							Comprehensive insights into your donation activities
						</p>
					</div>
				</div>

				{/* Analytics Categories */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Donation Analytics */}
					<Link
						href="/dashboard/analytics/donations"
						className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-teal-300"
					>
						<div className="flex items-center mb-4">
							<div className="p-3 rounded-full bg-teal-100 mr-4">
								<FaHandHoldingHeart className="h-6 w-6 text-teal-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									Donation Analytics
								</h3>
								<p className="text-sm text-gray-600">
									Track your donation history and impact
								</p>
							</div>
						</div>
						<div className="text-sm text-teal-600 font-medium">
							View detailed donation insights →
						</div>
					</Link>

					{/* Performance Metrics */}
					<div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 opacity-75">
						<div className="flex items-center mb-4">
							<div className="p-3 rounded-full bg-blue-100 mr-4">
								<FaArrowUp className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									Performance Metrics
								</h3>
								<p className="text-sm text-gray-600">
									Monitor donation trends and growth
								</p>
							</div>
						</div>
						<div className="text-sm text-gray-500 font-medium">Coming Soon</div>
					</div>

					{/* Impact Reports */}
					<div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 opacity-75">
						<div className="flex items-center mb-4">
							<div className="p-3 rounded-full bg-green-100 mr-4">
								<FaChartBar className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									Impact Reports
								</h3>
								<p className="text-sm text-gray-600">
									Measure your contribution impact
								</p>
							</div>
						</div>
						<div className="text-sm text-gray-500 font-medium">Coming Soon</div>
					</div>
				</div>

				{/* Quick Stats Preview */}
				<div className="bg-white rounded-xl shadow-md p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
						<FaChartPie className="mr-2 text-teal-600" /> Quick Overview
					</h2>
					<p className="text-gray-600 mb-4">
						Get started by exploring your donation analytics to understand your
						giving patterns and impact.
					</p>
					<Link
						href="/dashboard/analytics/donations"
						className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200"
					>
						<FaHandHoldingHeart className="mr-2" />
						View Donation Analytics
					</Link>
				</div>
			</div>
		</div>
	);
}
>>>>>>> Stashed changes
