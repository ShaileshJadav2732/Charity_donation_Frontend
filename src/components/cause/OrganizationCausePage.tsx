"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardActions,
	Typography,
	Chip,
	TextField,
	Alert,
	CircularProgress,
	Paper,
	Stack,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	LinearProgress,
} from "@mui/material";
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Search as SearchIcon,
	AttachMoney as MoneyIcon,
	Checkroom as ClothesIcon,
	Bloodtype as BloodIcon,
	Restaurant as FoodIcon,
	Toys as ToysIcon,
	MenuBook as BooksIcon,
	Chair as FurnitureIcon,
	Home as HouseholdIcon,
	Category as OtherIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	useGetCausesQuery,
	useDeleteCauseMutation,
} from "@/store/api/causeApi";
import { Cause } from "@/types/cause";
import { DonationType } from "@/types/donation";
import { toast } from "react-hot-toast";

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
	const [isDeleting, setIsDeleting] = useState(false);
	const [createCauseDialogOpen, setCreateCauseDialogOpen] = useState(false);

	const {
		data: causesData,
		isLoading,
		error,
		refetch,
	} = useGetCausesQuery({ organizationId: user?.id });

	const [deleteCause] = useDeleteCauseMutation();

	const filteredCauses = causesData?.causes?.filter((cause: Cause) =>
		cause.title.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleCreateCause = () => {
		router.push("/dashboard/causes/create");
	};

	const handleEditCause = (id: string) => {
		router.push(`/dashboard/causes/${id}/edit`);
	};

	const handleDeleteCause = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this cause?")) {
			try {
				setIsDeleting(true);
				await deleteCause(id).unwrap();
				toast.success("Cause deleted successfully!");
				refetch();
			} catch (err) {
				console.error("Failed to delete cause:", err);
				toast.error("Failed to delete cause. Please try again.");
			} finally {
				setIsDeleting(false);
			}
		}
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
					Your Causes
				</Typography>
				<Typography variant="subtitle2">Manage all your causes</Typography>
			</Paper>

			{/* Content */}
			<Box sx={{ p: 2 }}>
				{/* Search and Create Bar */}
				<Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "stretch", sm: "center" }}
						spacing={1}
					>
						<TextField
							placeholder="Search causes..."
							value={searchTerm}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setSearchTerm(e.target.value)
							}
							size="small"
							InputProps={{
								startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
							}}
							sx={{ flexGrow: 1 }}
						/>
						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							onClick={() => setCreateCauseDialogOpen(true)}
							size="small"
						>
							Create Cause
						</Button>
					</Stack>
				</Paper>

				{/* Campaign Reminder */}
				{!isLoading &&
					!error &&
					filteredCauses &&
					filteredCauses.length > 0 && (
						<Alert severity="info" sx={{ mb: 3 }}>
							<Typography variant="subtitle2" fontWeight="medium">
								Important: Causes must be added to active campaigns to be
								visible to donors
							</Typography>
							<Typography variant="body2">
								After creating a cause, make sure to add it to an active
								campaign from the cause detail page. Donors can only see causes
								that are part of active campaigns.
							</Typography>
						</Alert>
					)}

				{/* Causes List */}
				{isLoading ? (
					<Box display="flex" justifyContent="center" p={4}>
						<CircularProgress />
					</Box>
				) : error ? (
					<Alert severity="error">Failed to load causes</Alert>
				) : filteredCauses?.length === 0 ? (
					<Alert severity="info">
						No causes found. Create your first cause!
					</Alert>
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
						{filteredCauses?.map((cause: Cause) => {
							const progress = Math.min(
								100,
								Math.round((cause.raisedAmount / cause.targetAmount) * 100)
							);

							const acceptanceType = cause.acceptanceType || "money";
							const primaryDonationType =
								cause.acceptedDonationTypes?.[0] || DonationType.MONEY;
							const DonationIcon = DonationTypeIcons[primaryDonationType];

							return (
								<Box key={cause.id}>
									<Card
										sx={{
											height: "100%",
											display: "flex",
											flexDirection: "column",
											borderRadius: 2,
											boxShadow: 3,
											transition: "transform 0.3s ease, box-shadow 0.3s ease",
											"&:hover": {
												transform: "translateY(-2px)",
												boxShadow: 6,
											},
										}}
									>
										<CardContent sx={{ flexGrow: 1 }}>
											<Box
												display="flex"
												justifyContent="space-between"
												alignItems="flex-start"
												mb={2}
											>
												<Typography
													variant="h6"
													gutterBottom
													sx={{ fontWeight: 600 }}
												>
													{cause.title}
												</Typography>
											</Box>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{
													overflow: "hidden",
													textOverflow: "ellipsis",
													display: "-webkit-box",
													WebkitLineClamp: 3,
													WebkitBoxOrient: "vertical",
													mb: 2,
													lineHeight: 1.4,
												}}
											>
												{cause.description}
											</Typography>

											{/* Donation Type & Progress Section */}
											<Box sx={{ mb: 2 }}>
												<Box
													display="flex"
													justifyContent="space-between"
													alignItems="center"
													mb={1}
												>
													<Box display="flex" alignItems="center" gap={1}>
														<DonationIcon
															sx={{ fontSize: "1.2rem", color: "#2f8077" }}
														/>
														<Typography
															variant="body2"
															color="text.secondary"
															sx={{ fontWeight: 500 }}
														>
															{acceptanceType === "money"
																? "Funding Progress"
																: acceptanceType === "items"
																? "Item Collection"
																: "Mixed Donations"}
														</Typography>
													</Box>
													{acceptanceType !== "items" && (
														<Typography
															variant="body2"
															color="primary.main"
															sx={{ fontWeight: 600 }}
														>
															{progress}%
														</Typography>
													)}
												</Box>

												{acceptanceType !== "items" && (
													<LinearProgress
														variant="determinate"
														value={progress}
														sx={{
															height: 8,
															borderRadius: 4,
															backgroundColor: "grey.200",
															"& .MuiLinearProgress-bar": {
																background:
																	"linear-gradient(to right, #2f8077, #4ade80)",
																borderRadius: 4,
															},
														}}
													/>
												)}
											</Box>

											{/* Target Information Section */}
											<Box sx={{ mb: 2 }}>
												{acceptanceType === "money" ? (
													<>
														<Box
															display="flex"
															justifyContent="space-between"
															alignItems="center"
															mb={0.5}
														>
															<Typography
																variant="body2"
																sx={{ fontWeight: 600, color: "success.main" }}
															>
																${cause.raisedAmount.toLocaleString()}
															</Typography>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																of ${cause.targetAmount.toLocaleString()}
															</Typography>
														</Box>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															{cause.targetAmount - cause.raisedAmount > 0
																? `$${(
																		cause.targetAmount - cause.raisedAmount
																  ).toLocaleString()} remaining`
																: "Target achieved!"}
														</Typography>
													</>
												) : acceptanceType === "items" ? (
													<>
														<Typography
															variant="body2"
															color="text.secondary"
															sx={{ fontWeight: 500, mb: 1 }}
														>
															Needed Items:
														</Typography>
														{cause.donationItems &&
														cause.donationItems.length > 0 ? (
															<Box display="flex" gap={0.5} flexWrap="wrap">
																{cause.donationItems
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
																				borderColor: "primary.main",
																				color: "primary.main",
																			}}
																		/>
																	))}
																{cause.donationItems.length > 3 && (
																	<Chip
																		label={`+${
																			cause.donationItems.length - 3
																		} more`}
																		size="small"
																		variant="outlined"
																		sx={{
																			borderRadius: 1,
																			fontSize: "0.7rem",
																			height: 22,
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
													</>
												) : (
													<>
														<Box
															display="flex"
															justifyContent="space-between"
															alignItems="center"
															mb={0.5}
														>
															<Typography
																variant="body2"
																sx={{ fontWeight: 600, color: "success.main" }}
															>
																${cause.raisedAmount.toLocaleString()}
															</Typography>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																of ${cause.targetAmount.toLocaleString()}
															</Typography>
														</Box>
														<Typography
															variant="caption"
															color="text.secondary"
															sx={{ display: "block", mb: 1 }}
														>
															{cause.targetAmount - cause.raisedAmount > 0
																? `$${(
																		cause.targetAmount - cause.raisedAmount
																  ).toLocaleString()} remaining`
																: "Funding target achieved!"}
														</Typography>
														{cause.donationItems &&
															cause.donationItems.length > 0 && (
																<>
																	<Typography
																		variant="caption"
																		color="text.secondary"
																		sx={{
																			fontWeight: 500,
																			display: "block",
																			mb: 0.5,
																		}}
																	>
																		Also accepting items:
																	</Typography>
																	<Box display="flex" gap={0.5} flexWrap="wrap">
																		{cause.donationItems
																			.slice(0, 2)
																			.map((item, index) => (
																				<Chip
																					key={index}
																					label={item}
																					size="small"
																					variant="outlined"
																					sx={{
																						borderRadius: 1,
																						fontSize: "0.65rem",
																						height: 20,
																					}}
																				/>
																			))}
																		{cause.donationItems.length > 2 && (
																			<Chip
																				label={`+${
																					cause.donationItems.length - 2
																				}`}
																				size="small"
																				variant="outlined"
																				sx={{
																					borderRadius: 1,
																					fontSize: "0.65rem",
																					height: 20,
																				}}
																			/>
																		)}
																	</Box>
																</>
															)}
													</>
												)}
											</Box>

											{/* Tags Section */}
											{cause.tags && cause.tags.length > 0 && (
												<Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
													{cause.tags.map((tag) => (
														<Chip
															key={tag}
															label={tag}
															size="small"
															variant="outlined"
															sx={{
																borderRadius: 1,
																fontSize: "0.75rem",
																height: 24,
															}}
														/>
													))}
												</Box>
											)}
										</CardContent>
										<CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
											<IconButton
												size="small"
												onClick={() => handleEditCause(cause.id)}
												sx={{
													color: "primary.main",
													"&:hover": {
														backgroundColor: "primary.light",
														color: "white",
													},
												}}
											>
												<EditIcon />
											</IconButton>
											<IconButton
												size="small"
												onClick={() => handleDeleteCause(cause.id)}
												disabled={isDeleting}
												sx={{
													color: "error.main",
													"&:hover": {
														backgroundColor: "error.light",
														color: "white",
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
			</Box>

			{/* Create Cause Dialog */}
			<Dialog
				open={createCauseDialogOpen}
				onClose={handleCloseCreateCauseDialog}
			>
				<DialogTitle>Create New Cause</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Creating a cause helps you organize your campaigns by theme or area
						of focus. Would you like to create a new cause now?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseCreateCauseDialog}>Cancel</Button>
					<Button
						onClick={handleConfirmCreateCause}
						color="primary"
						variant="contained"
					>
						Create Cause
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default CausesPage;
