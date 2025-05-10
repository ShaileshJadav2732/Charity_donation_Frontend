"use client";

import { useState, useEffect } from "react";
import DonationForm from "@/components/donation/DonationForm";
import { DonationFormData, Organization } from "@/types/donation";
import { useCreateDonationMutation } from "@/store/api/donationApi";
import { toast } from "react-hot-toast";
import {
	FaHeart,
	FaChartLine,
	FaHandHoldingHeart,
	FaCalendarAlt,
	FaDownload,
} from "react-icons/fa";

export default function DonationsPage() {
	const [createDonation] = useCreateDonationMutation();
	const [organizations, setOrganizations] = useState<Organization[]>([]);

	// Fetch organizations
	useEffect(() => {
		// TODO: Fetch organizations from API
		setOrganizations([
			{ _id: "1", name: "Organization 1", address: "Address 1" },
			{ _id: "2", name: "Organization 2", address: "Address 2" },
		]);
	}, []);

	const handleSubmit = async (data: DonationFormData) => {
		try {
			await createDonation(data).unwrap();
			toast.success("Donation created successfully!");
		} catch (error) {
			toast.error("Failed to create donation");
			console.error("Donation error:", error);
		}
	};

	const [activeTab, setActiveTab] = useState<"all" | "completed" | "pending">(
		"all"
	);

	// Mock data - replace with actual API calls
	const donations = [
		{
			id: 1,
			causeTitle: "Education for Rural Children",
			amount: 500,
			date: "2024-03-01",
			status: "completed" as const,
			receiptUrl: "/receipts/donation-1.pdf",
			impact: "Provided school supplies for 10 children",
		},
		{
			id: 2,
			causeTitle: "Ocean Cleanup Initiative",
			amount: 750,
			date: "2024-02-28",
			status: "completed" as const,
			receiptUrl: "/receipts/donation-2.pdf",
			impact: "Removed 75kg of plastic waste from oceans",
		},
		{
			id: 3,
			causeTitle: "Emergency Relief Fund",
			amount: 1000,
			date: "2024-02-15",
			status: "pending" as const,
			impact: "Will provide emergency supplies for 5 families",
		},
	];

	const filteredDonations = donations.filter(
		(donation) => activeTab === "all" || donation.status === activeTab
	);

	const totalDonated = donations
		.filter((d) => d.status === "completed")
		.reduce((sum, donation) => sum + donation.amount, 0);

	const totalImpact = donations.length;
	const avgDonation =
		totalDonated / donations.filter((d) => d.status === "completed").length;

	const DonationCard = ({ donation }: { donation: (typeof donations)[0] }) => (
		<div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
			<div className="flex justify-between items-start mb-4">
				<div>
					<h3 className="text-lg font-semibold text-gray-900">
						{donation.causeTitle}
					</h3>
					<p className="text-sm text-gray-600">
						<span className="flex items-center mt-1">
							<FaCalendarAlt className="h-4 w-4 text-gray-400 mr-2" />
							{new Date(donation.date).toLocaleDateString()}
						</span>
					</p>
				</div>
				<span
					className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
						donation.status === "completed"
							? "bg-green-100 text-green-800"
							: donation.status === "pending"
							? "bg-yellow-100 text-yellow-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					{donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
				</span>
			</div>

			<div className="grid grid-cols-2 gap-4 mb-4">
				<div>
					<p className="text-sm text-gray-600">Amount</p>
					<p className="text-lg font-semibold text-gray-900">
						${donation.amount.toLocaleString()}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600">Impact</p>
					<p className="text-sm text-gray-900">{donation.impact}</p>
				</div>
			</div>

			{donation.status === "completed" && donation.receiptUrl && (
				<div className="flex items-center justify-end pt-4 border-t">
					<a
						href={donation.receiptUrl}
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
			<h1 className="text-3xl font-bold text-gray-900 mb-8">
				Create a Donation
			</h1>
			<DonationForm organizations={organizations} onSubmit={handleSubmit} />

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
								<p className="text-sm font-medium text-gray-600">
									Total Donated
								</p>
								<p className="text-2xl font-bold text-gray-900">
									${totalDonated.toLocaleString()}
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
								<p className="text-sm font-medium text-gray-600">
									Total Impact
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{totalImpact} causes
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
								<p className="text-sm font-medium text-gray-600">
									Average Donation
								</p>
								<p className="text-2xl font-bold text-gray-900">
									${Math.round(avgDonation).toLocaleString()}
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
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "all"
									? "border-teal-600 text-teal-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							All Donations
						</button>
						<button
							onClick={() => setActiveTab("completed")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "completed"
									? "border-teal-600 text-teal-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							Completed
						</button>
						<button
							onClick={() => setActiveTab("pending")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "pending"
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
					{filteredDonations.map((donation) => (
						<DonationCard key={donation.id} donation={donation} />
					))}
				</div>
			</div>
		</div>
	);
}
