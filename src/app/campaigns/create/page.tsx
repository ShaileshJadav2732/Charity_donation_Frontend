"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCampaignMutation } from "@/store/api/campaignApi";
import {
	useGetCausesQuery,
	useCreateCauseMutation,
} from "@/store/api/causeApi";
import {
	Loader2,
	Plus,
	Heart,
	Calendar,
	AlertCircle,
	CheckCircle2,
	Users,
	DollarSign,
	Package,
	Droplet,
	BookOpen,
	Home,
	Gift,
	Utensils,
	Shirt,
	MoreHorizontal,
	X,
} from "lucide-react";
import { DonationType } from "@/types/donation";
import { formatCurrency } from "@/lib/utils";
import { CreateCauseBody } from "@/types/cause";

const donationTypeIcons = {
	[DonationType.MONEY]: DollarSign,
	[DonationType.CLOTHES]: Shirt,
	[DonationType.BLOOD]: Droplet,
	[DonationType.FOOD]: Utensils,
	[DonationType.TOYS]: Gift,
	[DonationType.BOOKS]: BookOpen,
	[DonationType.FURNITURE]: Home,
	[DonationType.HOUSEHOLD]: Package,
	[DonationType.OTHER]: MoreHorizontal,
};

const createCauseSchema = z.object({
	title: z.string().min(1, "Title is required").max(100, "Title is too long"),
	description: z
		.string()
		.min(1, "Description is required")
		.max(1000, "Description is too long"),
	targetAmount: z.number().min(1, "Target amount must be greater than 0"),
	imageUrl: z.string().min(1, "Image URL is required").url("Invalid image URL"),
	tags: z.array(z.string()).min(1, "Add at least one tag"),
	acceptedDonationTypes: z
		.array(z.nativeEnum(DonationType))
		.min(1, "Select at least one donation type"),
});

const createCampaignSchema = z
	.object({
		title: z.string().min(1, "Title is required").max(100, "Title is too long"),
		description: z
			.string()
			.min(1, "Description is required")
			.max(1000, "Description is too long"),
		imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
		startDate: z.string().min(1, "Start date is required"),
		endDate: z.string().min(1, "End date is required"),
		causes: z.array(z.string()).min(1, "Select at least one cause"),
	})
	.refine(
		(data) => {
			const startDate = new Date(data.startDate);
			const endDate = new Date(data.endDate);
			return endDate > startDate;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		}
	);

type CreateCampaignFormData = z.infer<typeof createCampaignSchema>;
type CreateCauseFormData = z.infer<typeof createCauseSchema>;

