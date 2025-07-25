"use client";

import {
	useDeleteCauseMutation,
	useGetCausesQuery,
} from "@/store/api/causeApi";
import { RootState } from "@/store/store";
import { Cause } from "@/types/cause";
import { DonationType } from "@/types/donation";
import {
	Add as AddIcon,
	Bloodtype as BloodIcon,
	MenuBook as BooksIcon,
	Checkroom as ClothesIcon,
	Delete as DeleteIcon,
	Restaurant as FoodIcon,
	Chair as FurnitureIcon,
	GridView as AllIcon,
	Home as HouseholdIcon,
	Inventory as ItemsIcon,
	AttachMoney as MoneyIcon,
	Category as OtherIcon,
	Search as SearchIcon,
	SwapHoriz as BothIcon,
	GpsFixed as Target,
	Toys as ToysIcon,
	Edit as EditIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	LinearProgress,
	Pagination,
	Paper,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import CauseCampaignAssociations from "./CauseCampaignAssociations";

const DonationTypeIcons = {
	[DonationType.MONEY]: MoneyIcon,
	[DonationType.CLOTHES]: ClothesIcon,
	[DonationType.BLOOD]: BloodIcon,
	[DonationType.FOOD]: FoodIcon,
	[DonationType.TOYS]: ToysIcon,
	[DonationType.BOOKS]: BooksIcon,
	[DonationType.FURNITURE]: FurnitureIcon,
	[DonationType.HOUSEHOLD]: HouseholdIcon,
	[DonationType.OTHER]: OtherIcon,
};

const CausesPage = () => {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [searchTerm, setSearchTerm] = useState("");
	const [donationTypeFilter, setDonationTypeFilter] = useState<string>("all");
	const [isDeleting, setIsDeleting] = useState(false);
	const [createCauseDialogOpen, setCreateCauseDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [causeToDelete, setCauseToDelete] = useState<{
		id: string;
		title: string;
	} | null>(null);

	// Pagination state
	const [page, setPage] = useState(1);
	const limit = 10;

	const {
		data: causesData,
		isLoading,
		error,
		refetch,
	} = useGetCausesQuery({
		organizationId: user?.id,
		page,
		limit,
		search: searchTerm.trim() || undefined,
		acceptanceType:
			donationTypeFilter !== "all"
				? (donationTypeFilter as "money" | "items" | "both")
				: undefined,
	});

	const [deleteCause] = useDeleteCauseMutation();

	// Server-side filtering is now handled by API
	const causes = causesData?.causes || [];
	const totalCauses = causesData?.total || 0;
	const totalPages = Math.ceil(totalCauses / limit);

	const handleCreateCause = () => {
		router.push("/dashboard/causes/create");
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

	const handleDonationTypeFilterChange = (newValue: string | null) => {
		if (newValue !== null) {
			setDonationTypeFilter(newValue);
			setPage(1); // Reset to first page when filtering
		}
	};

	const handleEditCause = (id: string) => {
		router.push(`/dashboard/causes/${id}/edit`);
	};

	const handleDeleteCause = (id: string, title: string) => {
		setCauseToDelete({ id, title });
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!causeToDelete) return;

		try {
			setIsDeleting(true);
			const result = await deleteCause(causeToDelete.id).unwrap();
			toast.success(result.message || "Cause deleted successfully!");
			refetch();
			handleCloseDeleteDialog();
		} catch (error: any) {
			// Handle specific error messages from the backend
			const errorMessage =
				error?.data?.message || "Failed to delete cause. Please try again.";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCloseDeleteDialog = () => {
		setDeleteDialogOpen(false);
		setCauseToDelete(null);
	};

	const handleCloseCreateCauseDialog = () => {
		setCreateCauseDialogOpen(false);
	};

	const handleConfirmCreateCause = () => {
		setCreateCauseDialogOpen(false);
		handleCreateCause();
	};

	if (!user || user.role !== "organization") {
		return (
			<Box p={2}>
				<Alert severity="error">
					Access Denied. Only organizations can view causes.
				</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
			{/* Header Section */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 1 }}
				>
					Your Causes
				</Typography>
				<Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
					Create and manage causes to organize your fundraising efforts
					effectively.
				</Typography>
			</Box>

			{/* Content */}
			<Box>
				{/* Search and Create Bar */}
				<Paper
					elevation={0}
					sx={{
						p: 3,
						mb: 4,
						borderRadius: 3,
						border: "1px solid #e0e0e0",
					}}
				>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "stretch", sm: "center" }}
						spacing={2}
					>
						<TextField
							placeholder="Search causes..."
							value={searchTerm}
							onChange={handleSearchChange}
							size="medium"
							slotProps={{
								input: {
									startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
								},
							}}
							sx={{
								flexGrow: 1,
								"& .MuiOutlinedInput-root": {
									borderRadius: 2,
								},
							}}
						/>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => setCreateCauseDialogOpen(true)}
							sx={{
								backgroundColor: "#287068",
								color: "white",
								fontWeight: 600,
								px: 3,
								py: 1.5,
								borderRadius: 2,
								"&:hover": {
									backgroundColor: "#1f5a52",
								},
							}}
						>
							Create Cause
						</Button>
					</Stack>

					{/* Donation Type Filter */}
					<Box mt={3}>
						<Typography
							variant="body2"
							sx={{ mb: 2, fontWeight: 600, color: "#1a1a1a" }}
						>
							Filter by Donation Type:
						</Typography>
						<ToggleButtonGroup
							value={donationTypeFilter}
							exclusive
							onChange={(_, newValue) =>
								handleDonationTypeFilterChange(newValue)
							}
							sx={{
								gap: 1,
								flexWrap: "wrap",
								"& .MuiToggleButton-root": {
									border: "2px solid #e0e0e0",
									borderRadius: 2,
									px: 2,
									py: 1,
									color: "#666",
									backgroundColor: "white",
									"&:hover": {
										backgroundColor: "#f8f9fa",
										borderColor: "#287068",
									},
									"&.Mui-selected": {
										backgroundColor: "#287068",
										color: "white",
										borderColor: "#287068",
										"&:hover": {
											backgroundColor: "#1f5a52",
										},
									},
								},
							}}
						>
							<ToggleButton value="all">
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<AllIcon sx={{ fontSize: 18 }} />
									<Typography variant="body2" sx={{ fontWeight: 500 }}>
										All Types
									</Typography>
								</Box>
							</ToggleButton>
							<ToggleButton value="money">
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<MoneyIcon sx={{ fontSize: 18 }} />
									<Typography variant="body2" sx={{ fontWeight: 500 }}>
										Money Only
									</Typography>
								</Box>
							</ToggleButton>
							<ToggleButton value="items">
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<ItemsIcon sx={{ fontSize: 18 }} />
									<Typography variant="body2" sx={{ fontWeight: 500 }}>
										Items Only
									</Typography>
								</Box>
							</ToggleButton>
							<ToggleButton value="both">
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<BothIcon sx={{ fontSize: 18 }} />
									<Typography variant="body2" sx={{ fontWeight: 500 }}>
										Both
									</Typography>
								</Box>
							</ToggleButton>
						</ToggleButtonGroup>
					</Box>
				</Paper>

				{/* Campaign Reminder */}
				{!isLoading && !error && causes && causes.length > 0 && (
					<Alert
						severity="info"
						sx={{
							mb: 4,
							borderRadius: 2,
							border: "1px solid #e3f2fd",
							backgroundColor: "#f8faff",
						}}
					>
						<Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
							Important: Causes must be added to active campaigns to be visible
							to donors
						</Typography>
						<Typography variant="body2" color="text.secondary">
							After creating a cause, make sure to add it to an active campaign
							from the cause detail page. Donors can only see causes that are
							part of active campaigns.
						</Typography>
					</Alert>
				)}

				{/* Causes List */}
				{isLoading ? (
					<Box display="flex" justifyContent="center" p={6}>
						<CircularProgress sx={{ color: "#287068" }} />
					</Box>
				) : error ? (
					<Alert
						severity="error"
						sx={{
							borderRadius: 2,
							border: "1px solid #ffebee",
							backgroundColor: "#fef7f7",
						}}
					>
						Failed to load causes
					</Alert>
				) : causes?.length === 0 ? (
					<Paper
						sx={{
							p: 6,
							textAlign: "center",
							borderRadius: 3,
							border: "1px solid #e0e0e0",
							backgroundColor: "#fafafa",
						}}
					>
						<Target sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
						<Typography variant="h6" color="text.secondary" gutterBottom>
							No causes found
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
							{searchTerm || donationTypeFilter !== "all"
								? "Try adjusting your search terms or filters"
								: "Create your first cause to get started!"}
						</Typography>
						{!searchTerm && (
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={() => setCreateCauseDialogOpen(true)}
								sx={{
									backgroundColor: "#287068",
									"&:hover": { backgroundColor: "#1f5a52" },
								}}
							>
								Create Your First Cause
							</Button>
						)}
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
							gap: 3,
						}}
					>
						{causes?.map((cause: Cause) => {
							// Fix progress calculation with safe defaults
							const raisedAmount = cause.raisedAmount || 0;
							const targetAmount = cause.targetAmount || 1; // Prevent division by zero
							const progress =
								targetAmount > 0
									? Math.min(
											100,
											Math.round((raisedAmount / targetAmount) * 100)
									  )
									: 0;

							const acceptanceType = cause.acceptanceType || "money";
							const primaryDonationType =
								cause.acceptedDonationTypes?.[0] || DonationType.MONEY;
							const DonationIcon = DonationTypeIcons[primaryDonationType];

							// Calculate urgency based on progress
							let urgency = "low";
							if (progress < 30) {
								urgency = "high";
							} else if (progress < 70) {
								urgency = "medium";
							}

							const getUrgencyColor = (urgency: string) => {
								switch (urgency) {
									case "high":
										return "#000000bb";
									case "medium":
										return "#f59e0b";
									case "low":
										return "#10b981";
									default:
										return "#287068";
								}
							};

							return (
								<Box key={cause.id}>
									<Card
										sx={{
											height: "100%",
											display: "flex",
											flexDirection: "column",
											borderRadius: 3,
											border: "1px solid #e0e0e0",
											boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
											transition: "all 0.2s ease",
											"&:hover": {
												transform: "translateY(-4px)",
												boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
											},
										}}
									>
										{/* Header with image or icon */}
										<Box
											sx={{
												height: 220,
												position: "relative",
												overflow: "hidden",
											}}
										>
											{cause.imageUrl ? (
												<Box
													component="img"
													src={cause.imageUrl}
													alt={cause.title}
													sx={{
														width: "100%",
														height: "100%",
														objectFit: "cover",
													}}
												/>
											) : (
												<Box
													sx={{
														height: "100%",
														background: `linear-gradient(45deg, ${getUrgencyColor(
															urgency
														)}20, ${getUrgencyColor(urgency)}40)`,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													<DonationIcon
														sx={{
															fontSize: "3rem",
															color: getUrgencyColor(urgency),
															opacity: 0.8,
														}}
													/>
												</Box>
											)}
											<Box
												sx={{
													position: "absolute",
													top: 12,
													right: 12,
												}}
											>
												<Chip
													label={
														acceptanceType === "money"
															? "Funding"
															: acceptanceType === "items"
															? "Items"
															: "Mixed"
													}
													size="small"
													sx={{
														backgroundColor: getUrgencyColor(urgency),
														color: "white",
														fontWeight: 600,
														fontSize: "0.7rem",
														zIndex: 2,
													}}
												/>
											</Box>
										</Box>

										<CardContent sx={{ flexGrow: 1, p: 3 }}>
											<Typography
												variant="h6"
												sx={{
													fontWeight: 600,
													mb: 1,
													minHeight: 48,
													color: "#1a1a1a",
												}}
											>
												{cause.title}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{
													overflow: "hidden",
													textOverflow: "ellipsis",
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
													mb: 2,
													lineHeight: 1.4,
													minHeight: 40,
												}}
											>
												{cause.description}
											</Typography>

											{/* Progress Section - show for money and both types */}
											{acceptanceType !== "items" && (
												<Box sx={{ mb: 2 }}>
													<Box
														sx={{
															display: "flex",
															justifyContent: "space-between",
															mb: 1,
														}}
													>
														<Typography variant="body2" color="text.secondary">
															Progress
														</Typography>
														<Typography
															variant="body2"
															sx={{ fontWeight: 600 }}
														>
															{progress.toFixed(1)}%
														</Typography>
													</Box>
													<LinearProgress
														variant="determinate"
														value={progress}
														sx={{
															height: 8,
															borderRadius: 4,
															backgroundColor: "#f0f0f0",
															"& .MuiLinearProgress-bar": {
																backgroundColor: getUrgencyColor(urgency),
																borderRadius: 4,
															},
															mb: 1,
														}}
													/>
													{/* Show raised/goal below progress bar for money and both types */}
													<Box
														sx={{
															display: "flex",
															justifyContent: "space-between",
															alignItems: "center",
														}}
													>
														<Box>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																Raised
															</Typography>
															<Typography
																variant="h6"
																sx={{ fontWeight: 600, color: "#287068" }}
															>
																₹{raisedAmount.toLocaleString()}
															</Typography>
														</Box>
														<Box sx={{ textAlign: "right" }}>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																Goal
															</Typography>
															<Typography variant="h6" sx={{ fontWeight: 600 }}>
																₹{(cause.targetAmount || 0).toLocaleString()}
															</Typography>
														</Box>
													</Box>
												</Box>
											)}

											{/* Items Section - show for items and both types */}
											{acceptanceType !== "money" && (
												<Box sx={{ mb: 2 }}>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ fontWeight: 500, mb: 1 }}
													>
														Needed Items:
													</Typography>
													{cause.donationItems &&
													Array.isArray(cause.donationItems) &&
													cause.donationItems.length > 0 ? (
														<Box display="flex" gap={0.5} flexWrap="wrap">
															{[...new Set(cause.donationItems)]
																.slice(0, 2)
																.map((item, index) => (
																	<Chip
																		key={`donation-item-${index}-${item}`}
																		label={item}
																		size="small"
																		variant="outlined"
																		sx={{
																			borderRadius: 1,
																			fontSize: "0.7rem",
																			height: 22,
																			borderColor: getUrgencyColor(urgency),
																			color: getUrgencyColor(urgency),
																		}}
																	/>
																))}
															{[...new Set(cause.donationItems)].length > 2 && (
																<Chip
																	label={`+${
																		[...new Set(cause.donationItems)].length - 2
																	} more`}
																	size="small"
																	variant="outlined"
																	sx={{
																		borderRadius: 1,
																		fontSize: "0.7rem",
																		height: 22,
																		borderColor: getUrgencyColor(urgency),
																		color: getUrgencyColor(urgency),
																	}}
																/>
															)}
														</Box>
													) : (
														<Typography
															variant="caption"
															color="text.secondary"
														>
															Accepting various item donations
														</Typography>
													)}
												</Box>
											)}

											{/* Tags Section */}
											{cause.tags &&
												Array.isArray(cause.tags) &&
												cause.tags.length > 0 && (
													<Box sx={{ mb: 2 }}>
														<Box display="flex" gap={0.5} flexWrap="wrap">
															{cause.tags.slice(0, 2).map((tag, index) => (
																<Chip
																	key={`tag-${index}-${tag}`}
																	label={tag}
																	size="small"
																	variant="filled"
																	sx={{
																		backgroundColor: `${getUrgencyColor(
																			urgency
																		)}20`,
																		color: getUrgencyColor(urgency),
																		borderRadius: 1,
																		fontSize: "0.7rem",
																		height: 22,
																		fontWeight: 500,
																	}}
																/>
															))}
															{cause.tags.length > 2 && (
																<Chip
																	label={`+${cause.tags.length - 2}`}
																	size="small"
																	variant="outlined"
																	sx={{
																		borderRadius: 1,
																		fontSize: "0.7rem",
																		height: 22,
																		borderColor: getUrgencyColor(urgency),
																		color: getUrgencyColor(urgency),
																	}}
																/>
															)}
														</Box>
													</Box>
												)}

											{/* Campaign Associations */}
											<Box sx={{ mb: 2 }}>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{ fontWeight: 500, mb: 1 }}
												>
													Campaign Associations:
												</Typography>
												<CauseCampaignAssociations
													causeId={cause.id}
													onCampaignRemoved={refetch}
												/>
											</Box>
										</CardContent>
										<CardActions
											sx={{ justifyContent: "space-between", p: 3, pt: 0 }}
										>
											<Button
												variant="outlined"
												size="small"
												onClick={() => handleEditCause(cause.id)}
												sx={{
													borderColor: "#287068",
													color: "#287068",
													"&:hover": {
														backgroundColor: "#287068",
														color: "white",
													},
												}}
											>
												Edit
											</Button>
											<IconButton
												size="small"
												onClick={() => handleDeleteCause(cause.id, cause.title)}
												disabled={isDeleting}
												sx={{
													color: "#ef4444",
													"&:hover": {
														backgroundColor: "#fef2f2",
													},
												}}
											>
												<DeleteIcon />
											</IconButton>
										</CardActions>
									</Card>
								</Box>
							);
						})}
					</Box>
				)}

				{/* Results Summary */}
				{!isLoading && !error && totalCauses > 0 && (
					<Box sx={{ mt: 4, mb: 2 }}>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ textAlign: "center" }}
						>
							Showing {(page - 1) * limit + 1}-
							{Math.min(page * limit, totalCauses)} of {totalCauses} causes
						</Typography>
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
							sx={{
								"& .MuiPaginationItem-root": {
									color: "#287068",
									borderColor: "#287068",
									"&:hover": {
										backgroundColor: "rgba(40, 112, 104, 0.1)",
									},
									"&.Mui-selected": {
										backgroundColor: "#287068",
										color: "white",
										"&:hover": {
											backgroundColor: "#1f5a52",
										},
									},
								},
							}}
						/>
					</Box>
				)}
			</Box>

			{/* Create Cause Dialog */}
			<Dialog
				open={createCauseDialogOpen}
				onClose={handleCloseCreateCauseDialog}
				maxWidth="sm"
				fullWidth
				slotProps={{
					paper: {
						sx: {
							borderRadius: 3,
							p: 1,
						},
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 600, color: "#1a1a1a" }}>
					Create New Cause
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ color: "#666", lineHeight: 1.6 }}>
						Creating a cause helps you organize your campaigns by theme or area
						of focus. Would you like to create a new cause now?
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Button onClick={handleCloseCreateCauseDialog} sx={{ color: "#666" }}>
						Cancel
					</Button>
					<Button
						onClick={handleConfirmCreateCause}
						variant="contained"
						sx={{
							backgroundColor: "#287068",
							"&:hover": { backgroundColor: "#1f5a52" },
						}}
					>
						Create Cause
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Cause Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleCloseDeleteDialog}
				maxWidth="sm"
				fullWidth
				slotProps={{
					paper: {
						sx: {
							borderRadius: 3,
							p: 1,
						},
					},
				}}
			>
				<DialogTitle
					sx={{
						fontWeight: 600,
						color: "#ef4444",
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<DeleteIcon />
					Delete Cause
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ color: "#666", lineHeight: 1.6, mb: 2 }}>
						Are you sure you want to delete the cause{" "}
						<strong>"{causeToDelete?.title}"</strong>?
					</DialogContentText>
					<DialogContentText
						sx={{ color: "#ef4444", lineHeight: 1.6, fontSize: "0.9rem" }}
					>
						⚠️ <strong>Important:</strong> Causes with existing donations or
						associated with campaigns cannot be deleted. You'll need to remove
						the cause from all campaigns first.
					</DialogContentText>
					<DialogContentText
						sx={{ color: "#666", lineHeight: 1.6, fontSize: "0.9rem", mt: 1 }}
					>
						This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Button
						onClick={handleCloseDeleteDialog}
						sx={{ color: "#666" }}
						disabled={isDeleting}
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirmDelete}
						variant="contained"
						color="error"
						disabled={isDeleting}
						sx={{
							backgroundColor: "#ef4444",
							"&:hover": { backgroundColor: "#dc2626" },
							minWidth: 120,
						}}
					>
						{isDeleting ? (
							<>
								<CircularProgress size={16} sx={{ mr: 1, color: "white" }} />
								Deleting...
							</>
						) : (
							"Delete Cause"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default CausesPage;
