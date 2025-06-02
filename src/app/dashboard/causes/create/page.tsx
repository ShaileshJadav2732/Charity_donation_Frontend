"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	TextField,
	Typography,
	Alert,
	Chip,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	ListItemText,
	Checkbox,
	OutlinedInput,
	InputAdornment,
} from "@mui/material";
import { useCreateCauseMutation } from "@/store/api/causeApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DonationType } from "@/types";
import { toast } from "react-hot-toast";
import CloudinaryImageUpload from "@/components/cloudinary/CloudinaryImageUpload";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
	createCauseValidationSchema,
	getValidationErrors,
} from "@/utils/validationSchemas";
import PageHeader from "@/components/ui/PageHeader";
import StandardCard from "@/components/ui/StandardCard";
import { colors, spacing } from "@/styles/theme";
import { Plus, Tag, DollarSign, Package } from "lucide-react";
// Removed campaign-related imports as causes are now created independently

interface FormData {
	title: string;
	description: string;
	targetAmount: number; // Standardized to number for consistency
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

	// Add the missing API hook
	const [createCause, { isLoading }] = useCreateCauseMutation();

	// Initial form values
	const initialValues: FormData = {
		title: "",
		description: "",
		targetAmount: 0,
		imageUrl: "",
		tags: [],
		acceptanceType: "money",
		donationItems: [],
	};

	// Form submission handler
	const handleSubmit = async (values: FormData) => {
		try {
			// Make sure we have an organization ID
			if (!user || !user.id) {
				toast.error("Organization ID not found. Please try logging in again.");
				return;
			}

			// Prepare the cause data
			const causeData = {
				title: values.title,
				description: values.description,
				targetAmount:
					values.acceptanceType !== "items" ? values.targetAmount : 0,
				imageUrl: values.imageUrl,
				tags: values.tags,
				acceptanceType: values.acceptanceType,
				donationItems:
					values.acceptanceType !== "money" ? values.donationItems : [],
				organizationId: user.id,
			};

			await createCause(causeData).unwrap();
			toast.success(
				"Cause created successfully! You can add it to campaigns later from the causes page or campaign management."
			);
			router.push("/dashboard/causes");
		} catch (apiError: unknown) {
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
		<Box sx={{ maxWidth: 800, mx: "auto" }}>
			<PageHeader
				title="Create New Cause"
				subtitle="Create a new cause for your organization. After creation, you can add it to campaigns to make it visible to donors."
				variant="minimal"
				breadcrumbs={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Causes", href: "/dashboard/causes" },
					{ label: "Create" },
				]}
			/>

			<StandardCard variant="outlined">
				<Formik
					initialValues={initialValues}
					validationSchema={createCauseValidationSchema(
						initialValues.acceptanceType
					)}
					onSubmit={handleSubmit}
					enableReinitialize
				>
					{({ values, errors, touched, setFieldValue, setFieldTouched }) => {
						// Update validation schema when acceptance type changes
						const currentSchema = createCauseValidationSchema(
							values.acceptanceType
						);

						return (
							<Form>
								<Box display="grid" gap={3}>
									<Field
										as={TextField}
										fullWidth
										label="Cause Title"
										name="title"
										error={touched.title && !!errors.title}
										helperText={<ErrorMessage name="title" />}
									/>

									<Field
										as={TextField}
										fullWidth
										label="Description"
										name="description"
										multiline
										rows={4}
										error={touched.description && !!errors.description}
										helperText={<ErrorMessage name="description" />}
									/>

									{/* Target Amount - only show for money or both acceptance types */}
									{values.acceptanceType !== "items" && (
										<Field
											as={TextField}
											fullWidth
											label="Target Amount"
											name="targetAmount"
											type="number"
											error={touched.targetAmount && !!errors.targetAmount}
											helperText={<ErrorMessage name="targetAmount" />}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<DollarSign
																size={20}
																color={colors.primary.main}
															/>
														</InputAdornment>
													),
												},
											}}
											sx={{
												"& .MuiOutlinedInput-root": {
													"& fieldset": {
														borderColor: colors.grey[300],
													},
													"&:hover fieldset": {
														borderColor: colors.primary.main,
													},
													"&.Mui-focused fieldset": {
														borderColor: colors.primary.main,
													},
												},
											}}
										/>
									)}