export default function CreateCampaignPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
	const [showCreateCause, setShowCreateCause] = useState(false);
	const [newCauseTags, setNewCauseTags] = useState<string[]>([]);
	const [newCauseTagInput, setNewCauseTagInput] = useState("");
	const [selectedDonationTypes, setSelectedDonationTypes] = useState<
		DonationType[]
	>([]);

	const {
		register: registerCampaign,
		handleSubmit: handleSubmitCampaign,
		formState: { errors: campaignErrors },
	} = useForm<CreateCampaignFormData>({
		resolver: zodResolver(createCampaignSchema),
		defaultValues: {
			causes: [],
		},
	});

	const {
		register: registerCause,
		handleSubmit: handleSubmitCause,
		reset: resetCauseForm,
		setValue: setCauseValue,
		formState: { errors: causeErrors },
	} = useForm<CreateCauseFormData>({
		resolver: zodResolver(createCauseSchema),
		defaultValues: {
			tags: [],
			acceptedDonationTypes: [],
		},
	});

	const [createCampaign, { isLoading: isCreatingCampaign }] =
		useCreateCampaignMutation();
	const [createCause, { isLoading: isCreatingCause }] =
		useCreateCauseMutation();
	const {
		data: causesData,
		isLoading: isLoadingCauses,
		refetch: refetchCauses,
	} = useGetCausesQuery({
		organizationId: "current",
		limit: 100,
	});

	// Update form values when state changes
	useEffect(() => {
		setCauseValue("tags", newCauseTags);
	}, [newCauseTags, setCauseValue]);

	useEffect(() => {
		setCauseValue("acceptedDonationTypes", selectedDonationTypes);
	}, [selectedDonationTypes, setCauseValue]);

	const onSubmitCampaign = async (data: CreateCampaignFormData) => {
		if (selectedCauses.length === 0) {
			setError("Please select at least one cause");
			return;
		}

		try {
			await createCampaign({
				...data,
				causes: selectedCauses.map((causeId) => {
					const cause = causesData?.causes.find((c) => c.id === causeId);
					if (!cause) throw new Error("Cause not found");
					return {
						id: cause.id,
						title: cause.title,
						description: cause.description,
						imageUrl: cause.imageUrl,
						targetAmount: cause.targetAmount,
						tags: cause.tags,
						acceptedDonationTypes: cause.acceptedDonationTypes,
					};
				}),
			}).unwrap();

			setSuccess("Campaign created successfully!");
			setError(null);
			setTimeout(() => {
				router.push("/dashboard/campaigns");
			}, 2000);
		} catch (error) {
			console.error("Failed to create campaign:", error);
			setError("Failed to create campaign. Please try again.");
			setSuccess(null);
		}
	};

	const onSubmitCause = async (data: CreateCauseFormData) => {
		// Validate donation types and tags
		if (selectedDonationTypes.length === 0) {
			setError("Please select at least one donation type");
			return;
		}
		if (newCauseTags.length === 0) {
			setError("Please add at least one tag");
			return;
		}

		try {
			// Get the current organization ID from auth state
			const organizationId = localStorage.getItem("organizationId");
			if (!organizationId) {
				setError("Organization ID not found. Please log in again.");
				return;
			}

			const causeData: CreateCauseBody = {
				title: data.title,
				description: data.description,
				targetAmount: data.targetAmount,
				imageUrl: data.imageUrl || "", // Backend requires imageUrl
				tags: newCauseTags,
				acceptedDonationTypes: selectedDonationTypes,
				campaignId: "", // Empty string for now, will be updated when campaign is created
			};

			await createCause(causeData).unwrap();

			setSuccess("Cause created successfully!");
			await refetchCauses();
			setShowCreateCause(false);
			resetCauseForm();
			setNewCauseTags([]);
			setSelectedDonationTypes([]);
			setNewCauseTagInput("");
			setError(null);
		} catch (error) {
			console.error("Failed to create cause:", error);
			setError("Failed to create cause. Please try again.");
			setSuccess(null);
		}
	};

	const toggleCause = (causeId: string) => {
		setSelectedCauses((prev) =>
			prev.includes(causeId)
				? prev.filter((id) => id !== causeId)
				: [...prev, causeId]
		);
	};

	const toggleDonationType = (type: DonationType) => {
		setSelectedDonationTypes((prev) =>
			prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
		);
	};

	const addTag = () => {
		if (
			newCauseTagInput.trim() &&
			!newCauseTags.includes(newCauseTagInput.trim())
		) {
			setNewCauseTags((prev) => [...prev, newCauseTagInput.trim()]);
			setNewCauseTagInput("");
		}
	};

	const removeTag = (tag: string) => {
		setNewCauseTags((prev) => prev.filter((t) => t !== tag));
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<div className="max-w-5xl mx-auto">
					<div className="bg-white rounded-xl shadow-lg overflow-hidden">
						{/* Header Section */}
						<div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
							<div className="flex justify-between items-center">
								<h1 className="text-2xl font-bold text-white">
									Create Campaign
								</h1>
								<button
									onClick={() => setShowCreateCause(!showCreateCause)}
									className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-colors"
								>
									<Plus className="h-5 w-5 mr-2" />
									{showCreateCause ? "Cancel New Cause" : "Create New Cause"}
								</button>
							</div>
						</div>

						{/* Create Cause Section */}
						{showCreateCause && (
							<div className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
								<div className="p-6">
									<div className="flex items-center mb-6">
										<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
											<Heart className="h-5 w-5 text-blue-600" />
										</div>
										<h2 className="ml-3 text-xl font-semibold text-gray-900">
											Create New Cause
										</h2>
									</div>

									<form
										onSubmit={handleSubmitCause(onSubmitCause)}
										className="space-y-6"
									>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="space-y-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Title
													</label>
													<input
														type="text"
														{...registerCause("title")}
														className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
														placeholder="Enter cause title"
													/>
													{causeErrors.title && (
														<p className="mt-1 text-sm text-red-600">
															{causeErrors.title.message}
														</p>
													)}
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Target Amount
													</label>
													<div className="relative">
														<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
															$
														</span>
														<input
															type="number"
															{...registerCause("targetAmount", {
																valueAsNumber: true,
															})}
															className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
															placeholder="Enter target amount"
														/>
													</div>
													{causeErrors.targetAmount && (
														<p className="mt-1 text-sm text-red-600">
															{causeErrors.targetAmount.message}
														</p>
													)}
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Image URL
														<span className="text-red-500 ml-1">*</span>
													</label>
													<input
														type="url"
														{...registerCause("imageUrl")}
														className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
														placeholder="https://example.com/image.jpg"
													/>
													{causeErrors.imageUrl && (
														<p className="mt-1 text-sm text-red-600">
															{causeErrors.imageUrl.message}
														</p>
													)}
													<p className="mt-1 text-sm text-gray-500">
														Provide a URL for the cause image. This is required.
													</p>
												</div>
											</div>

											<div className="space-y-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Description
													</label>
													<textarea
														{...registerCause("description")}
														rows={4}
														className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
														placeholder="Describe your cause..."
													/>
													{causeErrors.description && (
														<p className="mt-1 text-sm text-red-600">
															{causeErrors.description.message}
														</p>
													)}
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Accepted Donation Types
														<span className="text-red-500 ml-1">*</span>
													</label>
													<div className="flex flex-wrap gap-2">
														{Object.values(DonationType).map((type) => {
															const Icon = donationTypeIcons[type];
															return (
																<button
																	key={type}
																	type="button"
																	onClick={() => toggleDonationType(type)}
																	className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
																		selectedDonationTypes.includes(type)
																			? "bg-blue-100 text-blue-800 ring-2 ring-blue-500 ring-offset-2"
																			: "bg-gray-100 text-gray-800 hover:bg-gray-200"
																	}`}
																>
																	<Icon className="h-4 w-4 mr-1.5" />
																	{type.charAt(0) + type.slice(1).toLowerCase()}
																</button>
															);
														})}
													</div>
													{selectedDonationTypes.length === 0 && (
														<p className="mt-1 text-sm text-red-600">
															Please select at least one donation type
														</p>
													)}
												</div>
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Tags
												<span className="text-red-500 ml-1">*</span>
											</label>
											<div className="flex gap-2 mb-3">
												<input
													type="text"
													value={newCauseTagInput}
													onChange={(e) => setNewCauseTagInput(e.target.value)}
													onKeyPress={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															addTag();
														}
													}}
													placeholder="Add a tag and press Enter"
													className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
												/>
												<button
													type="button"
													onClick={addTag}
													className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
												>
													Add Tag
												</button>
											</div>
											<div className="flex flex-wrap gap-2">
												{newCauseTags.map((tag) => (
													<span
														key={tag}
														className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800"
													>
														{tag}
														<button
															type="button"
															onClick={() => removeTag(tag)}
															className="ml-2 hover:text-blue-600 transition-colors"
														>
															<X className="h-4 w-4" />
														</button>
													</span>
												))}
											</div>
											{newCauseTags.length === 0 && (
												<p className="mt-1 text-sm text-red-600">
													Please add at least one tag
												</p>
											)}
										</div>

										<div className="flex justify-end">
											<button
												type="submit"
												disabled={isCreatingCause}
												className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
											>
												{isCreatingCause ? (
													<>
														<Loader2 className="h-5 w-5 mr-2 animate-spin" />
														Creating Cause...
													</>
												) : (
													<>
														<Plus className="h-5 w-5 mr-2" />
														Create Cause
													</>
												)}
											</button>
										</div>
									</form>
								</div>
							</div>
						)}

						{/* Campaign Form Section */}
						<div className="p-6">
							{error && (
								<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
									<AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
									<p>{error}</p>
								</div>
							)}

							{success && (
								<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-green-700">
									<CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
									<p>{success}</p>
								</div>
							)}

							<form
								onSubmit={handleSubmitCampaign(onSubmitCampaign)}
								className="space-y-6"
							>
								{/* Campaign Details Section */}
								<div className="bg-gray-50 rounded-lg p-6">
									<h2 className="text-lg font-semibold text-gray-900 mb-4">
										Campaign Details
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Campaign Title
											</label>
											<input
												type="text"
												{...registerCampaign("title")}
												className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
												placeholder="Enter campaign title"
											/>
											{campaignErrors.title && (
												<p className="mt-1 text-sm text-red-600">
													{campaignErrors.title.message}
												</p>
											)}
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Image URL (optional)
											</label>
											<input
												type="url"
												{...registerCampaign("imageUrl")}
												className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
												placeholder="https://example.com/image.jpg"
											/>
											{campaignErrors.imageUrl && (
												<p className="mt-1 text-sm text-red-600">
													{campaignErrors.imageUrl.message}
												</p>
											)}
										</div>
									</div>

									<div className="mt-6">
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Description
										</label>
										<textarea
											{...registerCampaign("description")}
											rows={4}
											className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
											placeholder="Describe your campaign..."
										/>
										{campaignErrors.description && (
											<p className="mt-1 text-sm text-red-600">
												{campaignErrors.description.message}
											</p>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Start Date
											</label>
											<div className="relative">
												<input
													type="date"
													{...registerCampaign("startDate")}
													className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
												/>
												<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
											</div>
											{campaignErrors.startDate && (
												<p className="mt-1 text-sm text-red-600">
													{campaignErrors.startDate.message}
												</p>
											)}
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												End Date
											</label>
											<div className="relative">
												<input
													type="date"
													{...registerCampaign("endDate")}
													className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
												/>
												<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
											</div>
											{campaignErrors.endDate && (
												<p className="mt-1 text-sm text-red-600">
													{campaignErrors.endDate.message}
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Causes Selection Section */}
								<div className="bg-gray-50 rounded-lg p-6">
									<div className="flex justify-between items-center mb-4">
										<h2 className="text-lg font-semibold text-gray-900">
											Select Causes
										</h2>
										<span className="text-sm text-gray-500">
											{selectedCauses.length} cause(s) selected
										</span>
									</div>

									{isLoadingCauses ? (
										<div className="flex justify-center py-8">
											<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
										</div>
									) : causesData?.causes.length === 0 ? (
										<div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
											<Heart className="mx-auto h-12 w-12 text-gray-400" />
											<h3 className="mt-2 text-sm font-medium text-gray-900">
												No causes found
											</h3>
											<p className="mt-1 text-sm text-gray-500">
												Get started by creating a new cause.
											</p>
											<button
												type="button"
												onClick={() => setShowCreateCause(true)}
												className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
											>
												<Plus className="h-5 w-5 mr-2" />
												Create New Cause
											</button>
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{causesData?.causes.map((cause) => (
												<button
													key={cause.id}
													type="button"
													onClick={() => toggleCause(cause.id)}
													className={`p-4 border rounded-lg text-left transition-all ${
														selectedCauses.includes(cause.id)
															? "border-blue-200 bg-blue-50 ring-2 ring-blue-500 ring-offset-2"
															: "border-gray-200 hover:bg-gray-50"
													}`}
												>
													<div className="flex items-start gap-4">
														<div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
															{cause.imageUrl ? (
																<img
																	src={cause.imageUrl}
																	alt={cause.title}
																	className="w-full h-full object-cover"
																/>
															) : (
																<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
																	<Heart className="h-8 w-8 text-blue-400" />
																</div>
															)}
														</div>
														<div className="flex-1 min-w-0">
															<h3 className="font-medium text-gray-900 truncate">
																{cause.title}
															</h3>
															<p className="text-sm text-gray-500 line-clamp-2 mt-1">
																{cause.description}
															</p>
															<div className="mt-3 space-y-2">
																<div className="flex items-center gap-4 text-sm">
																	<div className="flex items-center text-gray-600">
																		<DollarSign className="h-4 w-4 mr-1" />
																		<span>
																			{formatCurrency(cause.targetAmount)}
																		</span>
																	</div>
																	<div className="flex items-center text-gray-600">
																		<Users className="h-4 w-4 mr-1" />
																		<span>{cause.donorCount} donors</span>
																	</div>
																</div>
																<div className="flex flex-wrap gap-1">
																	{cause.tags.map((tag) => (
																		<span
																			key={tag}
																			className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
																		>
																			{tag}
																		</span>
																	))}
																</div>
																<div className="flex flex-wrap gap-1">
																	{cause.acceptedDonationTypes.map((type) => {
																		const Icon = donationTypeIcons[type];
																		return (
																			<span
																				key={type}
																				className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
																			>
																				<Icon className="h-3 w-3 mr-1" />
																				{type.charAt(0) +
																					type.slice(1).toLowerCase()}
																			</span>
																		);
																	})}
																</div>
															</div>
														</div>
													</div>
												</button>
											))}
										</div>
									)}
									{campaignErrors.causes && (
										<p className="mt-2 text-sm text-red-600">
											{campaignErrors.causes.message}
										</p>
									)}
								</div>

								{/* Form Actions */}
								<div className="flex justify-end gap-4 pt-6 border-t">
									<button
										type="button"
										onClick={() => router.back()}
										className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={isCreatingCampaign}
										className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										{isCreatingCampaign ? (
											<>
												<Loader2 className="h-5 w-5 mr-2 animate-spin" />
												Creating Campaign...
											</>
										) : (
											<>
												<Plus className="h-5 w-5 mr-2" />
												Create Campaign
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
