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
import { DonationType } from "@/types/donation";
import CauseSelector from "@/components/campaigns/CauseSelector";

export default function CreateCampaignPage() {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [causes, setCauses] = useState<string[]>([]);
	const [acceptedDonationTypes, setAcceptedDonationTypes] = useState<DonationType[]>([]);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");
	const [notification, setNotification] = useState<{
		type: "error" | "success";
		message: string;
	} | null>(null);
	const [activeStep, setActiveStep] = useState(1);
	const totalSteps = 3;

	// Fetch organization's causes
	const { data: causesData, isLoading: causesLoading, error: causesError } = useGetOrganizationCausesQuery({
		organizationId: user?._id || "",
		params: { limit: 100 }
	});

	const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation();

	// Protect route for organizations only
	useRouteGuard("organization");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Validate required fields
		if (!title || !description || !causes.length || !acceptedDonationTypes.length || !startDate || !endDate || !imageUrl) {
			setNotification({
				type: "error",
				message: "Please fill in all required fields"
			});
			return;
		}

		// Validate dates
		const start = new Date(startDate);
		const end = new Date(endDate);
		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			setNotification({
				type: "error",
				message: "Invalid date format"
			});
			return;
		}
		if (start >= end) {
			setNotification({
				type: "error",
				message: "End date must be after start date"
			});
			return;
		}

		try {
			const response = await createCampaign({
				title,
				description,
				causes,
				acceptedDonationTypes,
				startDate,
				endDate,
				imageUrl,
				tags
			}).unwrap();

			if (response.success) {
				setNotification({
					type: "success",
					message: "Campaign created successfully"
				});

				// Redirect to campaigns list after successful creation
				setTimeout(() => {
					router.push("/dashboard/campaigns?new=true");
				}, 2000);
			} else {
				throw new Error(response.message || "Failed to create campaign");
			}
		} catch (error) {
			setNotification({
				type: "error",
				message: error instanceof Error ? error.message : "Failed to create campaign. Please try again."
			});
			console.error("Create campaign error:", error);
		}
	};

	const handleAddTag = () => {
		if (tagInput.trim() && !tags.includes(tagInput.trim())) {
			setTags([...tags, tagInput.trim()]);
			setTagInput("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setTags(tags.filter(tag => tag !== tagToRemove));
	};

	const handleCreateCause = () => {
		router.push("/dashboard/causes/create?returnTo=/dashboard/campaigns/create");
	};

	const nextStep = () => {
		if (activeStep < totalSteps) {
			setActiveStep(activeStep + 1);
		}
	};

	const prevStep = () => {
		if (activeStep > 1) {
			setActiveStep(activeStep - 1);
		}
	};

	const renderStepIndicator = () => (
		<div className="mb-8">
			<div className="flex items-center justify-between">
				{[1, 2, 3].map((step) => (
					<div key={step} className="flex items-center">
						<div
							className={`flex items-center justify-center w-8 h-8 rounded-full ${step === activeStep
								? "bg-teal-600 text-white"
								: step < activeStep
									? "bg-teal-100 text-teal-600"
									: "bg-gray-200 text-gray-600"
								}`}
						>
							{step}
						</div>
						{step < totalSteps && (
							<div
								className={`w-full h-1 mx-2 ${step < activeStep ? "bg-teal-600" : "bg-gray-200"
									}`}
							/>
						)}
					</div>
				))}
			</div>
			<div className="flex justify-between mt-2 text-sm text-gray-600">
				<span>Basic Info</span>
				<span>Causes & Donations</span>
				<span>Additional Details</span>
			</div>
		</div>
	);

	const renderStepContent = () => {
		switch (activeStep) {
			case 1:
				return (
					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700">Campaign Title</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
								placeholder="Enter campaign title"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Description</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								required
								rows={4}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
								placeholder="Enter campaign description"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">Start Date</label>
								<input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									required
									min={new Date().toISOString().split('T')[0]}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">End Date</label>
								<input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									required
									min={startDate || new Date().toISOString().split('T')[0]}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
								/>
							</div>
						</div>
					</div>
				);
			case 2:
				return (
					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-4">Select Causes</label>
							<CauseSelector
								causes={causesData?.data?.causes || []}
								selectedCauses={causes}
								onCausesChange={setCauses}
								onCreateCause={handleCreateCause}
								isLoading={causesLoading}
								error={causesError}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-4">Accepted Donation Types</label>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
								{Object.values(DonationType).map((type) => (
									<label
										key={type}
										className={`relative flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${acceptedDonationTypes.includes(type)
											? "border-teal-500 bg-teal-50"
											: "border-gray-200 hover:border-teal-300"
											}`}
									>
										<input
											type="checkbox"
											checked={acceptedDonationTypes.includes(type)}
											onChange={(e) => {
												if (e.target.checked) {
													setAcceptedDonationTypes([...acceptedDonationTypes, type]);
												} else {
													setAcceptedDonationTypes(acceptedDonationTypes.filter(t => t !== type));
												}
											}}
											className="sr-only"
										/>
										<div className="flex items-center">
											<div
												className={`h-5 w-5 rounded border flex items-center justify-center ${acceptedDonationTypes.includes(type)
													? "bg-teal-500 border-teal-500"
													: "border-gray-300"
													}`}
											>
												{acceptedDonationTypes.includes(type) && (
													<svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
														<path d="M9.707 2.293a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L4 6.586 8.293 2.293a1 1 0 011.414 0z" />
													</svg>
												)}
											</div>
											<span className="ml-3 text-sm font-medium text-gray-900">
												{type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
											</span>
										</div>
									</label>
								))}
							</div>
							{acceptedDonationTypes.length === 0 && (
								<p className="mt-2 text-sm text-red-600">Please select at least one donation type</p>
							)}
						</div>
					</div>
				);
			case 3:
				return (
					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700">Campaign Image URL</label>
							<input
								type="url"
								value={imageUrl}
								onChange={(e) => setImageUrl(e.target.value)}
								required
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
								placeholder="Enter image URL"
							/>
							<p className="mt-1 text-sm text-gray-500">
								Enter a URL for your campaign's main image. This will be displayed on the campaign page.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Tags</label>
							<div className="mt-1 flex gap-2">
								<input
									type="text"
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleAddTag();
										}
									}}
									className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
									placeholder="Add a tag"
								/>
								<button
									type="button"
									onClick={handleAddTag}
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
								>
									Add Tag
								</button>
							</div>
							<div className="mt-2 flex flex-wrap gap-2">
								{tags.map((tag) => (
									<span
										key={tag}
										className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
									>
										{tag}
										<button
											type="button"
											onClick={() => handleRemoveTag(tag)}
											className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
										>
											<span className="sr-only">Remove tag</span>
											<FaTimes className="h-2 w-2" />
										</button>
									</span>
								))}
							</div>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{notification && (
				<div className={`p-4 rounded-lg mb-6 ${notification.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
					{notification.message}
				</div>
			)}

			<div className="max-w-3xl mx-auto">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Campaign</h1>

				{renderStepIndicator()}

				<form onSubmit={handleSubmit} className="space-y-6">
					{renderStepContent()}

					<div className="flex justify-between pt-6">
						<button
							type="button"
							onClick={prevStep}
							disabled={activeStep === 1}
							className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${activeStep === 1 ? "opacity-50 cursor-not-allowed" : ""
								}`}
						>
							Previous
						</button>

						{activeStep < totalSteps ? (
							<button
								type="button"
								onClick={nextStep}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
							>
								Next
							</button>
						) : (
							<button
								type="submit"
								disabled={isCreating}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
							>
								{isCreating ? "Creating..." : "Create Campaign"}
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
