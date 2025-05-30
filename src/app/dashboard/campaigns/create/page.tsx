"use client";

import React, { useState, useEffect } from "react";
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
	FormGroup,
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
import dayjs from "dayjs";
import { DonationType } from "@/types/donation";
import { Cause, CreateCauseBody } from "@/types/cause";
import {
	Add as AddIcon,
	Close as CloseIcon,
	Refresh as RefreshIcon,
} from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import FormContainer from "@/components/ui/FormContainer";
import FormInput from "@/components/ui/FormInput";
import FormButton from "@/components/ui/FormButton";
import CloudinaryImageUpload from "@/components/cloudinary/CloudinaryImageUpload";

interface FormData {
	title: string;
	description: string;
	startDate: Dayjs | null;
	endDate: Dayjs | null;
	totalTargetAmount: string;
	status: string;
	acceptedDonationTypes: DonationType[];
	imageUrl: string;
	selectedCauses: string[];
}

interface CauseFormData {
	title: string;
	description: string;
	targetAmount: string;
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

	// Theme color for consistency
	const customColor = "#287068";

	// Campaign creation form
	const [formData, setFormData] = useState<FormData>({
		title: "",
		description: "",
		startDate: null,
		endDate: null,
		totalTargetAmount: "",
		status: "draft",
		acceptedDonationTypes: [DonationType.MONEY],
		imageUrl: "",
		selectedCauses: [],
	});

	// New cause creation modal
	const [isCreateCauseModalOpen, setIsCreateCauseModalOpen] = useState(false);
	const [causeFormData, setCauseFormData] = useState<CauseFormData>({
		title: "",
		description: "",
		targetAmount: "",
		imageUrl: "",
		tags: [],
	});

	// Calculate total target amount based on selected causes
	useEffect(() => {
		if (formData.selectedCauses.length > 0 && causesData?.causes) {
			const total = causesData.causes
				.filter((cause: Cause) => formData.selectedCauses.includes(cause.id))
				.reduce((sum: number, cause: Cause) => sum + cause.targetAmount, 0);

			setFormData((prev) => ({
				...prev,
				totalTargetAmount: total.toString(),
			}));
		}
	}, [formData.selectedCauses, causesData]);

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

