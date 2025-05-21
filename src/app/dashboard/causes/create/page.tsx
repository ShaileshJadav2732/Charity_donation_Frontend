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

interface FormData {
	title: string;
	description: string;
	targetAmount: string;
	imageUrl: string;
	tags: string[];
	acceptanceType: 'money' | 'items' | 'both';
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

const DONATION_ITEMS = [
	"Clothes",
	"Books",
	"Toys",
	"Food",
	"Furniture",
	"Electronics",
	"Household Items",
	"School Supplies",
	"Medical Supplies",
	"Hygiene Products",
	"Baby Items",
	"Sports Equipment",
];

const CreateCausePage = () => {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [createCause, { isLoading, error }] = useCreateCauseMutation();

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
		const value = event.target.value as 'money' | 'items' | 'both';
		setFormData((prev) => ({
			...prev,
			acceptanceType: value,
			// Reset donation items if changing to money-only
			donationItems: value === 'money' ? [] : prev.donationItems,
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
				donationItems: formData.acceptanceType !== 'money' ? formData.donationItems : [],
				// Convert accepted donation types based on acceptanceType
				acceptedDonationTypes: formData.acceptanceType === 'money'
					? [DonationType.MONEY]
					: formData.acceptanceType === 'items'
						? formData.donationItems.map(item => {
							// Map donation items to DonationType enum values
							switch (item.toUpperCase()) {
								case 'CLOTHES': return DonationType.CLOTHES;
								case 'BOOKS': return DonationType.BOOKS;
								case 'TOYS': return DonationType.TOYS;
								case 'FOOD': return DonationType.FOOD;
								case 'FURNITURE': return DonationType.FURNITURE;
								case 'HOUSEHOLD ITEMS': return DonationType.HOUSEHOLD;
								default: return DonationType.OTHER;
							}
						})
						: [DonationType.MONEY, ...formData.donationItems.map(item => {
							// Map donation items to DonationType enum values for 'both' type
							switch (item.toUpperCase()) {
								case 'CLOTHES': return DonationType.CLOTHES;
								case 'BOOKS': return DonationType.BOOKS;
								case 'TOYS': return DonationType.TOYS;
								case 'FOOD': return DonationType.FOOD;
								case 'FURNITURE': return DonationType.FURNITURE;
								case 'HOUSEHOLD ITEMS': return DonationType.HOUSEHOLD;
								default: return DonationType.OTHER;
							}
						})],
			};

			console.log("Creating cause with payload:", payload);

			const response = await createCause(payload).unwrap();
			console.log("Cause created successfully:", response);
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
			alert(`Error: ${errorMessage}`);
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
							<InputLabel id="acceptance-type-label">Acceptance Type</InputLabel>
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
						</FormControl>

						{formData.acceptanceType !== 'money' && (
							<FormControl fullWidth>
								<InputLabel id="donation-items-label">Donation Items</InputLabel>
								<Select
									labelId="donation-items-label"
									id="donation-items"
									multiple
									value={formData.donationItems}
									onChange={handleDonationItemsChange}
									input={<OutlinedInput label="Donation Items" />}
									renderValue={(selected) => selected.join(', ')}
								>
									{DONATION_ITEMS.map((item) => (
										<MenuItem key={item} value={item}>
											<Checkbox checked={formData.donationItems.indexOf(item) > -1} />
											<ListItemText primary={item} />
										</MenuItem>
									))}
								</Select>
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
