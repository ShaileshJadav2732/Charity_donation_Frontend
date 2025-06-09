"use client";

import {
	useGetActiveCampaignCausesQuery,
	useGetCausesQuery,
} from "@/store/api/causeApi";
import { RootState } from "@/store/store";
import { Cause } from "@/types/cause";
import { DonationType } from "@/types/donation";
import StartConversationButton from "@/components/messaging/StartConversationButton";
import {
	Bloodtype as BloodIcon,
	MenuBook as BooksIcon,
	GridView as AllIcon,
	Inventory as ItemsIcon,
	LocalMall as ClothesIcon,
	Favorite as FavoriteIcon,
	Fastfood as FoodIcon,
	Chair as FurnitureIcon,
	Home as HouseholdIcon,
	MonetizationOn as MoneyIcon,
	MoreHoriz as OtherIcon,
	Search as SearchIcon,
	SwapHoriz as BothIcon,
	Toys as ToysIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	InputAdornment,
	LinearProgress,
	Pagination,
	Skeleton,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

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
	const [page, setPage] = useState(1);
	const limit = 10;

	const {
		data: organizationCausesData,
		isLoading: isLoadingOrgCauses,
		error: orgCausesError,
	} = useGetCausesQuery(
		{
			organizationId: user?.id,
			acceptanceTypes: "both", // Adding the required field
		},
		{ skip: user?.role !== "organization" }
	);

	// For donor users - get causes from active campaigns only
	const {
		data: activeCampaignCausesData,
		isLoading: isLoadingActiveCauses,
		error: activeCausesError,
	} = useGetActiveCampaignCausesQuery({
		page,
		limit,
		search: searchTerm.trim() || undefined,
		acceptanceType:
			donationTypeFilter !== "all" ? donationTypeFilter : undefined,
	});

	// Determine which data to use based on user role
	const causesData =
		user?.role === "organization"
			? organizationCausesData
			: activeCampaignCausesData;
	const isLoading =
		user?.role === "organization" ? isLoadingOrgCauses : isLoadingActiveCauses;
	const error =
		user?.role === "organization" ? orgCausesError : activeCausesError;

	// Server-side filtering is now handled by API
	const causes = causesData?.causes || [];
	const totalCauses = causesData?.total || 0;
	const totalPages = Math.ceil(totalCauses / limit);

	const handleViewCause = (id: string) => {
		router.push(`/dashboard/causes/${id}`);
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

	// Collect all unique tags for filtering
	const allTags = new Set<string>();
	causesData?.causes?.forEach((cause: Cause) => {
		cause.tags?.forEach((tag) => allTags.add(tag));
	});

	return (
		<Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
			<Typography
				variant="h4"
				component="h1"
				sx={{ fontWeight: "bold", mb: 2, color: "#1a1a1a" }}
			>
				Browse Active Causes
			</Typography>
			<Typography
				variant="body1"
				color="text.secondary"
				sx={{ mb: 4, maxWidth: 600 }}
			>
				Discover causes from active campaigns that need your support. Every
				donation makes a difference.
			</Typography>

			{/* Search and Filters */}
			<Box mb={4}>
				<Box display="flex" flexWrap="wrap" gap={3}>
					<Box flexGrow={1} minWidth={{ xs: "100%", md: 400 }}>
						<TextField
							fullWidth
							placeholder="Search causes by title, description, or tags..."
							value={searchTerm}
							onChange={handleSearchChange}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon sx={{ color: "#287068" }} />
										</InputAdornment>
									),
									sx: {
										backgroundColor: "white",
										borderRadius: 3,
									},
								},
							}}
							sx={{
								boxShadow: "0 2px 8px rgba(40, 112, 104, 0.1)",
								"& .MuiInputBase-input": {
									py: 1.5,
								},
								"& .MuiOutlinedInput-root": {
									"& fieldset": {
										borderColor: "#e0e0e0",
										borderWidth: 2,
									},
									"&:hover fieldset": {
										borderColor: "#287068",
									},
									"&.Mui-focused fieldset": {
										borderColor: "#287068",
									},
								},
							}}
						/>
					</Box>
				</Box>

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
						onChange={(_, newValue) => handleDonationTypeFilterChange(newValue)}
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
								<Chip
									label={causesData?.causes?.length || 0}
									size="small"
									sx={{
										backgroundColor:
											donationTypeFilter === "all"
												? "rgba(255,255,255,0.2)"
												: "#f0f9ff",
										color: donationTypeFilter === "all" ? "white" : "#287068",
										fontSize: "0.7rem",
										height: 20,
									}}
								/>
							</Box>
						</ToggleButton>
						<ToggleButton value="money">
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<MoneyIcon sx={{ fontSize: 18 }} />
								<Typography variant="body2" sx={{ fontWeight: 500 }}>
									Money Only
								</Typography>
								<Chip
									label={
										causesData?.causes?.filter(
											(c: Cause) => c.acceptanceType === "money"
										).length || 0
									}
									size="small"
									sx={{
										backgroundColor:
											donationTypeFilter === "money"
												? "rgba(255,255,255,0.2)"
												: "#f0fdf4",
										color: donationTypeFilter === "money" ? "white" : "#16a34a",
										fontSize: "0.7rem",
										height: 20,
									}}
								/>
							</Box>
						</ToggleButton>
						<ToggleButton value="items">
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<ItemsIcon sx={{ fontSize: 18 }} />
								<Typography variant="body2" sx={{ fontWeight: 500 }}>
									Items Only
								</Typography>
								<Chip
									label={
										causesData?.causes?.filter(
											(c: Cause) => c.acceptanceType === "items"
										).length || 0
									}
									size="small"
									sx={{
										backgroundColor:
											donationTypeFilter === "items"
												? "rgba(255,255,255,0.2)"
												: "#fef3c7",
										color: donationTypeFilter === "items" ? "white" : "#d97706",
										fontSize: "0.7rem",
										height: 20,
									}}
								/>
							</Box>
						</ToggleButton>
						<ToggleButton value="both">
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<BothIcon sx={{ fontSize: 18 }} />
								<Typography variant="body2" sx={{ fontWeight: 500 }}>
									Both
								</Typography>
								<Chip
									label={
										causesData?.causes?.filter(
											(c: Cause) => c.acceptanceType === "both"
										).length || 0
									}
									size="small"
									sx={{
										backgroundColor:
											donationTypeFilter === "both"
												? "rgba(255,255,255,0.2)"
												: "#ede9fe",
										color: donationTypeFilter === "both" ? "white" : "#7c3aed",
										fontSize: "0.7rem",
										height: 20,
									}}
								/>
							</Box>
						</ToggleButton>
					</ToggleButtonGroup>
				</Box>
			</Box>

			{/* Causes Grid */}
			{isLoading ? (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
						gap: 3,
					}}
				>
					{[...Array(8)].map((_, index) => (
						<Box key={index}>
							<Skeleton
								variant="rectangular"
								height={200}
								sx={{ borderRadius: 3, mb: 2 }}
							/>
							<Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
							<Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
							<Skeleton
								variant="rectangular"
								height={8}
								sx={{ mb: 2, borderRadius: 1 }}
							/>
							<Skeleton
								variant="rectangular"
								height={40}
								sx={{ borderRadius: 2 }}
							/>
						</Box>
					))}
				</Box>
			) : error ? (
				<Alert
					severity="error"
					sx={{
						borderRadius: 3,
						py: 3,
						backgroundColor: "#fef2f2",
						border: "1px solid #fecaca",
						"& .MuiAlert-icon": {
							color: "#dc2626",
						},
					}}
				>
					Failed to load causes. Please try again later.
				</Alert>
			) : causes?.length === 0 ? (
				<Alert
					severity="info"
					sx={{
						borderRadius: 3,
						py: 3,
						backgroundColor: "#f0f9ff",
						border: "1px solid #bae6fd",
						"& .MuiAlert-icon": {
							color: "#287068",
						},
					}}
				>
					{searchTerm || donationTypeFilter !== "all"
						? "No causes match your search criteria. Try adjusting your filters."
						: "No active causes available at the moment. Check back soon!"}
				</Alert>
			) : (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
						gap: 3,
					}}
				>
					{causes?.map((cause: Cause) => {
						// Ensure we have valid numbers for calculation
						const raisedAmount =
							typeof cause.raisedAmount === "number" ? cause.raisedAmount : 0;
						const targetAmount =
							typeof cause.targetAmount === "number" && cause.targetAmount > 0
								? cause.targetAmount
								: 1;
						const progress =
							targetAmount > 0
								? Math.min(100, Math.round((raisedAmount / targetAmount) * 100))
								: 0;

						const primaryDonationType =
							cause.acceptedDonationTypes?.[0] || DonationType.MONEY;
						const DonationIcon = DonationTypeIcons[primaryDonationType];

						// Determine urgency based on progress
						let urgency = "Low";
						let urgencyColor = "#10b981";
						if (progress < 30) {
							urgency = "High";
							urgencyColor = "#ef4444";
						} else if (progress < 70) {
							urgency = "Medium";
							urgencyColor = "#f59e0b";
						}

						const formatCurrency = (amount: number) => {
							return `₹${amount.toLocaleString()}`;
						};

						return (
							<Card
								key={cause.id}
								sx={{
									height: "100%",
									cursor: "pointer",
									borderRadius: 3,
									transition: "all 0.3s ease",
									boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
									"&:hover": {
										transform: "translateY(-8px)",
										boxShadow: "0 12px 30px rgba(40, 112, 104, 0.2)",
									},
								}}
								onClick={() => handleViewCause(cause.id)}
							>
								{/* Hero Image Section */}
								<Box
									sx={{
										height: 180,
										position: "relative",
										borderTopLeftRadius: 3,
										borderTopRightRadius: 3,
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
												background: `linear-gradient(45deg, ${urgencyColor}20, ${urgencyColor}40)`,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<DonationIcon
												sx={{
													fontSize: 48,
													color: urgencyColor,
												}}
											/>
										</Box>
									)}
									<Chip
										label={`${urgency} Priority`}
										size="small"
										sx={{
											position: "absolute",
											top: 16,
											right: 16,
											backgroundColor: urgencyColor,
											color: "white",
											fontWeight: 600,
											fontSize: "0.75rem",
											zIndex: 2,
										}}
									/>
								</Box>
								<CardContent sx={{ p: 3 }}>
									{/* Organization */}
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mb: 1, fontWeight: 500 }}
									>
										{cause.organizationName || "Organization"}
									</Typography>

									{/* Title */}
									<Typography
										variant="h6"
										sx={{
											fontWeight: 600,
											mb: 2,
											overflow: "hidden",
											textOverflow: "ellipsis",
											display: "-webkit-box",
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
										}}
									>
										{cause.title}
									</Typography>
									{/* Description */}
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{
											mb: 3,
											overflow: "hidden",
											textOverflow: "ellipsis",
											display: "-webkit-box",
											WebkitLineClamp: 3,
											WebkitBoxOrient: "vertical",
											lineHeight: 1.5,
										}}
									>
										{cause.description}
									</Typography>

									{/* Progress Section - show for causes with monetary targets */}
									{cause.acceptanceType !== "items" &&
									cause.targetAmount > 0 ? (
										<Box sx={{ mb: 3 }}>
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
												<Typography variant="body2" sx={{ fontWeight: 600 }}>
													{progress}% funded
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
														backgroundColor: urgencyColor,
													},
													mb: 1,
												}}
											/>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
												}}
											>
												<Box>
													<Typography variant="body2" color="text.secondary">
														Raised
													</Typography>
													<Typography
														variant="h6"
														sx={{ fontWeight: 600, color: "#287068" }}
													>
														{formatCurrency(raisedAmount)}
													</Typography>
												</Box>
												<Box sx={{ textAlign: "right" }}>
													<Typography variant="body2" color="text.secondary">
														Goal
													</Typography>
													<Typography variant="h6" sx={{ fontWeight: 600 }}>
														{formatCurrency(cause.targetAmount || 0)}
													</Typography>
												</Box>
											</Box>
										</Box>
									) : null}

									{/* Items Section - show for items and both types */}
									{cause.acceptanceType !== "money" ? (
										<Box sx={{ mb: 3 }}>
											{cause.acceptanceType === "items" ? (
												<Alert severity="info" sx={{ py: 1, mb: 2 }}>
													<Typography variant="body2">
														<strong>Items-only cause</strong> - This cause
														accepts item donations only
													</Typography>
												</Alert>
											) : (
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{ fontWeight: 500, mb: 1 }}
												>
													Needed Items:
												</Typography>
											)}
											{cause.donationItems && cause.donationItems.length > 0 ? (
												<Box display="flex" gap={1} flexWrap="wrap">
													{cause.donationItems
														.slice(0, 3)
														.map((item, index) => (
															<Chip
																key={index}
																label={item}
																size="small"
																variant="outlined"
																sx={{
																	borderRadius: 2,
																	fontSize: "0.75rem",
																	height: 28,
																	borderColor: urgencyColor,
																	color: urgencyColor,
																	fontWeight: 500,
																}}
															/>
														))}
													{cause.donationItems.length > 3 && (
														<Chip
															label={`+${cause.donationItems.length - 3} more`}
															size="small"
															variant="outlined"
															sx={{
																borderRadius: 2,
																fontSize: "0.75rem",
																height: 28,
																borderColor: "#6c757d",
																color: "#6c757d",
															}}
														/>
													)}
												</Box>
											) : (
												<Typography variant="caption" color="text.secondary">
													Accepting various item donations
												</Typography>
											)}
										</Box>
									) : null}

									{/* Tags */}
									{cause.tags && cause.tags.length > 0 && (
										<Box sx={{ mb: 3 }}>
											<Box display="flex" gap={1} flexWrap="wrap">
												{cause.tags.slice(0, 3).map((tag) => (
													<Chip
														key={tag}
														label={tag}
														size="small"
														sx={{
															borderRadius: 2,
															backgroundColor: "#f8f9fa",
															color: "#287068",
															fontSize: "0.75rem",
															height: 28,
															fontWeight: 500,
														}}
													/>
												))}
												{cause.tags.length > 3 && (
													<Chip
														label={`+${cause.tags.length - 3} more`}
														size="small"
														sx={{
															borderRadius: 2,
															backgroundColor: "#e9ecef",
															color: "#6c757d",
															fontSize: "0.75rem",
															height: 28,
														}}
													/>
												)}
											</Box>
										</Box>
									)}

									{/* Action Buttons */}
									<Box sx={{ display: "flex", gap: 1, mt: 2 }}>
										{/* Message Button */}
										<StartConversationButton
											recipientId={
												cause.organizationUserId ||
												(typeof cause.organizationId === "object" &&
												cause.organizationId &&
												"_id" in cause.organizationId
													? (cause.organizationId as { _id: string })._id
													: (cause.organizationId as string))
											}
											recipientType="user"
											recipientName={cause.organizationName || "Organization"}
											recipientRole="organization"
											relatedCause={cause.id}
											variant="icon"
											size="medium"
										/>

										{/* Donate Button */}
										<Button
											variant="contained"
											fullWidth
											startIcon={<FavoriteIcon />}
											onClick={(e) => {
												e.stopPropagation();
												router.push(`/dashboard/donate/${cause.id}`);
											}}
											sx={{
												backgroundColor: "#287068",
												borderRadius: 2,
												textTransform: "none",
												fontWeight: 600,
												py: 1.5,
												fontSize: "0.875rem",
												transition: "all 0.3s ease",
												"&:hover": {
													backgroundColor: "#1f5a52",
													transform: "translateY(-2px)",
													boxShadow: "0 4px 12px rgba(40, 112, 104, 0.3)",
												},
											}}
										>
											Donate Now
										</Button>
									</Box>
								</CardContent>
							</Card>
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
	);
};

export default CausesPage;