	const handleSelectChange = (e: SelectChangeEvent) => {
		const { name, value } = e.target;
		if (name) {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
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
			targetAmount: "",
			imageUrl: "",
			tags: [],
		});
	};

	const handleDateChange =
		(field: "startDate" | "endDate") => (date: Dayjs | null) => {
			const today = new Date();
			today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

			if (date) {
				const selectedDate = date.toDate();
				selectedDate.setHours(0, 0, 0, 0);

				// Prevent past date selection
				if (selectedDate < today) {
					toast.error("Cannot select a date in the past");
					return;
				}

				// Validate startDate is not after endDate
				if (field === "startDate" && formData.endDate) {
					const endDate = formData.endDate.toDate();
					endDate.setHours(0, 0, 0, 0);
					if (selectedDate > endDate) {
						toast.error("Start date cannot be after end date");
						return;
					}
				}

				// Validate endDate is not before startDate
				if (field === "endDate" && formData.startDate) {
					const startDate = formData.startDate.toDate();
					startDate.setHours(0, 0, 0, 0);
					if (selectedDate < startDate) {
						toast.error("End date cannot be before start date");
						return;
					}
				}
			}

			setFormData((prev) => ({
				...prev,
				[field]: date,
			}));
		};

	const handleDonationTypeChange = (type: DonationType) => {
		setFormData((prev) => {
			const types = prev.acceptedDonationTypes.includes(type)
				? prev.acceptedDonationTypes.filter((t) => t !== type)
				: [...prev.acceptedDonationTypes, type];
			return {
				...prev,
				acceptedDonationTypes: types,
			};
		});
	};

	const handleCauseToggle = (causeId: string) => {
		setFormData((prev) => {
			const selectedCauses = prev.selectedCauses.includes(causeId)
				? prev.selectedCauses.filter((id) => id !== causeId)
				: [...prev.selectedCauses, causeId];

			return {
				...prev,
				selectedCauses,
			};
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
				targetAmount: parseFloat(causeFormData.targetAmount) || 0,
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
				setFormData((prev) => ({
					...prev,
					selectedCauses: [...prev.selectedCauses, response.cause.id],
				}));

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

	// Image upload handler
	const handleImageUpload = (imageUrl: string) => {
		setFormData((prev) => ({
			...prev,
			imageUrl,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Date validation
		if (!formData.startDate || !formData.endDate) {
			toast.error("Start date and end date are required");
			return;
		}

		const now = dayjs();
		const startDate = dayjs(formData.startDate);
		const endDate = dayjs(formData.endDate);

		if (startDate.isBefore(now, "day")) {
			toast.error("Start date cannot be in the past");
			return;
		}

		if (endDate.isBefore(startDate)) {
			toast.error("End date must be after start date");
			return;
		}

		// Donation types validation
		if (formData.acceptedDonationTypes.length === 0) {
			toast.error("At least one donation type is required");
			return;
		}

		// Image validation
		if (!formData.imageUrl) {
			toast.error("Please upload an image for your campaign");
			return;
		}

		try {
			if (!user) {
				throw new Error("User not found");
			}

			const campaignData = {
				title: formData.title,
				description: formData.description,
				startDate: formData.startDate.toISOString(),
				endDate: formData.endDate.toISOString(),
				totalTargetAmount: parseFloat(formData.totalTargetAmount),
				status: formData.status,
				acceptedDonationTypes: formData.acceptedDonationTypes,
				imageUrl: formData.imageUrl,
				causes: formData.selectedCauses,
				organizations: [user.id], // Add the required organizations field
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

	if (!user || user.role !== "organization") {
		return (
			<Box p={4}>
				<Alert severity="error">
					Access Denied. Only organizations can create campaigns.
				</Alert>
			</Box>
		);
	}

	const renderCausesSection = () => {
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
									checked={formData.selectedCauses.includes(cause.id)}
									onChange={() => handleCauseToggle(cause.id)}
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
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<FormContainer
				title="Create New Campaign"
				subtitle="Set up a new fundraising campaign for your organization"
				maxWidth={900}
			>
				<form onSubmit={handleSubmit}>
					<Box display="grid" gap={3}>
						<FormInput
							fullWidth
							label="Campaign Title"
							name="title"
							value={formData.title}
							onChange={handleChange}
							required
							placeholder="Enter a compelling campaign title"
						/>

						<FormInput
							fullWidth
							label="Description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							multiline
							rows={4}
							required
							placeholder="Describe your campaign goals and impact"
						/>

						<Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
							<DatePicker
								label="Start Date"
								value={formData.startDate}
								onChange={handleDateChange("startDate")}
								slotProps={{
									textField: {
										required: true,
										fullWidth: true,
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
								value={formData.endDate}
								onChange={handleDateChange("endDate")}
								slotProps={{
									textField: {
										required: true,
										fullWidth: true,
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
							onImageUpload={handleImageUpload}
							currentImageUrl={formData.imageUrl}
							label="Campaign Image"
							helperText="Upload an image for your campaign (max 5MB). Supported formats: JPG, PNG, WebP, GIF"
						/>

						<FormControl
							fullWidth
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
								value={formData.status}
								onChange={handleSelectChange}
								required
							>
								<MenuItem value="draft">Draft</MenuItem>
								<MenuItem value="active">Active</MenuItem>
								<MenuItem value="paused">Paused</MenuItem>
							</Select>
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
										onClick={() => handleDonationTypeChange(type.value)}
										sx={{
											backgroundColor: formData.acceptedDonationTypes.includes(
												type.value
											)
												? customColor
												: "transparent",
											color: formData.acceptedDonationTypes.includes(type.value)
												? "white"
												: customColor,
											borderColor: customColor,
											"&:hover": {
												backgroundColor:
													formData.acceptedDonationTypes.includes(type.value)
														? customColor
														: `${customColor}20`,
											},
										}}
										variant={
											formData.acceptedDonationTypes.includes(type.value)
												? "filled"
												: "outlined"
										}
									/>
								))}
							</Box>
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
							{renderCausesSection()}
						</motion.div>

						<FormInput
							fullWidth
							label="Total Target Amount"
							name="totalTargetAmount"
							type="number"
							value={formData.totalTargetAmount}
							slotProps={{
								input: {
									readOnly: formData.selectedCauses.length > 0,
									startAdornment: <span>$</span>,
								},
							}}
							helperText={
								formData.selectedCauses.length > 0
									? "Automatically calculated from selected causes"
									: "Enter the total target amount"
							}
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
				</form>
			</FormContainer>

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
		</motion.div>
	);
};

export default CreateCampaignPage;
