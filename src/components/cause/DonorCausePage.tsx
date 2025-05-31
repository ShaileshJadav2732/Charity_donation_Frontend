"use client";

import {
	useGetActiveCampaignCausesQuery,
	useGetCausesQuery,
} from "@/store/api/causeApi";
import { RootState } from "@/store/store";
import { Cause } from "@/types/cause";
import { DonationType } from "@/types/donation";
import {
	Bloodtype as BloodIcon,
	MenuBook as BooksIcon,
	LocalMall as ClothesIcon,
	Favorite as FavoriteIcon,
	Fastfood as FoodIcon,
	Chair as FurnitureIcon,
	Home as HouseholdIcon,
	MonetizationOn as MoneyIcon,
	MoreHoriz as OtherIcon,
	Search as SearchIcon,
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
	Skeleton,
	TextField,
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

	const [page, setPage] = useState(1);

	const {
		data: organizationCausesData,
		isLoading: isLoadingOrgCauses,
		error: orgCausesError,
	} = useGetCausesQuery(
		{ organizationId: user?.id },
		{ skip: user?.role !== "organization" }
	);

	// For donor users - get causes from active campaigns only
	const {
		data: activeCampaignCausesData,
		isLoading: isLoadingActiveCauses,
		error: activeCausesError,
	} = useGetActiveCampaignCausesQuery({});

	// Determine which data to use based on user role
	const causesData =
		user?.role === "organization"
			? organizationCausesData
			: activeCampaignCausesData;
	const isLoading =
		user?.role === "organization" ? isLoadingOrgCauses : isLoadingActiveCauses;
	const error =
		user?.role === "organization" ? orgCausesError : activeCausesError;

	// Client-side filtering for search (similar to organization page)
	const filteredCauses = causesData?.causes?.filter(
		(cause: Cause) =>
			cause.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cause.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cause.tags?.some((tag) =>
				tag?.toLowerCase().includes(searchTerm.toLowerCase())
			)
	);

	const handleViewCause = (id: string) => {
		router.push(`/dashboard/causes/${id}`);
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
							onChange={(e) => setSearchTerm(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: "#287068" }} />
									</InputAdornment>
								),
								sx: {
									backgroundColor: "white",
									borderRadius: 3,
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
			) : filteredCauses?.length === 0 ? (
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
					{searchTerm
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
					{filteredCauses?.map((cause: Cause) => {
						const raisedAmount = cause.raisedAmount || 0;
						const targetAmount = cause.targetAmount || 1; // Prevent division by zero
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

									{/* Progress Section */}
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
												{formatCurrency(raisedAmount)} /{" "}
												{formatCurrency(cause.targetAmount || 0)}
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
											}}
										/>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ mt: 0.5, display: "block" }}
										>
											{progress}% funded
										</Typography>
									</Box>

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
								</CardContent>
							</Card>
						);
					})}
				</Box>
			)}

			{/* Pagination - Update to use filteredCauses */}
			{causesData && causesData.totalPages > 1 && !searchTerm && (
				<Box display="flex" justifyContent="center" mt={5} gap={3}>
					<Button
						disabled={page === 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						variant="outlined"
						sx={{
							borderRadius: 3,
							textTransform: "none",
							fontWeight: 600,
							px: 3,
							py: 1.5,
							borderColor: "#287068",
							color: "#287068",
							borderWidth: 2,
							transition: "all 0.3s ease",
							"&:hover": {
								backgroundColor: "#287068",
								color: "white",
								borderColor: "#287068",
							},
							"&:disabled": {
								borderColor: "#e0e0e0",
								color: "#9e9e9e",
							},
						}}
					>
						Previous
					</Button>
					<Typography
						variant="body1"
						sx={{
							alignSelf: "center",
							fontWeight: 500,
							color: "#287068",
							px: 2,
						}}
					>
						Page {page} of {causesData.totalPages}
					</Typography>
					<Button
						disabled={page === causesData.totalPages}
						onClick={() =>
							setPage((p) => Math.min(causesData.totalPages, p + 1))
						}
						variant="outlined"
						sx={{
							borderRadius: 3,
							textTransform: "none",
							fontWeight: 600,
							px: 3,
							py: 1.5,
							borderColor: "#287068",
							color: "#287068",
							borderWidth: 2,
							transition: "all 0.3s ease",
							"&:hover": {
								backgroundColor: "#287068",
								color: "white",
								borderColor: "#287068",
							},
							"&:disabled": {
								borderColor: "#e0e0e0",
								color: "#9e9e9e",
							},
						}}
					>
						Next
					</Button>
				</Box>
			)}
		</Box>
	);
};

export default CausesPage;
