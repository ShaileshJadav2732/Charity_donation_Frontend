// src/app/dashboard/causes/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	useGetCauseByIdQuery,
	useUpdateCauseMutation,
	useDeleteCauseMutation,
} from "@/store/api/causeApi";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { FaHeart, FaTag, FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function CauseDetailsPage({
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
	const [notification, setNotification] = useState<{
		type: "error" | "success";
		message: string;
	} | null>(null);

	const { data, isLoading, error } = useGetCauseByIdQuery(id);
	const [updateCause, { isLoading: isUpdating }] = useUpdateCauseMutation();
	const [deleteCause, { isLoading: isDeleting }] = useDeleteCauseMutation();

	// Protect route for organizations only
	useRouteGuard("organization");

	// Initialize form with cause data
	useEffect(() => {
		if (data?.cause) {
			setTags(data.cause.tags);
		}
	}, [data]);

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
		const targetAmount = Number(formData.get("targetAmount"));
		const imageUrl = formData.get("imageUrl") as string;

		// Client-side validation
		if (!title || !description || !targetAmount || !imageUrl) {
			setNotification({
				type: "error",
				message: "Please fill in all required fields",
			});
			return;
		}

		if (targetAmount <= 0) {
			setNotification({
				type: "error",
				message: "Target amount must be greater than 0",
			});
			return;
		}

		try {
			await updateCause({
				id,
				data: {
					title,
					description,
					targetAmount,
					imageUrl,
					tags,
				},
			}).unwrap();
			setNotification({
				type: "success",
				message: "Cause updated successfully",
			});
			setIsEditing(false);
			setTimeout(() => setNotification(null), 5000);
		} catch (error) {
			setNotification({ type: "error", message: "Failed to update cause" });
			console.error("Update cause error:", error);
		}
	};

	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this cause?")) {
			try {
				await deleteCause(id).unwrap();
				router.push("/dashboard/causes");
			} catch (error) {
				setNotification({ type: "error", message: "Failed to delete cause" });
				console.error("Delete cause error:", error);
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

	if (error || !data?.cause) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-100 text-red-800 p-4 rounded-lg text-center">
					Cause not found or error loading cause.
				</div>
			</div>
		);
	}

	const cause = data.cause;
	const isAuthorized = user && cause.organizationId === user._id;

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
				<h1 className="text-2xl font-bold text-gray-900">{cause.title}</h1>
				{isAuthorized && (
					<div className="flex gap-4">
						<button
							onClick={() => setIsEditing(!isEditing)}
							className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
						>
							<FaEdit className="mr-2" />{" "}
							{isEditing ? "Cancel Edit" : "Edit Cause"}
						</button>
						<button
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
						>
							<FaTrash className="mr-2" />{" "}
							{isDeleting ? "Deleting..." : "Delete Cause"}
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
							Cause Title
						</label>
						<input
							id="title"
							name="title"
							required
							defaultValue={cause.title}
							placeholder="Enter cause title"
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
							defaultValue={cause.description}
							placeholder="Enter cause description"
							rows={4}
							className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="targetAmount"
							className="text-sm font-medium text-gray-600"
						>
							Target Amount
						</label>
						<input
							id="targetAmount"
							name="targetAmount"
							type="number"
							required
							min="0.01"
							step="0.01"
							defaultValue={cause.targetAmount}
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
							defaultValue={cause.imageUrl}
							placeholder="Enter image URL"
							className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						/>
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
							{isUpdating ? "Updating..." : "Update Cause"}
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
					<img
						src={cause.imageUrl || "/placeholder.png"}
						alt={cause.title}
						className="w-full h-64 object-cover rounded-lg mb-4"
					/>
					<h2 className="text-xl font-semibold text-gray-900">{cause.title}</h2>
					<p className="text-gray-600">{cause.description}</p>
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
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600">
								<strong>Target Amount:</strong> $
								{cause.targetAmount.toLocaleString()}
							</p>
							<p className="text-sm text-gray-600">
								<strong>Raised Amount:</strong> $
								{cause.raisedAmount.toLocaleString()}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">
								<strong>Organization:</strong> {cause.organizationId.name}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
