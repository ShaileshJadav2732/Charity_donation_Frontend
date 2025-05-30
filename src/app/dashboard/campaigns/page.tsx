"use client";

import {
	useDeleteCampaignMutation,
	useGetCampaignsQuery,
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
			case CampaignStatus.CANCELLED:
				return "error";
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

	// Fetch campaigns
	const { data, isLoading, error, refetch } = useGetCampaignsQuery({
		organizations: user?.id,
	});

	const [deleteCampaign, { isLoading: isDeleting }] =
		useDeleteCampaignMutation();

	// Process campaigns data - Fixed to handle the data structure properly
	const campaigns: Campaign[] = data?.campaigns || [];

	const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
		const matchesSearch = campaign.title
			?.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" ||
			campaign.status?.toLowerCase() === statusFilter.toLowerCase();
		return matchesSearch && matchesStatus;
	});

	// Handlers
	const handleCreateCampaign = () => router.push("/dashboard/campaigns/create");

	const handleEditCampaign = (id: string) => {
		router.push(`/dashboard/campaigns/${id}/edit`);
	};

	const handleDeleteClick = (id: string) => {
		setSelectedCampaignId(id);
		setDeleteDialogOpen(true);
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
					backgroundImage: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
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
							onChange={(e) => setSearchTerm(e.target.value)}
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
									onChange={(e) => setStatusFilter(e.target.value)}
									label="Status"
								>
									<MenuItem value="all">All</MenuItem>
									<MenuItem value="active">Active</MenuItem>
									<MenuItem value="draft">Draft</MenuItem>
									<MenuItem value="paused">Paused</MenuItem>
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

				{/* Campaign List */}
				{isLoading ? (
					<Box display="flex" justifyContent="center" p={4}>
						<CircularProgress />
					</Box>
				) : error ? (
					<Alert severity="error">Failed to load campaigns</Alert>
				) : filteredCampaigns.length === 0 ? (
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
						{filteredCampaigns.map((campaign) => {
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
										}}
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

											{/* Progress Bar */}
											<Box sx={{ mb: 2 }}>
												<Box
													display="flex"
													justifyContent="space-between"
													mb={0.5}
												>
													<Typography variant="body2" color="text.secondary">
														Progress
													</Typography>
													<Typography variant="body2" fontWeight="bold">
														{progress.toFixed(0)}%
													</Typography>
												</Box>
												<LinearProgress
													variant="determinate"
													value={progress}
													sx={{ height: 6, borderRadius: 3 }}
												/>
											</Box>

											{/* Raised vs Goal */}
											<Box
												sx={{
													display: "grid",
													gridTemplateColumns: "1fr 1fr",
													gap: 1,
													mb: 1,
												}}
											>
												<Box>
													<Typography variant="body2" color="text.secondary">
														Raised
													</Typography>
													<Typography
														variant="body2"
														fontWeight="bold"
														color="primary"
													>
														${campaign.totalRaisedAmount.toLocaleString()}
													</Typography>
												</Box>
												<Box sx={{ textAlign: "right" }}>
													<Typography variant="body2" color="text.secondary">
														Goal
													</Typography>
													<Typography variant="body2" fontWeight="bold">
														${campaign.totalTargetAmount.toLocaleString()}
													</Typography>
												</Box>
											</Box>

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
										<CardActions sx={{ justifyContent: "space-between" }}>
											<Button
												size="small"
												startIcon={<EditIcon />}
												onClick={() => handleEditCampaign(campaignId)}
											>
												Edit
											</Button>
											<Button
												size="small"
												color="error"
												startIcon={<DeleteIcon />}
												onClick={() => handleDeleteClick(campaignId)}
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
