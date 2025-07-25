"use client";

import {
	useDeleteCampaignMutation,
	useGetOrganizationCampaignsQuery,
} from "@/store/api/campaignApi";
import { RootState } from "@/store/store";
import { Campaign, CampaignStatus } from "@/types/campaings";
import {
	Add as AddIcon,
	CalendarMonth as CalendarIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Groups as GroupsIcon,
	Search as SearchIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	InputLabel,
	LinearProgress,
	MenuItem,
	Pagination,
	Paper,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

const StatusChip = ({ status }: { status: string }) => {
	const getStatusColor = (status: string) => {
		switch (status.toUpperCase()) {
			case CampaignStatus.ACTIVE:
				return "success";
			case CampaignStatus.DRAFT:
				return "default";
			case CampaignStatus.PAUSED:
				return "warning";
			case CampaignStatus.COMPLETED:
				return "info";

			default:
				return "default";
		}
	};

	return (
		<Chip
			label={status}
			color={getStatusColor(status)}
			size="small"
			sx={{ textTransform: "capitalize" }}
		/>
	);
};

const getDaysLeft = (endDate: string): number => {
	const end = new Date(endDate);
	const today = new Date();
	const diffTime = end.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays > 0 ? diffDays : 0;
};

const getProgressPercentage = (raised: number, target: number): number => {
	if (target === 0) return 0;
	const percentage = (raised / target) * 100;
	return Math.min(percentage, 100);
};

const CampaignsPage = () => {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
		null
	);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	// Pagination state
	const [page, setPage] = useState(1);
	const limit = 10;

	// Fetch campaigns with pagination
	const { data, isLoading, error, refetch } = useGetOrganizationCampaignsQuery({
		organizationId: user?.id || "",
		page,
		limit,
		search: searchTerm.trim() || undefined,
		status: statusFilter !== "all" ? (statusFilter as any) : undefined,
	});

	const [deleteCampaign, { isLoading: isDeleting }] =
		useDeleteCampaignMutation();

	// Process campaigns data - server-side filtering is now handled by API
	const campaigns: Campaign[] = data?.campaigns || [];
	const totalCampaigns = data?.total || 0;
	const totalPages = Math.ceil(totalCampaigns / limit);

	// Handlers
	const handleCreateCampaign = () => router.push("/dashboard/campaigns/create");

	const handleEditCampaign = (id: string) => {
		router.push(`/dashboard/campaigns/${id}/edit`);
	};

	const handleDeleteClick = (id: string) => {
		setSelectedCampaignId(id);
		setDeleteDialogOpen(true);
	};

	const handlePageChange = (
		_event: React.ChangeEvent<unknown>,
		newPage: number
	) => {
		setPage(newPage);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setPage(1); // Reset to first page when searching
	};

	const handleStatusFilterChange = (value: string) => {
		setStatusFilter(value);
		setPage(1); // Reset to first page when filtering
	};

	const handleDeleteConfirm = async () => {
		if (selectedCampaignId) {
			try {
				await deleteCampaign(selectedCampaignId).unwrap();
				refetch();
				setDeleteDialogOpen(false);
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to delete campaign";
				setDeleteError(errorMessage);
			}
		}
	};

	return (
		<Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
			{/* Header */}
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 2,
					borderRadius: 0,
					backgroundImage: "linear-gradient(#287068, #2f8077)",
					color: "white",
				}}
			>
				<Typography variant="h5" fontWeight="bold" gutterBottom>
					Your Campaigns
				</Typography>
				<Typography variant="subtitle2">
					Manage all your fundraising campaigns
				</Typography>
			</Paper>

			{/* Content */}
			<Box sx={{ p: 2 }}>
				{/* Search and Filter Bar */}
				<Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "stretch", sm: "center" }}
						spacing={1}
					>
						<TextField
							placeholder="Search campaigns..."
							value={searchTerm}
							onChange={handleSearchChange}
							size="small"
							slotProps={{
								input: {
									startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
								},
							}}
							sx={{ flexGrow: 1 }}
						/>
						<Stack direction="row" spacing={1}>
							<FormControl size="small" sx={{ minWidth: 100 }}>
								<InputLabel>Status</InputLabel>
								<Select
									value={statusFilter}
									onChange={(e) => handleStatusFilterChange(e.target.value)}
									label="Status"
								>
									<MenuItem value="all">All</MenuItem>
									<MenuItem value="active">Active</MenuItem>
									<MenuItem value="draft">Draft</MenuItem>
									<MenuItem value="completed">Completed</MenuItem>
								</Select>
							</FormControl>
							<Button
								variant="contained"
								color="primary"
								startIcon={<AddIcon />}
								onClick={handleCreateCampaign}
								size="small"
							>
								Create Campaign
							</Button>
						</Stack>
					</Stack>
				</Paper>

				{/* Results Summary */}
				{!isLoading && !error && totalCampaigns > 0 && (
					<Box sx={{ mb: 2 }}>
						<Typography variant="body2" color="text.secondary">
							Showing {(page - 1) * limit + 1}-
							{Math.min(page * limit, totalCampaigns)} of {totalCampaigns}{" "}
							campaigns
						</Typography>
					</Box>
				)}

				{/* Campaign List */}
				{isLoading ? (
					<Box display="flex" justifyContent="center" p={4}>
						<CircularProgress />
					</Box>
				) : error ? (
					<Alert severity="error">Failed to load campaigns</Alert>
				) : campaigns.length === 0 ? (
					<Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
						<Typography variant="h6" gutterBottom>
							No campaigns found
						</Typography>
						<Typography variant="body2" color="text.secondary" mb={2}>
							Create your first campaign to start raising funds
						</Typography>
						<Button
							variant="outlined"
							startIcon={<AddIcon />}
							onClick={handleCreateCampaign}
							size="small"
						>
							Create Campaign
						</Button>
					</Paper>
				) : (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, 1fr)",
								md: "repeat(3, 1fr)",
							},
							gap: 2,
						}}
					>
						{campaigns.map((campaign) => {
							const progress = getProgressPercentage(
								campaign.totalRaisedAmount,
								campaign.totalTargetAmount
							);
							const daysLeft = getDaysLeft(campaign.endDate);
							// Use the correct id property from the Campaign type
							const campaignId = campaign.id;

							return (
								<Box key={campaignId}>
									<Card
										sx={{
											height: "100%",
											display: "flex",
											flexDirection: "column",
											cursor: "pointer",
											transition: "all 0.2s ease",
											position: "relative",
											"&:hover": {
												transform: "translateY(-2px)",
												boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
												"&::after": {
													content: '"Click to view details"',
													position: "absolute",
													top: 10,
													right: 10,
													backgroundColor: "rgba(40, 112, 104, 0.9)",
													color: "white",
													padding: "4px 8px",
													borderRadius: 1,
													fontSize: "0.75rem",
													fontWeight: 500,
													zIndex: 2,
												},
											},
										}}
										onClick={() =>
											router.push(`/dashboard/campaigns/${campaignId}`)
										}
									>
										{/* Campaign Image */}
										<CardMedia
											component="img"
											height="200"
											image={
												campaign.imageUrl ||
												"https://placehold.co/600x400?text=Campaign"
											}
											alt={campaign.title}
											sx={{
												objectFit: "cover",
												backgroundColor: "#f5f5f5",
												height: "200px",
												width: "100%",
												aspectRatio: "16/9",
												position: "relative",
												"&::before": {
													content: '""',
													position: "absolute",
													top: 0,
													left: 0,
													right: 0,
													bottom: 0,
													backgroundColor: "rgba(0, 0, 0, 0.1)",
													zIndex: 1,
												},
											}}
										/>

										{/* Status Chip */}
										<Box sx={{ position: "relative", mt: -2, mx: 1.5 }}>
											<StatusChip status={campaign.status} />
										</Box>

										{/* Campaign Content */}
										<CardContent sx={{ flexGrow: 1 }}>
											<Typography gutterBottom variant="h6" component="div">
												{campaign.title}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mb: 2 }}
											>
												{campaign.description?.substring(0, 100)}...
											</Typography>

											{/* Progress Bar - only show for campaigns with monetary targets */}
											{campaign.totalTargetAmount > 0 ? (
												<>
													<Box
														sx={{
															display: "grid",
															gridTemplateColumns: "1fr 1fr",
															gap: 1,
															mb: 1,
														}}
													></Box>
												</>
											) : (
												<Box sx={{ mb: 2 }}>
													<Alert severity="info" sx={{ py: 1 }}>
														<Typography variant="body2">
															<strong>Items-only campaign</strong> - No monetary
															target set
														</Typography>
													</Alert>
												</Box>
											)}

											{(() => {
												const allDonationItems =
													campaign.causes
														?.filter(
															(cause) =>
																cause.donationItems &&
																Array.isArray(cause.donationItems) &&
																cause.donationItems.length > 0
														)
														?.flatMap((cause) => cause.donationItems || [])
														?.filter(
															(item, index, array) =>
																item &&
																typeof item === "string" &&
																array.indexOf(item) === index
														) || [];

												if (allDonationItems.length > 0) {
													return (
														<Box sx={{ mb: 2 }}>
															<Typography
																variant="body2"
																color="text.secondary"
																sx={{ fontWeight: 500, mb: 1 }}
															>
																Needed Items from Campaign Causes:
															</Typography>
															<Box display="flex" gap={0.5} flexWrap="wrap">
																{allDonationItems
																	.slice(0, 3)
																	.map((item, index) => (
																		<Chip
																			key={index}
																			label={item}
																			size="small"
																			variant="outlined"
																			sx={{
																				borderRadius: 1,
																				fontSize: "0.7rem",
																				height: 22,
																				borderColor: "#287068",
																				color: "#287068",
																			}}
																		/>
																	))}
																{allDonationItems.length > 3 && (
																	<Chip
																		label={`+${
																			allDonationItems.length - 3
																		} more`}
																		size="small"
																		variant="outlined"
																		sx={{
																			borderRadius: 1,
																			fontSize: "0.7rem",
																			height: 22,
																			borderColor: "#6c757d",
																			color: "#6c757d",
																		}}
																	/>
																)}
															</Box>
														</Box>
													);
												}

												// Show debug info if no items found but causes exist
												if (campaign.causes && campaign.causes.length > 0) {
													return (
														<Box sx={{ mb: 2 }}>
															<Typography
																variant="body2"
																color="text.secondary"
																sx={{ fontStyle: "italic" }}
															>
																Campaign has {campaign.causes.length} cause(s)
																but no donation items configured.
															</Typography>
														</Box>
													);
												}

												return null;
											})()}

											{/* Metadata */}
											<Box display="flex" justifyContent="space-between" mt={1}>
												<Box display="flex" alignItems="center">
													<CalendarIcon
														fontSize="small"
														color="action"
														sx={{ mr: 0.5 }}
													/>
													<Typography variant="body2" color="text.secondary">
														{daysLeft} days left
													</Typography>
												</Box>
												<Box display="flex" alignItems="center">
													<GroupsIcon
														fontSize="small"
														color="action"
														sx={{ mr: 0.5 }}
													/>
													<Typography variant="body2" color="text.secondary">
														{campaign.donorCount || 0} supporters
													</Typography>
												</Box>
											</Box>
										</CardContent>

										{/* Actions */}
										<CardActions
											sx={{ justifyContent: "space-between" }}
											onClick={(e) => e.stopPropagation()} // Prevent card click when clicking buttons
										>
											<Button
												size="small"
												startIcon={<EditIcon />}
												onClick={(e) => {
													e.stopPropagation();
													handleEditCampaign(campaignId);
												}}
											>
												Edit
											</Button>
											<Button
												size="small"
												color="error"
												startIcon={<DeleteIcon />}
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteClick(campaignId);
												}}
												disabled={isDeleting}
											>
												Delete
											</Button>
										</CardActions>
									</Card>
								</Box>
							);
						})}
					</Box>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
						<Pagination
							count={totalPages}
							page={page}
							onChange={handlePageChange}
							color="primary"
							size="large"
							showFirstButton
							showLastButton
						/>
					</Box>
				)}
			</Box>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
			>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete this campaign? This action cannot be
						undone.
					</DialogContentText>
					{deleteError && (
						<Alert severity="error" sx={{ mt: 2 }}>
							{deleteError}
						</Alert>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default CampaignsPage;
