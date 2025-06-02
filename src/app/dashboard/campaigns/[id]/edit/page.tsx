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
import { DonationType } from "@/types";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { useGetCausesQuery } from "@/store/api/causeApi";
import CloudinaryImageUpload from "@/components/cloudinary/CloudinaryImageUpload";
import { toast } from "react-hot-toast";
import { Campaign } from "@/types/campaigns";
import { UpdateCampaignBody } from "@/types/campaings";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { updateCampaignValidationSchema } from "@/utils/validationSchemas";

interface FormData {
	title: string;
	description: string;
	startDate: Dayjs | null;
	endDate: Dayjs | null;
	totalTargetAmount: number; // Changed to number for consistency
	status: string;
	acceptedDonationTypes: DonationType[];
	imageUrl: string;
	selectedCauses: string[]; // Renamed to match validation schema
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

	// Update initial values when campaign data loads
	const getInitialValues = (): FormData => {
		if (campaignData?.campaign) {
			const campaign = campaignData.campaign as unknown as Campaign;
			return {
				title: campaign.title,
				description: campaign.description,
				startDate: dayjs(campaign.startDate),
				endDate: dayjs(campaign.endDate),
				totalTargetAmount: campaign.totalTargetAmount,
				status: campaign.status,
				acceptedDonationTypes: campaign.acceptedDonationTypes || [
					DonationType.MONEY,
				],
				imageUrl: campaign.imageUrl || "",
				selectedCauses:
					campaign.causes?.map((cause: { id: string }) => cause.id) || [],
			};
		}
		return initialValues;
	};

	// Redirect after successful update
	useEffect(() => {
		if (isSuccess) {
			router.push(`/dashboard/campaigns`);
		}
	}, [isSuccess, router, campaignId]);

	// Form submission handler for Formik
	const handleSubmit = async (values: FormData) => {
		try {
			const updateData = {
				title: values.title,
				description: values.description,
				startDate: values.startDate!.toISOString(),
				endDate: values.endDate!.toISOString(),
				totalTargetAmount: values.totalTargetAmount,
				status: values.status,
				acceptedDonationTypes: values.acceptedDonationTypes,
				imageUrl: values.imageUrl,
				causes: values.selectedCauses,
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

					<Formik
						initialValues={getInitialValues()}
						validationSchema={updateCampaignValidationSchema()}
						onSubmit={handleSubmit}
						enableReinitialize
					>
						{({ values, errors, touched, setFieldValue }) => (
							<Form>
								<Box display="grid" gap={3}>
									<Field
										as={TextField}
										fullWidth
										label="Campaign Title"
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
												},
											}}
										/>
									</Box>

									<Field
										as={TextField}
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
												startAdornment: <span>₹</span>,
											},
										}}
									/>

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
											<MenuItem value="completed">Completed</MenuItem>
										</Select>
										{touched.status && errors.status && (
											<Typography color="error" variant="caption">
												{errors.status}
											</Typography>
										)}
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
													onClick={() => {
														const currentTypes = values.acceptedDonationTypes;
														const newTypes = currentTypes.includes(type.value)
															? currentTypes.filter((t) => t !== type.value)
															: [...currentTypes, type.value];
														setFieldValue("acceptedDonationTypes", newTypes);
													}}
													color={
														values.acceptedDonationTypes.includes(type.value)
															? "primary"
															: "default"
													}
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
																checked={values.selectedCauses.includes(
																	cause.id
																)}
																onChange={() => {
																	const currentCauses = values.selectedCauses;
																	const newCauses = currentCauses.includes(
																		cause.id
																	)
																		? currentCauses.filter(
																				(id) => id !== cause.id
																		  )
																		: [...currentCauses, cause.id];
																	setFieldValue("selectedCauses", newCauses);
																}}
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
										{touched.selectedCauses && errors.selectedCauses && (
											<Typography color="error" variant="caption">
												{errors.selectedCauses}
											</Typography>
										)}
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
							</Form>
						)}
					</Formik>
				</Paper>
			</Box>
		</LocalizationProvider>
	);
};

export default EditCampaignPage;