									<CloudinaryImageUpload
										onImageUpload={(imageUrl: string) =>
											setFieldValue("imageUrl", imageUrl)
										}
										currentImageUrl={values.imageUrl}
										label="Cause Image"
										helperText="Upload an image for your cause (max 5MB). Supported formats: JPG, PNG, WebP, GIF"
									/>
									{touched.imageUrl && errors.imageUrl && (
										<Typography color="error" variant="caption">
											{errors.imageUrl}
										</Typography>
									)}

									<FormControl
										fullWidth
										error={touched.acceptanceType && !!errors.acceptanceType}
									>
										<InputLabel id="acceptance-type-label">
											Acceptance Type
										</InputLabel>
										<Select
											labelId="acceptance-type-label"
											id="acceptance-type"
											value={values.acceptanceType}
											label="Acceptance Type"
											onChange={(e) => {
												const value = e.target.value as
													| "money"
													| "items"
													| "both";
												setFieldValue("acceptanceType", value);
												// Reset donation items if changing to money-only
												if (value === "money") {
													setFieldValue("donationItems", []);
												}
											}}
										>
											<MenuItem value="money">Money Only</MenuItem>
											<MenuItem value="items">Items Only</MenuItem>
											<MenuItem value="both">Both Money and Items</MenuItem>
										</Select>
										{touched.acceptanceType && errors.acceptanceType && (
											<Typography color="error" variant="caption">
												{errors.acceptanceType}
											</Typography>
										)}
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ mt: 1 }}
										>
											Select what type of donations your cause will accept. This
											will determine what options donors see when making a
											donation.
										</Typography>
									</FormControl>

									{/* Donation Items - only show for items or both acceptance types */}
									{values.acceptanceType !== "money" && (
										<FormControl
											fullWidth
											error={touched.donationItems && !!errors.donationItems}
										>
											<InputLabel id="donation-items-label">
												Donation Items
											</InputLabel>
											<Select
												labelId="donation-items-label"
												id="donation-items"
												multiple
												value={values.donationItems}
												onChange={(e) =>
													setFieldValue("donationItems", e.target.value)
												}
												input={<OutlinedInput label="Donation Items" />}
												renderValue={(selected) => selected.join(", ")}
											>
												{DONATION_ITEMS.map((item) => (
													<MenuItem key={item} value={item}>
														<Checkbox
															checked={values.donationItems.indexOf(item) > -1}
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
											{touched.donationItems && errors.donationItems && (
												<Typography color="error" variant="caption">
													{errors.donationItems}
												</Typography>
											)}
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{ mt: 1 }}
											>
												Select the specific items your cause needs. These will
												be shown to donors when they make item donations. Items
												are automatically categorized into donation types for
												analytics purposes.
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
													onClick={() => {
														const currentTags = values.tags;
														const newTags = currentTags.includes(tag)
															? currentTags.filter((t) => t !== tag)
															: [...currentTags, tag];
														setFieldValue("tags", newTags);
													}}
													color={
														values.tags.includes(tag) ? "primary" : "default"
													}
													variant={
														values.tags.includes(tag) ? "filled" : "outlined"
													}
												/>
											))}
										</Box>
										{touched.tags && errors.tags && (
											<Typography color="error" variant="caption">
												{errors.tags}
											</Typography>
										)}
									</Box>

									<Box
										display="flex"
										gap={spacing.md / 8}
										justifyContent="flex-end"
										mt={spacing.lg / 8}
									>
										<Button
											variant="outlined"
											onClick={() => router.push("/dashboard/causes")}
											sx={{
												borderColor: colors.grey[400],
												color: colors.text.secondary,
												"&:hover": {
													borderColor: colors.primary.main,
													color: colors.primary.main,
												},
											}}
										>
											Cancel
										</Button>
										<Button
											type="submit"
											variant="contained"
											disabled={isLoading}
											startIcon={<Plus size={20} />}
											sx={{
												backgroundColor: colors.primary.main,
												"&:hover": {
													backgroundColor: colors.primary.dark,
												},
												"&:disabled": {
													backgroundColor: colors.grey[300],
												},
											}}
										>
											{isLoading ? "Creating..." : "Create Cause"}
										</Button>
									</Box>
								</Box>
							</Form>
						);
					}}
				</Formik>
			</StandardCard>
		</Box>
	);
};

export default CreateCausePage;
