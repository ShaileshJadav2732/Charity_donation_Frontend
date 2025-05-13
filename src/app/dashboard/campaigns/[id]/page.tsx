"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	Paper,
	Typography,
	Chip,
	Grid,
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
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import {
	CalendarMonth as CalendarIcon,
	Groups as DonorsIcon,
	VolunteerActivism as DonationIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	ArrowBack as BackIcon,
	Share as ShareIcon,
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon,
	Category as CategoryIcon,
	Person as PersonIcon,
} from "@mui/icons-material";
import {
	useGetCampaignByIdQuery,
	useDeleteCampaignMutation,
} from "@/store/api/campaignApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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
	if (target === 0) return 0;
	const percentage = (raised / target) * 100;
	return Math.min(percentage, 100); // Cap at 100%
};

export default function CampaignDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const router = useRouter();
	const { id } = params;
	const { user } = useSelector((state: RootState) => state.auth);
	const [tabValue, setTabValue] = useState(0);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const { data: campaignData, isLoading, error } = useGetCampaignByIdQuery(id);
	const [deleteCampaign, { isLoading: isDeleting }] =
		useDeleteCampaignMutation();

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleEditCampaign = () => {
		router.push(`/dashboard/campaigns/${id}/edit`);
	};

	const handleDeleteDialogOpen = () => {
		setDeleteDialogOpen(true);
	};

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

	if (!campaignData || !campaignData.campaign) {
		return (
			<Box p={4}>
				<Alert severity="warning">Campaign not found.</Alert>
			</Box>
		);
	}

	const campaign = campaignData.campaign;
	const progressPercentage = getProgressPercentage(
		campaign.totalRaisedAmount,
		campaign.totalTargetAmount
	);
	const { days: daysLeft, status: campaignTimeStatus } = getDaysRemaining(
		campaign.endDate
	);

	// Check if user is authorized to edit/delete this campaign
	const isAuthorized =
		user &&
		user.role === "organization" &&
		(campaign.organizationId === user.id ||
			(campaign.organizations && campaign.organizations.includes(user.id)));

	return (
		<Box sx={{ p: 4, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
			{/* Back Button */}
			<Button
				startIcon={<BackIcon />}
				onClick={() => router.push("/dashboard/campaigns")}
				sx={{ mb: 3 }}
			>
				Back to Campaigns
			</Button>

			{/* Campaign Header */}
			<Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
				{/* Campaign Image */}
				<Box
					sx={{
						height: { xs: 200, md: 300 },
						position: "relative",
						background: `url(${
							campaign.imageUrl || "https://placehold.co/1200x400?text=Campaign"
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
							label={campaign.status}
							color={
								campaign.status.toLowerCase() === "active"
									? "success"
									: campaign.status.toLowerCase() === "draft"
									? "default"
									: campaign.status.toLowerCase() === "paused"
									? "warning"
									: "info"
							}
							sx={{ fontWeight: "bold" }}
						/>
					</Box>
				</Box>

				{/* Campaign Info */}
				<Box sx={{ p: 4 }}>
					<Grid container spacing={3}>
						<Grid item xs={12} md={8}>
							<Typography variant="h4" fontWeight="bold" gutterBottom>
								{campaign.title}
							</Typography>

							<Box display="flex" flexWrap="wrap" gap={1} mb={2}>
								{campaign.causes &&
									campaign.causes.map((cause: any) => (
										<Chip
											key={cause.id}
											label={cause.title}
											size="small"
											color="primary"
											variant="outlined"
										/>
									))}
							</Box>

							<Box display="flex" alignItems="center" gap={3} mb={3}>
								<Box display="flex" alignItems="center">
									<CalendarIcon
										fontSize="small"
										color="action"
										sx={{ mr: 1 }}
									/>
									<Typography variant="body2" color="text.secondary">
										{daysLeft > 0 ? `${daysLeft} days left` : "Campaign ended"}
									</Typography>
								</Box>

								<Box display="flex" alignItems="center">
									<DonorsIcon fontSize="small" color="action" sx={{ mr: 1 }} />
									<Typography variant="body2" color="text.secondary">
										{campaign.donorCount || 0} donors
									</Typography>
								</Box>
							</Box>
						</Grid>

						<Grid item xs={12} md={4}>
							<Card
								sx={{ mb: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}
							>
								<CardContent>
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
										<Grid item xs={6}>
											<Typography variant="body2" color="text.secondary">
												Raised
											</Typography>
											<Typography
												variant="h6"
												fontWeight="bold"
												color="primary"
											>
												${campaign.totalRaisedAmount?.toLocaleString() || "0"}
											</Typography>
										</Grid>

										<Grid item xs={6}>
											<Typography
												variant="body2"
												color="text.secondary"
												align="right"
											>
												Goal
											</Typography>
											<Typography variant="h6" fontWeight="bold" align="right">
												${campaign.totalTargetAmount?.toLocaleString() || "0"}
											</Typography>
										</Grid>
									</Grid>
								</CardContent>
							</Card>

							{isAuthorized && (
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
								{campaign.description}
							</Typography>

							<Divider sx={{ my: 3 }} />

							<Grid container spacing={4}>
								<Grid item xs={12} md={6}>
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
												secondary={formatDate(campaign.startDate)}
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
												secondary={formatDate(campaign.endDate)}
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
														label={campaign.status}
														size="small"
														color={
															campaign.status.toLowerCase() === "active"
																? "success"
																: campaign.status.toLowerCase() === "draft"
																? "default"
																: campaign.status.toLowerCase() === "paused"
																? "warning"
																: "info"
														}
													/>
												}
											/>
										</ListItem>
									</List>
								</Grid>

								<Grid item xs={12} md={6}>
									<Typography variant="h6" gutterBottom>
										Donation Types Accepted
									</Typography>

									<Box display="flex" flexWrap="wrap" gap={1} mb={3}>
										{campaign.acceptedDonationTypes &&
											campaign.acceptedDonationTypes.map((type: string) => (
												<Chip
													key={type}
													label={type}
													icon={<DonationIcon />}
													variant="outlined"
												/>
											))}
									</Box>

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
													{campaign.organizationName || "Organization"}
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

							{campaign.causes && campaign.causes.length > 0 ? (
								<Grid container spacing={3}>
									{campaign.causes.map((cause: any) => (
										<Grid item xs={12} md={6} key={cause.id}>
											<Card
												sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}
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
														<Grid item xs={6}>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																Target
															</Typography>
															<Typography variant="body1" fontWeight="bold">
																${cause.targetAmount?.toLocaleString() || "0"}
															</Typography>
														</Grid>

														<Grid item xs={6}>
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
																${cause.raisedAmount?.toLocaleString() || "0"}
															</Typography>
														</Grid>
													</Grid>
												</CardContent>
											</Card>
										</Grid>
									))}
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

							{campaign.donations && campaign.donations.length > 0 ? (
								<List sx={{ width: "100%" }}>
									{campaign.donations.map((donation: any) => (
										<ListItem
											key={donation.id}
											secondaryAction={
												<Typography
													variant="h6"
													color="primary"
													fontWeight="bold"
												>
													${donation.amount?.toLocaleString() || "0"}
												</Typography>
											}
										>
											<ListItemAvatar>
												<Avatar sx={{ bgcolor: "success.light" }}>
													<DonorsIcon />
												</Avatar>
											</ListItemAvatar>
											<ListItemText
												primary={donation.donorName || "Anonymous"}
												secondary={`${donation.type} | ${new Date(
													donation.date
												).toLocaleDateString()}`}
											/>
										</ListItem>
									))}
								</List>
							) : (
								<Alert severity="info">
									No donations have been made to this campaign yet.
								</Alert>
							)}
						</Box>
					</TabPanel>
				</Paper>
			</Box>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete this campaign? This action cannot be
						undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteDialogClose} startIcon={<CancelIcon />}>
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
	);
}
