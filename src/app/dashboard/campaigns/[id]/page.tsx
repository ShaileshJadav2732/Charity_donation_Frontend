// src/app/dashboard/campaigns/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	useGetCampaignByIdQuery,
	useUpdateCampaignMutation,
	useDeleteCampaignMutation,
} from "@/store/api/campaignApi";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	FaHeart,
	FaTag,
	FaDonate,
	FaEdit,
	FaTrash,
	FaTimes,
} from "react-icons/fa";
import { DonationType } from "@/types/donation";

export default function CampaignDetailsPage({
	params,
}: {
	params: { id: string };
}) {
	const router = useRouter();
	const { id } = params;
	const { user } = useSelector((state: RootState) => state.auth);
	const [isEditing, setIsEditing] = useState(false);
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");
	const [acceptedDonationTypes, setAcceptedDonationTypes] = useState<
		DonationType[]
	>([]);
	const [notification, setNotification] = useState<{
		type: "error" | "success";
		message: string;
	} | null>(null);

	const { data, isLoading, error } = useGetCampaignByIdQuery(id);
	const [updateCampaign, { isLoading: isUpdating }] =
		useUpdateCampaignMutation();
	const [deleteCampaign, { isLoading: isDeleting }] =
		useDeleteCampaignMutation();

	// Protect route for organizations only
	useRouteGuard("organization");

	// Initialize form with campaign data
	useEffect(() => {
		if (data?.campaign) {
			setTags(data.campaign.tags);
			setAcceptedDonationTypes(data.campaign.acceptedDonationTypes);
		}
	}, [data]);

	const handleDonationTypeChange = (type: DonationType) => {
		if (acceptedDonationTypes.includes(type)) {
			setAcceptedDonationTypes(acceptedDonationTypes.filter((t) => t !== type));
		} else {
			setAcceptedDonationTypes([...acceptedDonationTypes, type]);
		}
	};

	const handleAddTag = () => {
		if (tagInput.trim() && !tags.includes(tagInput.trim())) {
			setTags([...tags, tagInput.trim()]);
			setTagInput("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setTags(tags.filter((tag) => tag !== tagToRemove));
	};

	const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const startDate = formData.get("startDate") as string;
		const endDate = formData.get("endDate") as string;
		const totalTargetAmount = Number(formData.get("totalTargetAmount"));
		const imageUrl = formData.get("imageUrl") as string;
		const status = formData.get("status") as string;

		// Client-side validation
		if (
			!title ||
			!description ||
			!startDate ||
			!endDate ||
			!totalTargetAmount ||
			!imageUrl
		) {
			setNotification({
				type: "error",
				message: "Please fill in all required fields",
			});
			return;
		}

		if (new Date(startDate) >= new Date(endDate)) {
			setNotification({
				type: "error",
				message: "End date must be after start date",
			});
			return;
		}

		if (totalTargetAmount <= 0) {
			setNotification({
				type: "error",
				message: "Target amount must be greater than 0",
			});
			return;
		}

		if (acceptedDonationTypes.length === 0) {
			setNotification({
				type: "error",
				message: "Please select at least one donation type",
			});
			return;
		}

		try {
			await updateCampaign({
				id,
				data: {
					title,
					description,
					startDate,
					endDate,
					totalTargetAmount,
					imageUrl,
					tags,
					acceptedDonationTypes,
					status,
				},
			}).unwrap();
			setNotification({
				type: "success",
				message: "Campaign updated successfully",
			});
			setIsEditing(false);
			setTimeout(() => setNotification(null), 5000);
		} catch (error) {
			setNotification({ type: "error", message: "Failed to update campaign" });
			console.error("Update campaign error:", error);
		}
	};

	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this campaign?")) {
			try {
				await deleteCampaign(id).unwrap();
				router.push("/dashboard/campaigns");
			} catch (error) {
				setNotification({
					type: "error",
					message: "Failed to delete campaign",
				});
				console.error("Delete campaign error:", error);
			}
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
					<div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2"></div>
				</div>
			</div>
		);
	}

	if (error || !data?.campaign) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-100 text-red-800 p-4 rounded-lg text-center">
					Campaign not found or error loading campaign.
				</div>
			</div>
		);
	}

	const campaign = data.campaign;
	const isAuthorized =
		user && campaign.organizations.some((org) => org._id === user._id);

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
				<h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
				{isAuthorized && (
					<div className="flex gap-4">
						<button
							onClick={() => setIsEditing(!isEditing)}
							className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
						>
							<FaEdit className="mr-2" />{" "}
							{isEditing ? "Cancel Edit" : "Edit Campaign"}
						</button>
						<button
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
						>
							<FaTrash className="mr-2" />{" "}
							{isDeleting ? "Deleting..." : "Delete Campaign"}
						</button>
					</div>
				)}
			</div>

			{isEditing ? (
				<form
					onSubmit={handleUpdate}
					className="bg-white rounded-xl shadow-md p-6 space-y-6 max-w-2xl"
				>
					<div className="space-y-2">
						<label
							htmlFor="title"
							className="text-sm font-medium text-gray-600"
						>
							Campaign Title
						</label>
						<input
							id="title"
							name="title"
							required
							defaultValue={campaign.title}
							placeholder="Enter campaign title"
							className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="description"
							className="text-sm font-medium text-gray-600"
						>
							Description
						</label>
						<textarea
							id="description"
							name="description"
							required
							defaultValue={campaign.description}
							placeholder="Enter campaign description"
							rows={4}
							className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label
								htmlFor="startDate"
								className="text-sm font-medium text-gray-600"
							>
								Start Date
							</label>
							<input
								id="startDate"
								name="startDate"
								type="date"
								required
								defaultValue={campaign.startDate.split("T")[0]}
								className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="endDate"
								className="text-sm font-medium text-gray-600"
							>
								End Date
							</label>
							<input
								id="endDate"
								name="endDate"
								type="date"
								required
								defaultValue={campaign.endDate.split("T")[0]}
								className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="totalTargetAmount"
							className="text-sm font-medium text-gray-600"
						>
							Target Amount
						</label>
						<input
							id="totalTargetAmount"
							name="totalTargetAmount"
							type="number"
							required
							min="0.01"
							step="0.01"
							defaultValue={campaign.totalTargetAmount}
							placeholder="Enter target amount"
							className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="imageUrl"
							className="text-sm font-medium text-gray-600"
						>
							Image URL
						</label>
						<input
							id="imageUrl"
							name="imageUrl"
							type="url"
							required
							defaultValue={campaign.imageUrl}
							placeholder="Enter image URL"
							className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="status"
							className="text-sm font-medium text-gray-600"
						>
							Status
						</label>
						<select
							id="status"
							name="status"
							defaultValue={campaign.status}
							className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						>
							<option value="draft">Draft</option>
							<option value="active">Active</option>
							<option value="completed">Completed</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-600 flex items-center">
							<FaDonate className="mr-2" /> Accepted Donation Types
						</label>
						<div className="grid grid-cols-2 gap-2">
							{Object.values(DonationType).map((type) => (
								<label key={type} className="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={acceptedDonationTypes.includes(type)}
										onChange={() => handleDonationTypeChange(type)}
										className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
									/>
									<span className="text-sm text-gray-600">{type}</span>
								</label>
							))}
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-600">Tags</label>
						<div className="flex gap-2">
							<input
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								placeholder="Add a tag"
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddTag();
									}
								}}
								className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
							/>
							<button
								type="button"
								onClick={handleAddTag}
								className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
							>
								<FaTag className="mr-2" /> Add
							</button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{tags.map((tag) => (
								<span
									key={tag}
									className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full flex items-center gap-2"
								>
									{tag}
									<button
										type="button"
										onClick={() => handleRemoveTag(tag)}
										className="text-teal-800 hover:text-teal-600"
									>
										<FaTimes />
									</button>
								</span>
							))}
						</div>
					</div>

					<div className="flex gap-4">
						<button
							type="submit"
							disabled={isUpdating}
							className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center"
						>
							<FaHeart className="mr-2" />{" "}
							{isUpdating ? "Updating..." : "Update Campaign"}
						</button>
						<button
							type="button"
							onClick={() => setIsEditing(false)}
							className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
						>
							<FaTimes className="mr-2" /> Cancel
						</button>
					</div>
				</form>
			) : (
				<div className="bg-white rounded-xl shadow-md p-6 space-y-6">
					<div className="relative">
						<img
							src={campaign.imageUrl || "/placeholder.png"}
							alt={campaign.title}
							className="w-full h-64 object-cover rounded-lg mb-4"
						/>
						<span
							className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
								campaign.status === "active"
									? "bg-green-100 text-green-800"
									: campaign.status === "completed"
									? "bg-blue-100 text-blue-800"
									: campaign.status === "cancelled"
									? "bg-red-100 text-red-800"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							{campaign.status}
						</span>
					</div>
					<h2 className="text-xl font-semibold text-gray-900">
						{campaign.title}
					</h2>
					<p className="text-gray-600">{campaign.description}</p>
					<div className="flex flex-wrap gap-2 mb-4">
						{campaign.acceptedDonationTypes.map((type) => (
							<span
								key={type}
								className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs flex items-center"
							>
								<FaDonate className="mr-1" /> {type}
							</span>
						))}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600">
								<strong>Start Date:</strong>{" "}
								{new Date(campaign.startDate).toLocaleDateString()}
							</p>
							<p className="text-sm text-gray-600">
								<strong>End Date:</strong>{" "}
								{new Date(campaign.endDate).toLocaleDateString()}
							</p>
							<p className="text-sm text-gray-600">
								<strong>Target Amount:</strong> $
								{campaign.totalTargetAmount.toLocaleString()}
							</p>
							<p className="text-sm text-gray-600">
								<strong>Raised Amount:</strong> $
								{campaign.totalRaisedAmount.toLocaleString()}
							</p>
							<p className="text-sm text-gray-600">
								<strong>Supporters:</strong> {campaign.totalSupporters}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">
								<strong>Organizations:</strong>{" "}
								{campaign.organizations.map((org) => org.name).join(", ") ||
									"None"}
							</p>
							<p className="text-sm text-gray-600">
								<strong>Causes:</strong>{" "}
								{campaign.causes.map((cause) => cause.title).join(", ") ||
									"None"}
							</p>
							<p className="text-sm text-gray-600">
								<strong>Tags:</strong>{" "}
								{campaign.tags.map((tag) => (
									<span
										key={tag}
										className="inline-block bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs mr-2"
									>
										{tag}
									</span>
								))}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
