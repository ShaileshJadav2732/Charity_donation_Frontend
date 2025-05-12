"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
	useCreateCampaignMutation,
	useGetOrganizationCausesQuery,
} from "@/store/api/campaignApi";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { RootState } from "@/store/store";
import { FaHeart, FaTimes } from "react-icons/fa";
import { DonationType } from "@/types/campaings";

export default function CreateCampaignPage() {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [createCampaign] = useCreateCampaignMutation();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [causes, setCauses] = useState<string[]>([]);
	const [acceptedDonationTypes, setAcceptedDonationTypes] = useState<
		DonationType[]
	>([]);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [notification, setNotification] = useState<{
		type: "error" | "success";
		message: string;
	} | null>(null);

	// Fetch organization causes
	const {
		data: causesData,
		isLoading: causesLoading,
		error: causesError,
	} = useGetOrganizationCausesQuery(
		{
			organizationId: user?.id || "",
			params: { limit: 100 },
		},
		{ skip: !user?.id }
	);

	useRouteGuard("organization");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setNotification(null);

		// Client-side validation
		if (!title || !description) {
			setNotification({
				type: "error",
				message: "Title and description are required",
			});
			return;
		}
		if (!causes.length) {
			setNotification({
				type: "error",
				message: "At least one cause is required",
			});
			return;
		}
		if (!acceptedDonationTypes.length) {
			setNotification({
				type: "error",
				message: "At least one donation type is required",
			});
			return;
		}
		if (!Object.values(DonationType).includes(acceptedDonationTypes[0])) {
			setNotification({ type: "error", message: "Invalid donation types" });
			return;
		}
		const start = new Date(startDate);
		const end = new Date(endDate);
		if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
			setNotification({ type: "error", message: "Invalid date range" });
			return;
		}

		try {
			await createCampaign({
				title,
				description,
				causes,
				acceptedDonationTypes,
				startDate,
				endDate,
			}).unwrap();
			setNotification({
				type: "success",
				message: "Campaign created successfully",
			});
			setTimeout(() => router.push("/dashboard/campaigns?new=true"), 1500);
		} catch (error: any) {
			const errorMessage =
				error?.data?.message || error?.error || "Failed to create campaign";
			setNotification({ type: "error", message: errorMessage });
			console.error("Create campaign error:", {
				error,
				status: error?.status,
				data: error?.data,
				message: error?.data?.message,
			});
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
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
			<h1 className="text-2xl font-bold text-gray-900 mb-6">Create Campaign</h1>
			<form
				onSubmit={handleSubmit}
				className="bg-white rounded-xl shadow-md p-6 space-y-6"
			>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Title
					</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Description
					</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						rows={4}
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Select Causes
					</label>
					{causesLoading ? (
						<div className="text-gray-600">Loading causes...</div>
					) : causesError ? (
						<div className="text-red-600">Error loading causes</div>
					) : (
						<select
							multiple
							value={causes}
							onChange={(e) =>
								setCauses(
									Array.from(e.target.selectedOptions, (option) => option.value)
								)
							}
							className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						>
							{causesData?.causes?.map((cause) => (
								<option key={cause.id} value={cause.id}>
									{cause.title}
								</option>
							))}
						</select>
					)}
					<p className="text-sm text-gray-500 mt-1">
						Hold Ctrl (Windows) or Cmd (Mac) to select multiple causes.
					</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Accepted Donation Types
					</label>
					<select
						multiple
						value={acceptedDonationTypes}
						onChange={(e) =>
							setAcceptedDonationTypes(
								Array.from(
									e.target.selectedOptions,
									(option) => option.value as DonationType
								)
							)
						}
						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
					>
						{Object.values(DonationType).map((type) => (
							<option key={type} value={type}>
								{type.charAt(0).toUpperCase() + type.slice(1)}
							</option>
						))}
					</select>
					<p className="text-sm text-gray-500 mt-1">
						Hold Ctrl (Windows) or Cmd (Mac) to select multiple donation types.
					</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Start Date
					</label>
					<input
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						End Date
					</label>
					<input
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						required
					/>
				</div>
				<div className="flex justify-end gap-4">
					<button
						type="button"
						onClick={() => router.push("/dashboard/campaigns")}
						className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
					>
						<FaTimes className="mr-2" /> Cancel
					</button>
					<button
						type="submit"
						className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
					>
						<FaHeart className="mr-2" /> Create Campaign
					</button>
				</div>
			</form>
		</div>
	);
}
