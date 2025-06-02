"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Typography,
	Alert,
	Chip,
	List,
	ListItem,
	ListItemText,
	Checkbox,
	FormControlLabel,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	Divider,
	CircularProgress,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useCreateCampaignMutation } from "@/store/api/campaignApi";
import {
	useGetCausesQuery,
	useCreateCauseMutation,
} from "@/store/api/causeApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Dayjs } from "dayjs";

import { DonationType } from "@/types";
import { Cause, CreateCauseBody } from "@/types/cause";
import { Plus, X, RefreshCw, Calendar, Target } from "lucide-react";

import { toast } from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import StandardCard from "@/components/ui/StandardCard";
import { colors, spacing } from "@/styles/theme";
import CloudinaryImageUpload from "@/components/cloudinary/CloudinaryImageUpload";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { createCampaignValidationSchema } from "@/utils/validationSchemas";

interface FormData {
	title: string;
	description: string;
	startDate: Dayjs | null;
	endDate: Dayjs | null;
	totalTargetAmount: number; // Standardized to number for consistency
	status: string;
	acceptedDonationTypes: DonationType[];
	imageUrl: string;
	selectedCauses: string[];
}

interface CauseFormData {
	title: string;
	description: string;
	targetAmount: number; // Standardized to number for consistency
	imageUrl: string;
	tags: string[];
}

const DONATION_TYPES = [
	{ value: DonationType.MONEY, label: "Money" },
	{ value: DonationType.CLOTHES, label: "Clothes" },
	{ value: DonationType.BLOOD, label: "Blood" },
	{ value: DonationType.FOOD, label: "Food" },
	{ value: DonationType.TOYS, label: "Toys" },
	{ value: DonationType.BOOKS, label: "Books" },
	{ value: DonationType.FURNITURE, label: "Furniture" },
	{ value: DonationType.HOUSEHOLD, label: "Household" },
	{ value: DonationType.OTHER, label: "Other" },
];

