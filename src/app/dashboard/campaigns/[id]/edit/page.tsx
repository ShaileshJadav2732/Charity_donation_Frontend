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
	Divider,
	CircularProgress,
	FormGroup,
	FormHelperText,
	Checkbox,
	FormControlLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
	useUpdateCampaignMutation,
	useGetCampaignByIdQuery,
} from "@/store/api/campaignApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import dayjs, { Dayjs } from "dayjs";
import { DonationType } from "@/types/donation";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { useGetCausesQuery } from "@/store/api/causeApi";
import CloudinaryImageUpload from "@/components/cloudinary/CloudinaryImageUpload";
import { toast } from "react-hot-toast";
import { Campaign } from "@/types/campaigns";
import { UpdateCampaignBody } from "@/types/campaings";

interface FormData {
	title: string;
	description: string;
	startDate: Dayjs | null;
	endDate: Dayjs | null;
	totalTargetAmount: string;
	status: string;
	acceptedDonationTypes: DonationType[];
	imageUrl: string;
	causes: string[];
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

	const [formData, setFormData] = useState<FormData>({
		title: "",
		description: "",
		startDate: null,
		endDate: null,
		totalTargetAmount: "",
		status: "draft",
		acceptedDonationTypes: [DonationType.MONEY],
		imageUrl: "",
		causes: [],
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
				causes: campaign.causes?.map((cause: { id: string }) => cause.id) || [],
			});
		}
	}, [campaignData]);

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

	const handleSelectChange = (
		e:
			| React.ChangeEvent<HTMLInputElement>
			| (Event & { target: { value: string; name: string } })
	) => {
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

	const handleCauseChange = (causeId: string) => {
		setFormData((prev) => {
			const updatedCauses = prev.causes.includes(causeId)
				? prev.causes.filter((id) => id !== causeId)
				: [...prev.causes, causeId];
			return {
				...prev,
				causes: updatedCauses,
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
				causes: formData.causes,
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

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Box p={4}>
				<Button
					startIcon={<BackIcon />}
					onClick={() => router.push(`/dashboard/campaigns/${campaignId}`)}
					sx={{ mb: 3 }}
				>
					Back to Campaign
				</Button>

				<Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
					<Typography variant="h4" gutterBottom>
						Edit Campaign
					</Typography>

					<Divider sx={{ mb: 4 }} />

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
								label="Total Target Amount"
								name="totalTargetAmount"
								type="number"
								value={formData.totalTargetAmount}
								onChange={handleChange}
								required
								slotProps={{
									input: {
										startAdornment: <span>$</span>,
									},
								}}
							/>

							<CloudinaryImageUpload
								onImageUpload={handleImageUpload}
								currentImageUrl={formData.imageUrl}
								label="Campaign Image"
								helperText="Upload an image for your campaign (max 5MB). Supported formats: JPG, PNG, WebP, GIF"
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
									<MenuItem value="completed">Completed</MenuItem>
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
								<Typography variant="subtitle1" gutterBottom>
									Associated Causes
								</Typography>
								{isLoadingCauses ? (
									<CircularProgress size={24} />
								) : causesData?.causes?.length ? (
									<FormGroup>
										{causesData.causes.map((cause) => (
											<FormControlLabel
												key={cause.id}
												control={
													<Checkbox
														checked={formData.causes.includes(cause.id)}
														onChange={() => handleCauseChange(cause.id)}
													/>
												}
												label={cause.title}
											/>
										))}
									</FormGroup>
								) : (
									<Typography color="text.secondary">
										No causes available. Please create causes first.
									</Typography>
								)}
								<FormHelperText>
									Select at least one cause to associate with this campaign
								</FormHelperText>
							</Box>

							{updateError && (
								<Alert severity="error">
									Failed to update campaign. Please try again.
								</Alert>
							)}

							<Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
								<Button
									variant="outlined"
									onClick={() =>
										router.push(`/dashboard/campaigns/${campaignId}`)
									}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="contained"
									color="primary"
									disabled={isUpdating}
								>
									{isUpdating ? "Updating..." : "Update Campaign"}
								</Button>
							</Box>
						</Box>
					</form>
				</Paper>
			</Box>
		</LocalizationProvider>
	);
};

export default EditCampaignPage;
