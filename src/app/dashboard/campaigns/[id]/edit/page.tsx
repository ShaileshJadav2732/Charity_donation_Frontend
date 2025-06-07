"use client";

import CloudinaryImageUpload from "@/components/cloudinary/CloudinaryImageUpload";
import FormButton from "@/components/ui/FormButton";
import FormContainer from "@/components/ui/FormContainer";
import FormInput from "@/components/ui/FormInput";
import {
	useGetCampaignByIdQuery,
	useUpdateCampaignMutation,
} from "@/store/api/campaignApi";
import { useGetCausesQuery } from "@/store/api/causeApi";
import { RootState } from "@/store/store";
import { Campaign } from "@/types/campaigns";
import { UpdateCampaignBody } from "@/types/campaings";
import { Cause } from "@/types/cause";
import { DonationType } from "@/types/donation";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import {
	Alert,
	Box,
	Checkbox,
	Chip,
	CircularProgress,
	FormControl,
	FormControlLabel,
	InputLabel,
	List,
	ListItem,
	ListItemText,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

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

interface EditCampaignPageProps {
	params: Promise<{ id: string }>;
}

const EditCampaignPage = ({ params }: EditCampaignPageProps) => {
	const router = useRouter();
	const [campaignId, setCampaignId] = useState<string>("");
	const { user } = useSelector((state: RootState) => state.auth);

	// Resolve params Promise
	useEffect(() => {
		params.then((resolvedParams) => {
			setCampaignId(resolvedParams.id);
		});
	}, [params]);

	// Enhanced validation with debugging
	useEffect(() => {
		if (
			!campaignId ||
			campaignId === "undefined" ||
			campaignId === "[object Object]"
		) {
			const timer = setTimeout(() => {
				router.push("/dashboard/campaigns");
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [campaignId, router]);

	// API query calls
	const {
		data: campaignData,
		isLoading: isLoadingCampaign,
		error: campaignError,
	} = useGetCampaignByIdQuery(campaignId, {
		skip:
			!campaignId ||
			campaignId === "undefined" ||
			campaignId === "[object Object]",
	});

	const [
		updateCampaign,
		{ isLoading: isUpdating, error: updateError, isSuccess },
	] = useUpdateCampaignMutation();

	// Query user organization causes
	const { data: causesData, isLoading: isLoadingCauses } = useGetCausesQuery(
		{ organizationId: user?.id || "" },
		{ skip: !user?.id }
	);

	// Theme color for consistency
	const customColor = "#287068";

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

	// Initialize form with campaign data when it loads
	useEffect(() => {
		if (campaignData?.campaign) {
			const campaign = campaignData.campaign as unknown as Campaign;
			setFormData({
				title: campaign.title,
				description: campaign.description,
				startDate: dayjs(campaign.startDate),
				endDate: dayjs(campaign.endDate),
				totalTargetAmount: campaign.totalTargetAmount.toString(),
				status: campaign.status,
				acceptedDonationTypes: campaign.acceptedDonationTypes || [
					DonationType.MONEY,
				],
				imageUrl: campaign.imageUrl || "",
				selectedCauses:
					campaign.causes?.map((cause: { id: string }) => cause.id) || [],
			});
		}
	}, [campaignData]);

	// Calculate total target amount based on selected causes (same logic as create page)
	useEffect(() => {
		if (formData.selectedCauses.length > 0 && causesData?.causes) {
			const selectedCausesData = causesData.causes.filter((cause: Cause) =>
				formData.selectedCauses.includes(cause.id)
			);

			// Calculate total from causes that accept money (money or both)
			const total = selectedCausesData
				.filter((cause: Cause) => cause.acceptanceType !== "items")
				.reduce((sum: number, cause: Cause) => sum + cause.targetAmount, 0);

			setFormData((prev) => ({
				...prev,
				totalTargetAmount: total.toString(),
			}));
		} else {
			// Reset to 0 if no causes selected
			setFormData((prev) => ({
				...prev,
				totalTargetAmount: "0",
			}));
		}
	}, [formData.selectedCauses, causesData]);

	// Redirect after successful update
	useEffect(() => {
		if (isSuccess) {
			router.push(`/dashboard/campaigns`);
		}
	}, [isSuccess, router, campaignId]);

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

		if (formData.acceptedDonationTypes.length === 0) {
			toast.error("At least one donation type is required");
			return;
		}

		if (!formData.imageUrl) {
			toast.error("Please upload an image for your campaign");
			return;
		}

		try {
			const updateData = {
				title: formData.title,
				description: formData.description,
				startDate: formData.startDate.toISOString(),
				endDate: formData.endDate.toISOString(),
				totalTargetAmount: parseFloat(formData.totalTargetAmount),
				status: formData.status,
				acceptedDonationTypes: formData.acceptedDonationTypes,
				imageUrl: formData.imageUrl,
				causes: formData.selectedCauses,
			};

			await updateCampaign({
				id: campaignId,
				body: updateData as Partial<UpdateCampaignBody>,
			}).unwrap();
			toast.success("Campaign updated successfully!");
			router.push(`/dashboard/campaigns/${campaignId}`);
		} catch (err) {
			console.error("Failed to update campaign:", err);
			toast.error("Failed to update campaign. Please try again.");
		}
	};

	if (!user || user.role !== "organization") {
		return (
			<Box p={4}>
				<Alert severity="error">
					Access Denied. Only organizations can edit campaigns.
				</Alert>
			</Box>
		);
	}

	if (isLoadingCampaign) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				height="80vh"
			>
				<CircularProgress />
			</Box>
		);
	}

	if (campaignError) {
		return (
			<Box p={4}>
				<Alert severity="error">
					Failed to load campaign data. Please try again.
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
									secondary={
										<Box>
											<Typography variant="body2" color="text.secondary">
												Target: ₹{cause.targetAmount.toLocaleString()} • Type:{" "}
												{cause.acceptanceType === "money"
													? "Money"
													: cause.acceptanceType === "items"
													? "Items Only"
													: "Money & Items"}
											</Typography>
											{cause.acceptanceType === "items" && (
												<Typography variant="caption" color="warning.main">
													Items-only causes don&apos;t contribute to monetary
													target
												</Typography>
											)}
										</Box>
									}
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
			<Box p={2}>
				<FormButton
					variant="outlined"
					startIcon={<BackIcon />}
					onClick={() => router.push(`/dashboard/campaigns/${campaignId}`)}
					sx={{ mb: 3 }}
				>
					Back to Campaign
				</FormButton>
			</Box>

			<FormContainer
				title="Edit Campaign"
				subtitle="Update your campaign details and settings"
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
								<MenuItem value="completed">Completed</MenuItem>
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
							<Typography
								variant="subtitle1"
								sx={{
									fontWeight: 600,
									color: customColor,
									mb: 2,
								}}
							>
								Select Causes
							</Typography>
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
									startAdornment: <span>₹</span>,
								},
							}}
							helperText={
								formData.selectedCauses.length > 0
									? "Automatically calculated from selected causes that accept money. Items-only causes don't contribute to this amount."
									: "Enter the total target amount for monetary donations"
							}
						/>

						{updateError && (
							<Alert severity="error">
								Failed to update campaign. Please try again.
							</Alert>
						)}

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
								loading={isUpdating}
								loadingText="Updating Campaign..."
								sx={{
									backgroundColor: customColor,
									"&:hover": {
										backgroundColor: `${customColor}dd`,
									},
								}}
							>
								Update Campaign
							</FormButton>
						</Box>
					</Box>
				</form>
			</FormContainer>
		</motion.div>
	);
};

export default EditCampaignPage;