const CreateCampaignPage = () => {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [createCause, { isLoading: isCreatingCause, error: causeError }] =
		useCreateCauseMutation();
	const [createCampaign] = useCreateCampaignMutation();

	const {
		data: causesData,
		isLoading: isLoadingCauses,
		refetch: refetchCauses,
	} = useGetCausesQuery({
		organizationId: user?.id,
	});

	// Remove hard-coded color - use theme colors

	// Initial form values for Formik
	const initialValues: FormData = {
		title: "",
		description: "",
		startDate: null,
		endDate: null,
		totalTargetAmount: 0,
		status: "draft",
		acceptedDonationTypes: [DonationType.MONEY],
		imageUrl: "",
		selectedCauses: [],
	};

	// New cause creation modal
	const [isCreateCauseModalOpen, setIsCreateCauseModalOpen] = useState(false);
	const [causeFormData, setCauseFormData] = useState<CauseFormData>({
		title: "",
		description: "",
		targetAmount: 0, // Initialize as number
		imageUrl: "",
		tags: [],
	});

	// Form submission handler for Formik
	const handleSubmit = async (values: FormData) => {
		try {
			if (!user) {
				throw new Error("User not found");
			}

			const campaignData = {
				title: values.title,
				description: values.description,
				startDate: values.startDate!.toISOString(),
				endDate: values.endDate!.toISOString(),
				totalTargetAmount: values.totalTargetAmount,
				status: values.status,
				acceptedDonationTypes: values.acceptedDonationTypes,
				imageUrl: values.imageUrl,
				causes: values.selectedCauses,
				organizations: [user.id],
			};

			await createCampaign(campaignData).unwrap();
			toast.success("Campaign created successfully!");
			router.push("/dashboard/campaigns");
		} catch {
			toast.error(
				"Failed to create campaign. Please check the form and try again."
			);
		}
	};

	const handleCauseFormChange = (
		e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
	) => {
		const { name, value } = e.target;
		if (name) {
			setCauseFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleOpenCreateCauseModal = () => {
		setIsCreateCauseModalOpen(true);
	};

	const handleCloseCreateCauseModal = () => {
		setIsCreateCauseModalOpen(false);
		setCauseFormData({
			title: "",
			description: "",
			targetAmount: 0, // Reset to number
			imageUrl: "",
			tags: [],
		});
	};

	const handleCreateCause = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			if (!user || !user.id) {
				toast.error("Organization ID is required");
				return;
			}

			// Create the cause payload
			const payload: CreateCauseBody = {
				title: causeFormData.title,
				description: causeFormData.description,
				targetAmount: causeFormData.targetAmount, // Already a number, no conversion needed
				imageUrl: causeFormData.imageUrl,
				tags: causeFormData.tags,
				organizationId: user.id,
			};

			// Validate only the title
			if (!payload.title) {
				toast.error("Cause title is required");
				return;
			}

			// Call the API to create the cause
			const response = await createCause(payload).unwrap();

			// Add the newly created cause to selected causes
			if (response.cause && response.cause.id) {
				// This will be handled by the parent Formik form
				// We'll need to pass setFieldValue to this function

				// Refresh the causes list
				refetchCauses();

				// Close the modal
				handleCloseCreateCauseModal();
				toast.success("Cause created successfully!");
			}
		} catch {
			toast.error("Failed to create cause. Please try again.");
		}
	};

	if (!user || user.role !== "organization") {
		return (
			<Box p={4}>
				<Alert severity="error">
					Access Denied. Only organizations can create campaigns.
				</Alert>
			</Box>
		);
	}

	const renderCausesSection = (values: FormData, setFieldValue: any) => {
		if (isLoadingCauses) {
			return (
				<Box display="flex" justifyContent="center" p={3}>
					<CircularProgress size={30} />
				</Box>
			);
		}

		return (
			<List
				sx={{
					maxHeight: 300,
					overflow: "auto",
					bgcolor: "background.paper",
					border: "1px solid #e0e0e0",
					borderRadius: 1,
				}}
			>
				{causesData?.causes?.map((cause: Cause) => (
					<ListItem key={cause.id} disablePadding>
						<FormControlLabel
							control={
								<Checkbox
									checked={values.selectedCauses.includes(cause.id)}
									onChange={() => {
										const currentCauses = values.selectedCauses;
										const newCauses = currentCauses.includes(cause.id)
											? currentCauses.filter((id) => id !== cause.id)
											: [...currentCauses, cause.id];
										setFieldValue("selectedCauses", newCauses);
									}}
								/>
							}
							label={
								<ListItemText
									primary={cause.title}
									secondary={`Target: $${cause.targetAmount.toLocaleString()}`}
								/>
							}
							sx={{ width: "100%", m: 0, p: 1 }}
						/>
					</ListItem>
				))}
			</List>
		);
	};

	return (
		<Box sx={{ maxWidth: 900, mx: "auto" }}>
			<PageHeader
				title="Create New Campaign"
				subtitle="Set up a new fundraising campaign for your organization"
				variant="minimal"
				breadcrumbs={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Campaigns", href: "/dashboard/campaigns" },
					{ label: "Create" },
				]}
			/>

			<StandardCard variant="outlined">
				<Formik
					initialValues={initialValues}
					validationSchema={createCampaignValidationSchema()}
					onSubmit={handleSubmit}
				>
					{({ values, errors, touched, setFieldValue }) => (
						<Form>
							<Box display="grid" gap={3}>
								<Field
									as={FormInput}
									fullWidth
									label="Campaign Title"
									name="title"
									error={touched.title && !!errors.title}
									helperText={<ErrorMessage name="title" />}
									placeholder="Enter a compelling campaign title"
								/>

								<Field
									as={FormInput}
									fullWidth
									label="Description"
									name="description"
									multiline
									rows={4}
									error={touched.description && !!errors.description}
									helperText={<ErrorMessage name="description" />}
									placeholder="Describe your campaign goals and impact"
								/>

								<Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
									<DatePicker
										label="Start Date"
										value={values.startDate}
										onChange={(date) => setFieldValue("startDate", date)}
										slotProps={{
											textField: {
												required: true,
												fullWidth: true,
												error: touched.startDate && !!errors.startDate,
												helperText: touched.startDate && errors.startDate,
												sx: {
													"& .MuiOutlinedInput-root": {
														borderRadius: 2,
														"&.Mui-focused": {
															"& .MuiOutlinedInput-notchedOutline": {
																borderColor: customColor,
															},
														},
													},
												},
											},
										}}
									/>

									<DatePicker
										label="End Date"
										value={values.endDate}
										onChange={(date) => setFieldValue("endDate", date)}
										slotProps={{
											textField: {
												required: true,
												fullWidth: true,
												error: touched.endDate && !!errors.endDate,
												helperText: touched.endDate && errors.endDate,
												sx: {
													"& .MuiOutlinedInput-root": {
														borderRadius: 2,
														"&.Mui-focused": {
															"& .MuiOutlinedInput-notchedOutline": {
																borderColor: customColor,
															},
														},
													},
												},
											},
										}}
									/>
								</Box>

								<CloudinaryImageUpload
									onImageUpload={(imageUrl: string) =>
										setFieldValue("imageUrl", imageUrl)
									}
									currentImageUrl={values.imageUrl}
									label="Campaign Image"
									helperText="Upload an image for your campaign (max 5MB). Supported formats: JPG, PNG, WebP, GIF"
								/>
								{touched.imageUrl && errors.imageUrl && (
									<Typography color="error" variant="caption">
										{errors.imageUrl}
									</Typography>
								)}

								<FormControl
									fullWidth
									error={touched.status && !!errors.status}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: 2,
											"&.Mui-focused": {
												"& .MuiOutlinedInput-notchedOutline": {
													borderColor: customColor,
												},
											},
										},
									}}
								>
									<InputLabel>Status</InputLabel>
									<Select
										name="status"
										value={values.status}
										onChange={(e) => setFieldValue("status", e.target.value)}
										required
									>
										<MenuItem value="draft">Draft</MenuItem>
										<MenuItem value="active">Active</MenuItem>
										<MenuItem value="paused">Paused</MenuItem>
									</Select>
									{touched.status && errors.status && (
										<Typography color="error" variant="caption">
											{errors.status}
										</Typography>
									)}
								</FormControl>

								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.1 }}
								>
									<Typography
										variant="subtitle1"
										gutterBottom
										sx={{
											fontWeight: 600,
											color: customColor,
											mb: 2,
										}}
									>
										Accepted Donation Types
									</Typography>
									<Box display="flex" gap={1} flexWrap="wrap">
										{DONATION_TYPES.map((type) => (
											<Chip
												key={type.value}
												label={type.label}
												onClick={() => {
													const currentTypes = values.acceptedDonationTypes;
													const newTypes = currentTypes.includes(type.value)
														? currentTypes.filter((t) => t !== type.value)
														: [...currentTypes, type.value];
													setFieldValue("acceptedDonationTypes", newTypes);
												}}
												sx={{
													backgroundColor:
														values.acceptedDonationTypes.includes(type.value)
															? customColor
															: "transparent",
													color: values.acceptedDonationTypes.includes(
														type.value
													)
														? "white"
														: customColor,
													borderColor: customColor,
													"&:hover": {
														backgroundColor:
															values.acceptedDonationTypes.includes(type.value)
																? customColor
																: `${customColor}20`,
													},
												}}
												variant={
													values.acceptedDonationTypes.includes(type.value)
														? "filled"
														: "outlined"
												}
											/>
										))}
									</Box>
									{touched.acceptedDonationTypes &&
										errors.acceptedDonationTypes && (
											<Typography color="error" variant="caption">
												{errors.acceptedDonationTypes}
											</Typography>
										)}
								</motion.div>

								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.2 }}
								>
									<Box
										display="flex"
										justifyContent="space-between"
										alignItems="center"
										mb={2}
									>
										<Typography
											variant="subtitle1"
											sx={{
												fontWeight: 600,
												color: customColor,
											}}
										>
											Select Causes
										</Typography>
										<Box>
											<FormButton
												variant="outlined"
												startIcon={<RefreshIcon />}
												onClick={() => refetchCauses()}
												size="small"
												sx={{ mr: 1 }}
											>
												Refresh
											</FormButton>
											<FormButton
												variant="primary"
												startIcon={<AddIcon />}
												onClick={handleOpenCreateCauseModal}
												size="small"
											>
												Create New Cause
											</FormButton>
										</Box>
									</Box>
									{renderCausesSection(values, setFieldValue)}
								</motion.div>

								<Field
									as={FormInput}
									fullWidth
									label="Total Target Amount"
									name="totalTargetAmount"
									type="number"
									error={
										touched.totalTargetAmount && !!errors.totalTargetAmount
									}
									helperText={<ErrorMessage name="totalTargetAmount" />}
									slotProps={{
										input: {
											readOnly: values.selectedCauses.length > 0,
											startAdornment: <span>₹</span>,
										},
									}}
								/>

								<Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
									<FormButton
										variant="outlined"
										onClick={() => router.push("/dashboard/campaigns")}
									>
										Cancel
									</FormButton>
									<FormButton
										type="submit"
										variant="primary"
										loadingText="Creating Campaign..."
										sx={{
											backgroundColor: customColor,
											"&:hover": {
												backgroundColor: `${customColor}dd`,
											},
										}}
									>
										Create Campaign
									</FormButton>
								</Box>
							</Box>
						</Form>
					)}
				</Formik>
			</StandardCard>

			{/* Create New Cause Modal */}
			<Dialog
				open={isCreateCauseModalOpen}
				onClose={handleCloseCreateCauseModal}
				maxWidth="md"
				fullWidth
				sx={{
					"& .MuiDialog-paper": {
						borderRadius: 3,
					},
				}}
			>
				<DialogTitle>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 600,
								color: customColor,
							}}
						>
							Create New Cause
						</Typography>
						<IconButton
							onClick={handleCloseCreateCauseModal}
							size="small"
							sx={{
								color: customColor,
								"&:hover": {
									backgroundColor: `${customColor}20`,
								},
							}}
						>
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<Divider />

				<form onSubmit={handleCreateCause}>
					<DialogContent sx={{ pt: 3 }}>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
							<FormInput
								fullWidth
								label="Cause Title"
								name="title"
								value={causeFormData.title}
								onChange={handleCauseFormChange}
								required
								placeholder="Enter a descriptive cause title"
							/>

							<FormInput
								fullWidth
								label="Description"
								name="description"
								value={causeFormData.description}
								onChange={handleCauseFormChange}
								multiline
								rows={3}
								required
								placeholder="Describe the cause and its impact"
							/>

							<Box
								sx={{
									display: "flex",
									gap: 2,
									flexDirection: { xs: "column", sm: "row" },
								}}
							>
								<FormInput
									fullWidth
									label="Target Amount"
									name="targetAmount"
									type="number"
									value={causeFormData.targetAmount}
									onChange={handleCauseFormChange}
									required
									slotProps={{
										input: {
											startAdornment: <span>$</span>,
										},
									}}
									placeholder="0"
								/>

								<FormInput
									fullWidth
									label="Image URL"
									name="imageUrl"
									value={causeFormData.imageUrl}
									onChange={handleCauseFormChange}
									required
									placeholder="https://example.com/cause-image.jpg"
								/>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									gutterBottom
									sx={{
										fontWeight: 600,
										color: customColor,
										mb: 2,
									}}
								>
									Accepted Donation Types
								</Typography>
								<FormGroup>
									{Object.values(DonationType).map((type) => (
										<FormControlLabel
											key={type}
											control={
												<Checkbox
													checked={causeFormData.tags.includes(type)}
													onChange={(e) => {
														if (e.target.checked) {
															setCauseFormData((prev) => ({
																...prev,
																tags: [...prev.tags, type],
															}));
														} else {
															setCauseFormData((prev) => ({
																...prev,
																tags: prev.tags.filter((tag) => tag !== type),
															}));
														}
													}}
												/>
											}
											label={type.charAt(0) + type.slice(1).toLowerCase()}
										/>
									))}
								</FormGroup>
							</Box>

							{causeError && (
								<Alert severity="error">
									Failed to create cause. Please try again.
								</Alert>
							)}
						</Box>
					</DialogContent>

					<DialogActions sx={{ px: 3, pb: 3 }}>
						<FormButton
							variant="outlined"
							onClick={handleCloseCreateCauseModal}
						>
							Cancel
						</FormButton>
						<FormButton
							type="submit"
							variant="primary"
							loading={isCreatingCause}
							loadingText="Creating..."
							sx={{
								backgroundColor: customColor,
								"&:hover": {
									backgroundColor: `${customColor}dd`,
								},
							}}
						>
							Create Cause
						</FormButton>
					</DialogActions>
				</form>
			</Dialog>
		</Box>
	);
};

export default CreateCampaignPage;
