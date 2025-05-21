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
} from "@mui/material";
import { useCreateCauseMutation } from "@/store/api/causeApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface FormData {
	title: string;
	description: string;
	targetAmount: string;
	imageUrl: string;
	tags: string[];
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
