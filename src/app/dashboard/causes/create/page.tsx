"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	TextField,
	Typography,
	Paper,
	Alert,
	Chip,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	ListItemText,
	Checkbox,
	OutlinedInput,
	SelectChangeEvent,
} from "@mui/material";
import { useCreateCauseMutation } from "@/store/api/causeApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DonationType } from "@/types/donation";
import { toast } from "react-hot-toast";
// Removed campaign-related imports as causes are now created independently

interface FormData {
	title: string;
	description: string;
	targetAmount: string;
	imageUrl: string;
	tags: string[];
	acceptanceType: "money" | "items" | "both";
	donationItems: string[];
}

const SUGGESTED_TAGS = [
	"Education",
	"Healthcare",
	"Environment",
	"Children",
	"Animals",
	"Elderly",
	"Poverty",
	"Disaster",
	"Water",
	"Food",
	"Shelter",
	"Community",
];

// Map donation items to their corresponding types for better consistency
const DONATION_ITEMS_MAP: Record<string, DonationType> = {
	Clothes: DonationType.CLOTHES,
	"Winter Clothing": DonationType.CLOTHES,
	"Summer Clothing": DonationType.CLOTHES,
	"Children's Clothing": DonationType.CLOTHES,
	Books: DonationType.BOOKS,
	Textbooks: DonationType.BOOKS,
	"Children's Books": DonationType.BOOKS,
	"Educational Materials": DonationType.BOOKS,
	Toys: DonationType.TOYS,
	"Children's Toys": DonationType.TOYS,
	"Board Games": DonationType.TOYS,
	Food: DonationType.FOOD,
	"Non-perishable Food": DonationType.FOOD,
	"Canned Goods": DonationType.FOOD,
	"Baby Food": DonationType.FOOD,
	Furniture: DonationType.FURNITURE,
	Beds: DonationType.FURNITURE,
	Tables: DonationType.FURNITURE,
	Chairs: DonationType.FURNITURE,
	"Household Items": DonationType.HOUSEHOLD,
	"Kitchen Supplies": DonationType.HOUSEHOLD,
	"Cleaning Supplies": DonationType.HOUSEHOLD,
	Bedding: DonationType.HOUSEHOLD,
	"Medical Supplies": DonationType.OTHER,
	"Hygiene Products": DonationType.OTHER,
	"Baby Items": DonationType.OTHER,
	"Sports Equipment": DonationType.OTHER,
	"School Supplies": DonationType.OTHER,
	Electronics: DonationType.OTHER,
	Other: DonationType.OTHER,
};

// List of donation items for the UI
const DONATION_ITEMS = Object.keys(DONATION_ITEMS_MAP);

