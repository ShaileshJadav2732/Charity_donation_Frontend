"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	Paper,
	Typography,
	Chip,
	Card,
	CardContent,
	Divider,
	LinearProgress,
	Alert,
	CircularProgress,
	Tabs,
	Tab,
	Avatar,
	Stack,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
<<<<<<< Updated upstream
	IconButton,
=======
>>>>>>> Stashed changes
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
<<<<<<< Updated upstream
	Switch,
	FormControlLabel,
=======
>>>>>>> Stashed changes
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
	CalendarMonth as CalendarIcon,
	Groups as DonorsIcon,
<<<<<<< Updated upstream
	VolunteerActivism as DonationIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	ArrowBack as BackIcon,
	Share as ShareIcon,
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon,
	Category as CategoryIcon,
	Person as PersonIcon,
	Save as SaveIcon,
=======
	Edit as EditIcon,
	Delete as DeleteIcon,
	ArrowBack as BackIcon,
	Category as CategoryIcon,
	Person as PersonIcon,
	Cancel as CancelIcon,
>>>>>>> Stashed changes
} from "@mui/icons-material";
import {
	useGetCampaignByIdQuery,
	useDeleteCampaignMutation,
<<<<<<< Updated upstream
	useUpdateCampaignMutation,
} from "@/store/api/campaignApi";
import { useGetCausesQuery } from "@/store/api/causeApi";
=======
	// useUpdateCampaignMutation, // Unused
} from "@/store/api/campaignApi";
// import { useGetCausesQuery } from "@/store/api/causeApi"; // Unused
>>>>>>> Stashed changes
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DonationType } from "@/types/donation";
import dayjs, { Dayjs } from "dayjs";
<<<<<<< Updated upstream
import { CampaignStatus } from "@/types/campaings";
import { Suspense } from "react";
=======
// import { CampaignStatus } from "@/types/campaings"; // Unused
// import { Suspense } from "react"; // Unused
>>>>>>> Stashed changes

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`campaign-tabpanel-${index}`}
			aria-labelledby={`campaign-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `campaign-tab-${index}`,
		"aria-controls": `campaign-tabpanel-${index}`,
	};
}

// Format date to display in a readable format
const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

// Calculate days left or status
const getDaysRemaining = (
	endDate: string
): { days: number; status: string } => {
	const end = new Date(endDate);
	const today = new Date();

	if (today > end) {
		return { days: 0, status: "Completed" };
	}

	const diffTime = end.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return { days: diffDays, status: "Active" };
};

// Calculate progress percentage
const getProgressPercentage = (raised: number, target: number): number => {
	if (target === 0 || !raised) return 0;
	const percentage = (raised / target) * 100;
	return Math.min(percentage, 100); // Cap at 100%
};

// Add donation type options
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

// Form state interface
interface FormData {
	title: string;
	description: string;
	startDate: Dayjs | null;
	endDate: Dayjs | null;
	totalTargetAmount: string;
	status: string;
	imageUrl: string;
	acceptedDonationTypes: DonationType[];
	causes: { id: string; title: string; description: string }[];
}

export default function CampaignDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const actualParams = React.use(params);
	return <CampaignDetail params={actualParams} />;
}

function CampaignDetail({ params }: { params: { id: string } }) {
	const id = params.id;

	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [tabValue, setTabValue] = useState(0);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);

	// Debug log for campaign ID
	useEffect(() => {
		console.log("Campaign detail page mounted with ID:", id, typeof id);
		if (!id || id === "undefined" || id === "[object Object]") {
			console.error("Invalid campaign ID in campaign detail page");
			router.push("/dashboard/campaigns");
		}
	}, [id, router]);

	// Skip the query if ID is invalid
	const skipQuery = !id || id === "undefined" || id === "[object Object]";
	const {
		data: campaignData,
		isLoading,
		error,
<<<<<<< Updated upstream
		refetch,
=======
		// refetch, // Unused
>>>>>>> Stashed changes
	} = useGetCampaignByIdQuery(id, {
		skip: skipQuery,
	});

<<<<<<< Updated upstream
	const {
		data: organizationCausesData,
		isLoading: isLoadingOrgCauses,
		error: orgCausesError,
	} = useGetCausesQuery(
		{ organizationId: user?.id },
		{ skip: user?.role !== "organization" }
	);
=======
	// Commented out unused organization causes query
	// const {
	// 	data: organizationCausesData,
	// 	isLoading: isLoadingOrgCauses,
	// 	error: orgCausesError,
	// } = useGetCausesQuery(
	// 	{ organizationId: user?.id },
	// 	{ skip: user?.role !== "organization" }
	// );
>>>>>>> Stashed changes
	console.log("campaignData", campaignData);

	const [deleteCampaign, { isLoading: isDeleting }] =
		useDeleteCampaignMutation();
<<<<<<< Updated upstream
	const [updateCampaign, { isLoading: isUpdating }] =
		useUpdateCampaignMutation();
=======
	// const [updateCampaign] = useUpdateCampaignMutation(); // Unused
>>>>>>> Stashed changes

	// Form state for editing
	const [formData, setFormData] = useState<FormData>({
		title: "",
		description: "",
		startDate: null,
		endDate: null,
		totalTargetAmount: "",
		status: "",
		imageUrl: "",
		acceptedDonationTypes: [],
		causes: [],
	});

	// Initialize form with campaign data when it loads
	useEffect(() => {
		if (campaignData?.data?.campaign) {
			const campaign = campaignData.data.campaign;
			setFormData({
				title: campaign.title,
				description: campaign.description,
				startDate: dayjs(campaign.startDate),
				endDate: dayjs(campaign.endDate),
				totalTargetAmount: campaign.totalTargetAmount.toString(),
				status: campaign.status.toLowerCase(),
				imageUrl: campaign.imageUrl || "",
				acceptedDonationTypes: [],
				causes: campaign.causes || [],
			});
		}
	}, [campaignData]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSelectChange = (
		event: React.ChangeEvent<{ name?: string; value: unknown }>
	) => {
		const name = event.target.name;
		const value = event.target.value;
		if (name) {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleDateChange = (field: string) => (date: Dayjs | null) => {
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

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

<<<<<<< Updated upstream
	const toggleEditMode = () => {
		setIsEditMode(!isEditMode);
	};

	const handleSaveChanges = async () => {
		try {
			if (!formData.startDate || !formData.endDate) {
				console.error("Start date or end date is missing");
				return;
			}

			const payload = {
				id,
				body: {
					title: formData.title,
					description: formData.description,
					startDate: formData.startDate.toISOString(),
					endDate: formData.endDate.toISOString(),
					status: formData.status,
					totalTargetAmount: parseFloat(formData.totalTargetAmount),
					imageUrl: formData.imageUrl,
					causes: formData.causes,
					acceptedDonationTypes: formData.acceptedDonationTypes,
				},
			};

			await updateCampaign(payload).unwrap();
			setIsEditMode(false);
			refetch();
		} catch (err) {
			console.error("Failed to update campaign:", err);
		}
	};

=======
	// Commented out unused functions
	// const toggleEditMode = () => {
	// 	setIsEditMode(!isEditMode);
	// };

	// const handleSaveChanges = async () => {
	// 	try {
	// 		if (!formData.startDate || !formData.endDate) {
	// 			console.error("Start date or end date is missing");
	// 			return;
	// 		}

	// 		const payload = {
	// 			id,
	// 			body: {
	// 				title: formData.title,
	// 				description: formData.description,
	// 				startDate: formData.startDate.toISOString(),
	// 				endDate: formData.endDate.toISOString(),
	// 				status: formData.status,
	// 				totalTargetAmount: parseFloat(formData.totalTargetAmount),
	// 				imageUrl: formData.imageUrl,
	// 				causes: formData.causes,
	// 				acceptedDonationTypes: formData.acceptedDonationTypes,
	// 			},
	// 		};

	// 		await updateCampaign(payload).unwrap();
	// 		setIsEditMode(false);
	// 		refetch();
	// 	} catch (err) {
	// 		console.error("Failed to update campaign:", err);
	// 	}
	// };

>>>>>>> Stashed changes
	const handleEditCampaign = () => {
		if (!id || id === "undefined") {
			console.error("Invalid campaign ID");
			return;
		}
		setIsEditMode(true);
	};
<<<<<<< Updated upstream

	const handleDeleteDialogOpen = () => {
		setDeleteDialogOpen(true);
	};

=======

	const handleDeleteDialogOpen = () => {
		setDeleteDialogOpen(true);
	};

>>>>>>> Stashed changes
	const handleDeleteDialogClose = () => {
		setDeleteDialogOpen(false);
	};

	const handleDeleteCampaign = async () => {
		try {
			await deleteCampaign(id).unwrap();
			router.push("/dashboard/campaigns");
		} catch (error) {
			console.error("Failed to delete campaign:", error);
		}
	};

	// Early return if ID is invalid
	if (skipQuery) {
		return (
			<Box p={4}>
				<Alert severity="error">
					Invalid campaign ID. Redirecting to campaigns list...
				</Alert>
			</Box>
		);
	}

	if (isLoading) {
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

	if (error) {
		return (
			<Box p={4}>
				<Alert severity="error">
					Error loading campaign. Please try again later.
				</Alert>
			</Box>
		);
	}

	// Uncomment and update the guard clause
	if (!campaignData) {
		return (
			<Box p={4}>
				<Alert severity="warning">Campaign not found or still loading.</Alert>
			</Box>
		);
	}

	const campaign = campaignData?.data?.campaign;
	const progressPercentage = getProgressPercentage(
		campaign?.totalRaisedAmount || 0,
		campaign?.totalTargetAmount || 0
	);
	const { days: daysLeft } = getDaysRemaining(
		campaign?.endDate || new Date().toISOString()
	);

	// Check if user is authorized to edit/delete this campaign
	const isAuthorized =
		user &&
		user.role === "organization" &&
		campaign?.organizationId === user.id;

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Box sx={{ p: 4, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
				{/* Back Button */}
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					mb={3}
				>
					<Button
						startIcon={<BackIcon />}
						onClick={() => router.push("/dashboard/campaigns")}
					>
						Back to Campaigns
					</Button>

					{isAuthorized && (
						<Box sx={{ display: "flex", gap: 2 }}>
							<Button
								variant="contained"
								color="primary"
								startIcon={<EditIcon />}
								onClick={() => router.push(`/dashboard/campaigns/${id}/edit`)}
							>
								Edit
							</Button>
							<Button
								variant="outlined"
								color="error"
								startIcon={<DeleteIcon />}
								onClick={handleDeleteDialogOpen}
							>
								Delete
							</Button>
						</Box>
					)}
				</Box>

				{/* Campaign Header */}
				<Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
					{/* Campaign Image */}
					{!isEditMode ? (
						<Box
							sx={{
								height: { xs: 200, md: 300 },
								position: "relative",
								background: `url(${
									campaign?.imageUrl ||
									"https://placehold.co/1200x400?text=Campaign"
								})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
						>
							{/* Status Overlay */}
							<Box
								sx={{
									position: "absolute",
									top: 16,
									right: 16,
									backgroundColor: "rgba(255,255,255,0.9)",
									borderRadius: 2,
									p: 1,
								}}
							>
								<Chip
									label={campaign?.status || "Unknown"}
									color={
										(campaign?.status || "").toLowerCase() === "active"
											? "success"
											: (campaign?.status || "").toLowerCase() === "draft"
											? "default"
											: (campaign?.status || "").toLowerCase() === "paused"
											? "warning"
											: "info"
									}
									sx={{ fontWeight: "bold" }}
								/>
							</Box>
						</Box>
					) : (
						<Box sx={{ p: 3 }}>
							<TextField
								fullWidth
								label="Image URL"
								name="imageUrl"
								value={formData.imageUrl}
								onChange={handleInputChange}
								sx={{ mb: 2 }}
							/>
							<FormControl fullWidth sx={{ mb: 2 }}>
								<InputLabel>Status</InputLabel>
								<Select
									name="status"
									value={formData.status}
									onChange={handleSelectChange}
								>
									<MenuItem value="draft">Draft</MenuItem>
									<MenuItem value="active">Active</MenuItem>
									<MenuItem value="paused">Paused</MenuItem>
									<MenuItem value="completed">Completed</MenuItem>
								</Select>
							</FormControl>
						</Box>
					)}

					{/* Campaign Info */}
					<Box sx={{ p: 4 }}>
						<Grid container spacing={3}>
							<Grid component="div" item xs={12} md={8}>
								{!isEditMode ? (
									<>
										<Typography variant="h4" fontWeight="bold" gutterBottom>
											{campaign?.title || "Untitled Campaign"}
										</Typography>
										<Box display="flex" flexWrap="wrap" gap={1} mb={2}>
											{campaign?.causes &&
												campaign.causes.map(
													(cause: {
														id: string;
														title: string;
														description: string;
													}) => (
														<Chip
															key={cause.id}
															label={cause.title}
															size="small"
															color="primary"
															variant="outlined"
														/>
													)
												)}
										</Box>
									</>
								) : (
									<>
										<TextField
											fullWidth
											label="Campaign Title"
											name="title"
											value={formData.title}
											onChange={handleInputChange}
											sx={{ mb: 3 }}
										/>
										<TextField
											fullWidth
											label="Description"
											name="description"
											value={formData.description}
											onChange={handleInputChange}
											multiline
											rows={4}
											sx={{ mb: 3 }}
										/>
									</>
								)}

								<Box display="flex" alignItems="center" gap={3} mb={3}>
									<Box display="flex" alignItems="center">
										<CalendarIcon
											fontSize="small"
											color="action"
											sx={{ mr: 1 }}
										/>
										<Typography variant="body2" color="text.secondary">
											{daysLeft > 0
												? `${daysLeft} days left`
												: "Campaign ended"}
										</Typography>
									</Box>

									<Box display="flex" alignItems="center">
										<DonorsIcon
											fontSize="small"
											color="action"
											sx={{ mr: 1 }}
										/>
										<Typography variant="body2" color="text.secondary">
											{campaign?.donorCount || 0} donors
										</Typography>
									</Box>
								</Box>
							</Grid>

							<Grid component="div" item xs={12} md={4}>
								<Card
									sx={{ mb: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}
								>
									<CardContent>
										{isEditMode ? (
											<Box sx={{ mb: 2 }}>
												<TextField
													fullWidth
													label="Total Target Amount"
													name="totalTargetAmount"
													type="number"
													value={formData.totalTargetAmount}
													onChange={handleInputChange}
													InputProps={{
														startAdornment: <span>$</span>,
													}}
													sx={{ mb: 2 }}
												/>
												<Box
													display="grid"
													gridTemplateColumns="1fr 1fr"
													gap={2}
												>
													<DatePicker
														label="Start Date"
														value={formData.startDate}
														onChange={handleDateChange("startDate")}
														slotProps={{
															textField: {
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
																fullWidth: true,
															},
														}}
													/>
												</Box>
											</Box>
										) : (
											<>
												<Box sx={{ mb: 2 }}>
													<Box
														display="flex"
														justifyContent="space-between"
														alignItems="center"
														mb={0.5}
													>
														<Typography variant="body2" color="text.secondary">
															Progress
														</Typography>
														<Typography variant="body2" fontWeight="medium">
															{progressPercentage.toFixed(0)}%
														</Typography>
													</Box>
													<LinearProgress
														variant="determinate"
														value={progressPercentage}
														sx={{ height: 8, borderRadius: 4 }}
													/>
												</Box>

												<Grid container spacing={1}>
													<Grid component="div" item xs={6}>
														<Typography variant="body2" color="text.secondary">
															Raised
														</Typography>
														<Typography
															variant="h6"
															fontWeight="bold"
															color="primary"
														>
															$
															{(
																campaign?.totalRaisedAmount || 0
															).toLocaleString()}
														</Typography>
													</Grid>

													<Grid component="div" item xs={6}>
														<Typography
															variant="body2"
															color="text.secondary"
															align="right"
														>
															Goal
														</Typography>
														<Typography
															variant="h6"
															fontWeight="bold"
															align="right"
														>
															$
															{(
																campaign?.totalTargetAmount || 0
															).toLocaleString()}
														</Typography>
													</Grid>
												</Grid>
											</>
										)}
									</CardContent>
								</Card>

								{isEditMode ? (
									<Box sx={{ mb: 2 }}>
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
								) : (
									isAuthorized && (
										<Stack direction="row" spacing={2} sx={{ width: "100%" }}>
											<Button
												variant="outlined"
												startIcon={<EditIcon />}
												onClick={handleEditCampaign}
												fullWidth
											>
												Edit
											</Button>
											<Button
												variant="outlined"
												color="error"
												startIcon={<DeleteIcon />}
												onClick={handleDeleteDialogOpen}
												fullWidth
											>
												Delete
											</Button>
										</Stack>
									)
								)}
							</Grid>
						</Grid>
					</Box>
				</Paper>

				{/* Tabs Section */}
				<Box sx={{ mt: 4 }}>
					<Paper elevation={2} sx={{ borderRadius: 2 }}>
						<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
							<Tabs
								value={tabValue}
								onChange={handleTabChange}
								aria-label="campaign tabs"
								variant="scrollable"
								scrollButtons="auto"
							>
								<Tab label="Details" {...a11yProps(0)} />
								<Tab label="Causes" {...a11yProps(1)} />
								<Tab label="Donations" {...a11yProps(2)} />
							</Tabs>
						</Box>

						{/* Details Tab */}
						<TabPanel value={tabValue} index={0}>
							<Box sx={{ px: { xs: 2, md: 4 } }}>
								<Typography variant="h6" gutterBottom>
									Campaign Description
								</Typography>
								<Typography variant="body1" paragraph>
									{campaign?.description || "No description available."}
								</Typography>

								<Divider sx={{ my: 3 }} />

								<Grid container spacing={4}>
									<Grid component="div" item xs={12} md={6}>
										<Typography variant="h6" gutterBottom>
											Campaign Details
										</Typography>

										<List>
											<ListItem>
												<ListItemAvatar>
													<Avatar sx={{ bgcolor: "primary.light" }}>
														<CalendarIcon />
													</Avatar>
												</ListItemAvatar>
												<ListItemText
													primary="Start Date"
													secondary={formatDate(
														campaign?.startDate || new Date().toISOString()
													)}
												/>
											</ListItem>

											<ListItem>
												<ListItemAvatar>
													<Avatar sx={{ bgcolor: "primary.light" }}>
														<CalendarIcon />
													</Avatar>
												</ListItemAvatar>
												<ListItemText
													primary="End Date"
													secondary={formatDate(
														campaign?.endDate || new Date().toISOString()
													)}
												/>
											</ListItem>

											<ListItem>
												<ListItemAvatar>
													<Avatar sx={{ bgcolor: "primary.light" }}>
														<CategoryIcon />
													</Avatar>
												</ListItemAvatar>
												<ListItemText
													primary="Status"
													secondary={
														<Chip
															label={campaign?.status || "Unknown"}
															size="small"
															color={
																(campaign?.status || "").toLowerCase() ===
																"active"
																	? "success"
																	: (campaign?.status || "").toLowerCase() ===
																	  "draft"
																	? "default"
																	: (campaign?.status || "").toLowerCase() ===
																	  "paused"
																	? "warning"
																	: "info"
															}
														/>
													}
												/>
											</ListItem>
										</List>
									</Grid>

									<Grid component="div" item xs={12} md={6}>
										<Typography variant="h6" gutterBottom>
											Organization
										</Typography>

										<Card variant="outlined" sx={{ maxWidth: "100%" }}>
											<CardContent
												sx={{ display: "flex", alignItems: "center", gap: 2 }}
											>
												<Avatar
													sx={{
														bgcolor: "secondary.main",
														width: 50,
														height: 50,
													}}
												>
													<PersonIcon fontSize="large" />
												</Avatar>
												<Box>
													<Typography variant="h6">
														{campaign?.organizationName || "Organization"}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Campaign Organizer
													</Typography>
												</Box>
											</CardContent>
										</Card>
									</Grid>
								</Grid>
							</Box>
						</TabPanel>

						{/* Causes Tab */}
						<TabPanel value={tabValue} index={1}>
							<Box sx={{ px: { xs: 2, md: 4 } }}>
								<Typography variant="h6" gutterBottom>
									Related Causes
								</Typography>

								{campaign?.causes && campaign.causes.length > 0 ? (
									<Grid container spacing={3}>
										{campaign.causes.map(
											(cause: {
												id: string;
												title: string;
												description: string;
											}) => (
												<Grid
													component="div"
													item
													xs={12}
													md={6}
													key={cause._id}
												>
													<Card
														sx={{
															border: "1px solid #e0e0e0",
															borderRadius: 2,
														}}
													>
														<CardContent>
															<Typography variant="h6" gutterBottom>
																{cause.title}
															</Typography>

															{cause.description && (
																<Typography
																	variant="body2"
																	color="text.secondary"
																	paragraph
																>
																	{cause.description}
																</Typography>
															)}

															<Divider sx={{ my: 2 }} />

															<Grid container spacing={1}>
																<Grid component="div" item xs={6}>
																	<Typography
																		variant="body2"
																		color="text.secondary"
																	>
																		Target
																	</Typography>
																	<Typography variant="body1" fontWeight="bold">
																		$
																		{(cause.targetAmount || 0).toLocaleString()}
																	</Typography>
																</Grid>

																<Grid component="div" item xs={6}>
																	<Typography
																		variant="body2"
																		color="text.secondary"
																		align="right"
																	>
																		Raised
																	</Typography>
																	<Typography
																		variant="body1"
																		fontWeight="bold"
																		color="primary"
																		align="right"
																	>
																		$
																		{(cause.raisedAmount || 0).toLocaleString()}
																	</Typography>
																</Grid>
															</Grid>
														</CardContent>
													</Card>
												</Grid>
											)
										)}
									</Grid>
								) : (
									<Alert severity="info">
										No causes are associated with this campaign.
									</Alert>
								)}
							</Box>
						</TabPanel>

						{/* Donations Tab */}
						<TabPanel value={tabValue} index={2}>
							<Box sx={{ px: { xs: 2, md: 4 } }}>
								<Typography variant="h6" gutterBottom>
									Recent Donations
								</Typography>

								<Alert severity="info">
									Donation information will be available here when donations are
									made to this campaign.
								</Alert>
							</Box>
						</TabPanel>
					</Paper>
				</Box>

				{/* Delete Confirmation Dialog */}
				<Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
					<DialogTitle>Confirm Deletion</DialogTitle>
					<DialogContent>
						<Typography>
							Are you sure you want to delete this campaign? This action cannot
							be undone.
						</Typography>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={handleDeleteDialogClose}
							startIcon={<CancelIcon />}
						>
							Cancel
						</Button>
						<Button
							onClick={handleDeleteCampaign}
							color="error"
							startIcon={<DeleteIcon />}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
		</LocalizationProvider>
	);
}
