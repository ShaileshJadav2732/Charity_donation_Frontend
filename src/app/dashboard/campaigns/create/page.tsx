"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	TextField,
	Typography,
	Paper,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
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
	Grid,
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
import { DonationType } from "@/types/donation";
import { Cause, CreateCauseBody } from "@/types/cause";
import {
	Add as AddIcon,
	Close as CloseIcon,
	Refresh as RefreshIcon,
} from "@mui/icons-material";

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

const CreateCampaignPage = () => {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [
		createCampaign,
		{ isLoading: isCreatingCampaign, error: campaignError },
	] = useCreateCampaignMutation();
	const [createCause, { isLoading: isCreatingCause, error: causeError }] =
		useCreateCauseMutation();

	const {
		data: causesData,
		isLoading: isLoadingCauses,
		refetch: refetchCauses,
	} = useGetCausesQuery({
		organizationId: user?.id,
	});

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

	const handleSelectChange = (
		e: React.ChangeEvent<{ name?: string; value: unknown }>
	) => {
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

	const handleTagToggle = (tag: string) => {
		setCauseFormData((prev) => {
			const newTags = prev.tags.includes(tag)
				? prev.tags.filter((t) => t !== tag)
				: [...prev.tags, tag];
			return {
				...prev,
				tags: newTags,
			};
		});
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
				console.error("No organization ID found");
				return;
			}

			// Create the cause payload
			const payload: CreateCauseBody = {
				title: causeFormData.title,
				description: causeFormData.description,
				targetAmount: parseFloat(causeFormData.targetAmount),
				imageUrl: causeFormData.imageUrl,
				tags: causeFormData.tags,
				organizationId: user.id,
			};

			// Validate the payload
			if (
				!payload.title ||
				!payload.description ||
				isNaN(payload.targetAmount) ||
				payload.targetAmount <= 0
			) {
				alert("Please fill all required fields with valid values");
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
			}
		} catch (error) {
			console.error("Failed to create cause:", error);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!formData.startDate || !formData.endDate) {
			console.error("Start date and end date are required");
			return;
		}

		if (formData.acceptedDonationTypes.length === 0) {
			console.error("At least one donation type is required");
			return;
		}

		if (formData.selectedCauses.length === 0) {
			console.error("At least one cause is required");
			return;
		}

		try {
			if (!user) {
				throw new Error("User not found");
			}

			// Ensure organizations includes the current user's ID
			const organizations = [user.id];

			// Create payload
			const payload = {
				title: formData.title,
				description: formData.description,
				startDate: formData.startDate.toISOString(),
				endDate: formData.endDate.toISOString(),
				status: formData.status,
				totalTargetAmount: parseFloat(formData.totalTargetAmount),
				imageUrl:
					formData.imageUrl || "https://placehold.co/600x400?text=Campaign",
				organizations,
				acceptedDonationTypes: formData.acceptedDonationTypes,
				causes: formData.selectedCauses,
			};

			console.log("Creating campaign with payload:", payload);

			const response = await createCampaign(payload).unwrap();
			console.log("Campaign created:", response);

			if (response.success) {
				router.push("/dashboard/campaigns");
			}
		} catch (err) {
			console.error("Failed to create campaign:", err);
			setError(
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

		if (!causesData || causesData.causes.length === 0) {
			return (
				<Alert severity="info" sx={{ mb: 2 }}>
					You need to create causes to add to your campaign.
				</Alert>
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
				{causesData.causes.map((cause: Cause) => (
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
		<Box p={4}>
			<Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
				<Typography variant="h4" gutterBottom>
					Create New Campaign
				</Typography>

				<form onSubmit={handleSubmit}>
					<Box display="grid" gap={3}>
						<TextField
							fullWidth
							label="Campaign Title"
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

						<Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
							<DatePicker
								label="Start Date"
								value={formData.startDate}
								onChange={handleDateChange("startDate")}
								slotProps={{
									textField: {
										required: true,
										fullWidth: true,
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
									},
								}}
							/>
						</Box>

						<TextField
							fullWidth
							label="Image URL"
							name="imageUrl"
							value={formData.imageUrl}
							onChange={handleChange}
							required
							helperText="Enter the URL of the campaign image"
						/>

						<FormControl fullWidth>
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

						<Box>
							<Typography variant="subtitle1" gutterBottom>
								Accepted Donation Types
							</Typography>
							<Box display="flex" gap={1} flexWrap="wrap">
								{DONATION_TYPES.map((type) => (
									<Chip
										key={type.value}
										label={type.label}
										onClick={() => handleDonationTypeChange(type.value)}
										color={
											formData.acceptedDonationTypes.includes(type.value)
												? "primary"
												: "default"
										}
										variant={
											formData.acceptedDonationTypes.includes(type.value)
												? "filled"
												: "outlined"
										}
									/>
								))}
							</Box>
						</Box>

						<Box>
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
								mb={1}
							>
								<Typography variant="subtitle1">Select Causes</Typography>
								<Box>
									<Button
										variant="outlined"
										startIcon={<RefreshIcon />}
										onClick={() => refetchCauses()}
										size="small"
										sx={{ mr: 1 }}
									>
										Refresh
									</Button>
									<Button
										variant="contained"
										startIcon={<AddIcon />}
										onClick={handleOpenCreateCauseModal}
										size="small"
									>
										Create New Cause
									</Button>
								</Box>
							</Box>
							{renderCausesSection()}
						</Box>

						<TextField
							fullWidth
							label="Total Target Amount"
							name="totalTargetAmount"
							type="number"
							value={formData.totalTargetAmount}
							InputProps={{
								readOnly: formData.selectedCauses.length > 0,
								startAdornment: <span>$</span>,
							}}
							helperText={
								formData.selectedCauses.length > 0
									? "Automatically calculated from selected causes"
									: "Enter the total target amount"
							}
						/>

						{campaignError && (
							<Alert severity="error">
								Failed to create campaign. Please try again.
							</Alert>
						)}

						<Box display="flex" gap={2} justifyContent="flex-end">
							<Button
								variant="outlined"
								onClick={() => router.push("/dashboard/campaigns")}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="contained"
								color="primary"
								disabled={
									isCreatingCampaign || formData.selectedCauses.length === 0
								}
							>
								{isCreatingCampaign ? "Creating..." : "Create Campaign"}
							</Button>
						</Box>
					</Box>
				</form>
			</Paper>

			{/* Create New Cause Modal */}
			<Dialog
				open={isCreateCauseModalOpen}
				onClose={handleCloseCreateCauseModal}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography variant="h6">Create New Cause</Typography>
						<IconButton onClick={handleCloseCreateCauseModal} size="small">
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<Divider />

				<form onSubmit={handleCreateCause}>
					<DialogContent>
						<Grid container spacing={3}>
							<Grid component="div" item xs={12}>
								<TextField
									fullWidth
									label="Cause Title"
									name="title"
									value={causeFormData.title}
									onChange={handleCauseFormChange}
									required
								/>
							</Grid>

							<Grid component="div" item xs={12}>
								<TextField
									fullWidth
									label="Description"
									name="description"
									value={causeFormData.description}
									onChange={handleCauseFormChange}
									multiline
									rows={3}
									required
								/>
							</Grid>

							<Grid component="div" item xs={12} sm={6}>
								<TextField
									fullWidth
									label="Target Amount"
									name="targetAmount"
									type="number"
									value={causeFormData.targetAmount}
									onChange={handleCauseFormChange}
									required
									InputProps={{
										startAdornment: <span>$</span>,
									}}
								/>
							</Grid>

							<Grid component="div" item xs={12} sm={6}>
								<TextField
									fullWidth
									label="Image URL"
									name="imageUrl"
									value={causeFormData.imageUrl}
									onChange={handleCauseFormChange}
									required
								/>
							</Grid>

							<Grid component="div" item xs={12}>
								<Typography variant="subtitle2" gutterBottom>
									Tags
								</Typography>
								<Box display="flex" gap={1} flexWrap="wrap">
									{SUGGESTED_TAGS.map((tag) => (
										<Chip
											key={tag}
											label={tag}
											onClick={() => handleTagToggle(tag)}
											color={
												causeFormData.tags.includes(tag) ? "primary" : "default"
											}
											variant={
												causeFormData.tags.includes(tag) ? "filled" : "outlined"
											}
											size="small"
										/>
									))}
								</Box>
							</Grid>

							{causeError && (
								<Grid component="div" item xs={12}>
									<Alert severity="error">
										Failed to create cause. Please try again.
									</Alert>
								</Grid>
							)}
						</Grid>
					</DialogContent>

					<DialogActions sx={{ px: 3, pb: 3 }}>
						<Button onClick={handleCloseCreateCauseModal}>Cancel</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={isCreatingCause}
						>
							{isCreatingCause ? "Creating..." : "Create Cause"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</Box>
	);
};

export default CreateCampaignPage;