const CreateCausePage = () => {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [createCause, { isLoading, error }] = useCreateCauseMutation();

	// Removed campaign-related hooks as causes are now created independently

	const [formData, setFormData] = useState<FormData>({
		title: "",
		description: "",
		targetAmount: "",
		imageUrl: "https://placehold.co/600x400?text=Cause",
		tags: [],
		acceptanceType: "money",
		donationItems: [],
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
	) => {
		const { name, value } = e.target;
		if (name) {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleTagToggle = (tag: string) => {
		setFormData((prev) => {
			const newTags = prev.tags.includes(tag)
				? prev.tags.filter((t) => t !== tag)
				: [...prev.tags, tag];
			return {
				...prev,
				tags: newTags,
			};
		});
	};

	const handleAcceptanceTypeChange = (event: SelectChangeEvent<string>) => {
		const value = event.target.value as "money" | "items" | "both";
		setFormData((prev) => ({
			...prev,
			acceptanceType: value,
			// Reset donation items if changing to money-only
			donationItems: value === "money" ? [] : prev.donationItems,
		}));
	};

	const handleDonationItemsChange = (event: SelectChangeEvent<string[]>) => {
		const value = event.target.value as string[];
		setFormData((prev) => ({
			...prev,
			donationItems: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			// Make sure we have an organization ID
			if (!user || !user.id) {
				console.error("No organization ID found");
				return;
			}

			const payload = {
				title: formData.title,
				description: formData.description,
				targetAmount: parseFloat(formData.targetAmount),
				imageUrl: formData.imageUrl,
				tags: formData.tags,
				organizationId: user.id,
				acceptanceType: formData.acceptanceType,
				donationItems:
					formData.acceptanceType !== "money" ? formData.donationItems : [],
				// Convert accepted donation types based on acceptanceType
				acceptedDonationTypes:
					formData.acceptanceType === "money"
						? [DonationType.MONEY]
						: formData.acceptanceType === "items"
						? [
								...new Set(
									formData.donationItems.map(
										(item) => DONATION_ITEMS_MAP[item] || DonationType.OTHER
									)
								),
						  ]
						: [
								DonationType.MONEY,
								...new Set(
									formData.donationItems.map(
										(item) => DONATION_ITEMS_MAP[item] || DonationType.OTHER
									)
								),
						  ],
			};

			console.log("Creating cause with payload:", payload);

			// Create the cause
			const response = await createCause(payload).unwrap();
			console.log("Cause created successfully:", response);

			// Show success message
			toast.success(
				"Cause created successfully! You can add it to campaigns later from the causes page or campaign management."
			);

			// Navigate back to causes page
			router.push("/dashboard/causes");
		} catch (apiError: unknown) {
			console.error("API Error:", apiError);
			// Try to extract detailed error message
			const errorMessage =
				typeof apiError === "object" &&
				apiError !== null &&
				"data" in apiError &&
				typeof apiError.data === "object" &&
				apiError.data !== null &&
				"message" in apiError.data
					? apiError.data.message
					: typeof apiError === "object" &&
					  apiError !== null &&
					  "error" in apiError
					? (apiError as { error: string }).error
					: "Failed to create cause. Please try again.";
			toast.error(`Error: ${errorMessage}`);
		}
	};

	if (!user || user.role !== "organization") {
		return (
			<Box p={4}>
				<Alert severity="error">
					Access Denied. Only organizations can create causes.
				</Alert>
			</Box>
		);
	}

	return (
		<Box p={4}>
			<Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
				<Typography variant="h4" gutterBottom>
					Create New Cause
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Create a new cause for your organization. After creation, you can add
					it to campaigns to make it visible to donors.
				</Typography>

				<form onSubmit={handleSubmit}>
					<Box display="grid" gap={3}>
						<TextField
							fullWidth
							label="Cause Title"
							name="title"
							value={formData.title}
							onChange={handleChange}
							required
						/>

						<TextField
							fullWidth
							label="Description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							multiline
							rows={4}
							required
						/>

						<TextField
							fullWidth
							label="Target Amount"
							name="targetAmount"
							type="number"
							value={formData.targetAmount}
							onChange={handleChange}
							required
							// @ts-ignore - InputProps is deprecated but still works
							InputProps={{
								startAdornment: <span>$</span>,
							}}
						/>

						<TextField
							fullWidth
							label="Image URL"
							name="imageUrl"
							value={formData.imageUrl}
							onChange={handleChange}
							required
							helperText="Enter the URL of the cause image"
						/>

						<FormControl fullWidth>
							<InputLabel id="acceptance-type-label">
								Acceptance Type
							</InputLabel>
							<Select
								labelId="acceptance-type-label"
								id="acceptance-type"
								value={formData.acceptanceType}
								label="Acceptance Type"
								onChange={handleAcceptanceTypeChange}
							>
								<MenuItem value="money">Money Only</MenuItem>
								<MenuItem value="items">Items Only</MenuItem>
								<MenuItem value="both">Both Money and Items</MenuItem>
							</Select>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mt: 1 }}
							>
								Select what type of donations your cause will accept. This will
								determine what options donors see when making a donation.
							</Typography>
						</FormControl>

						{/* Campaign selection removed - causes can now be created independently */}

						{formData.acceptanceType !== "money" && (
							<FormControl fullWidth>
								<InputLabel id="donation-items-label">
									Donation Items
								</InputLabel>
								<Select
									labelId="donation-items-label"
									id="donation-items"
									multiple
									value={formData.donationItems}
									onChange={handleDonationItemsChange}
									input={<OutlinedInput label="Donation Items" />}
									renderValue={(selected) => selected.join(", ")}
								>
									{DONATION_ITEMS.map((item) => (
										<MenuItem key={item} value={item}>
											<Checkbox
												checked={formData.donationItems.indexOf(item) > -1}
											/>
											<ListItemText
												primary={item}
												secondary={
													DONATION_ITEMS_MAP[item] === DonationType.OTHER
														? "Categorized as: Other"
														: `Categorized as: ${DONATION_ITEMS_MAP[item]}`
												}
											/>
										</MenuItem>
									))}
								</Select>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ mt: 1 }}
								>
									Select the specific items your cause needs. These will be
									shown to donors when they make item donations. Items are
									automatically categorized into donation types for analytics
									purposes.
								</Typography>
							</FormControl>
						)}

						<Box>
							<Typography variant="subtitle1" gutterBottom>
								Tags
							</Typography>
							<Box display="flex" gap={1} flexWrap="wrap">
								{SUGGESTED_TAGS.map((tag) => (
									<Chip
										key={tag}
										label={tag}
										onClick={() => handleTagToggle(tag)}
										color={formData.tags.includes(tag) ? "primary" : "default"}
										variant={
											formData.tags.includes(tag) ? "filled" : "outlined"
										}
									/>
								))}
							</Box>
						</Box>

						{error && (
							<Alert severity="error">
								Failed to create cause. Please try again.
							</Alert>
						)}

						<Box display="flex" gap={2} justifyContent="flex-end">
							<Button
								variant="outlined"
								onClick={() => router.push("/dashboard/causes")}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="contained"
								color="primary"
								disabled={isLoading}
							>
								{isLoading ? "Creating..." : "Create Cause"}
							</Button>
						</Box>
					</Box>
				</form>
			</Paper>
		</Box>
	);
};

export default CreateCausePage;
