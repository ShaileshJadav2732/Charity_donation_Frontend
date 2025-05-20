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
	Category as CategoryIcon,
	LocalMall as ClothesIcon,
	Favorite as FavoriteIcon,
	FilterList as FilterIcon,
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
	CardActions,
	CardContent,
	CardMedia,
	Chip,
	Collapse,
	FormControl,
	InputAdornment,
	InputLabel,
	LinearProgress,
	MenuItem,
	Select,
	SelectChangeEvent,
	Skeleton,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const DonationTypeIcons: Record<DonationType, React.ComponentType> = {
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
	const theme = useTheme();
	const { user } = useSelector((state: RootState) => state.auth);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTag, setSelectedTag] = useState<string>("");
	const [showFilters, setShowFilters] = useState(false);
	const [selectedDonationType, setSelectedDonationType] = useState<
		DonationType | "all"
	>("all");
	const [page, setPage] = useState(1);

	// Query parameters for filters
	const filterParams = {
		page,
		search: searchTerm,
		donationType:
			selectedDonationType !== "all" ? selectedDonationType : undefined,
		tags: selectedTag ? [selectedTag] : undefined,
	};

	// For organization users - get their own causes
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
	} = useGetActiveCampaignCausesQuery(filterParams, {
		skip: user?.role !== "donor",
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

	const handleViewCause = (id: string) => {
		router.push(`/dashboard/causes/${id}`);
	};

	const handleDonationTypeChange = (e: SelectChangeEvent) => {
		setSelectedDonationType(e.target.value as DonationType | "all");
		setPage(1);
	};

	const handleTagSelect = (tag: string) => {
		setSelectedTag(tag === selectedTag ? "" : tag);
		setPage(1);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
	};

	// Collect all unique tags for filtering
	const allTags = new Set<string>();
	causesData?.causes?.forEach((cause: Cause) => {
		cause.tags?.forEach((tag) => allTags.add(tag));
	});

	return (
		<Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default" }}>
			<Typography
				variant="h4"
				component="h1"
				sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}
			>
				Browse Active Causes
			</Typography>
			<Typography
				variant="body1"
				color="text.secondary"
				sx={{ mb: 3, maxWidth: 600 }}
			>
				Discover causes from active campaigns that need your support.
			</Typography>

			{/* Search and Filters */}
			<Box mb={3}>
				<Box display="flex" flexWrap="wrap" gap={2}>
					<Box flexGrow={1} minWidth={{ xs: "100%", md: 350 }}>
						<form onSubmit={handleSearch}>
							<TextField
								fullWidth
								placeholder="Search causes..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon color="action" />
										</InputAdornment>
									),
									sx: {
										bgcolor: "background.paper",
										borderRadius: 2,
										"& .MuiOutlinedInput-root": {
											"& fieldset": { borderColor: theme.palette.divider },
											"&:hover fieldset": {
												borderColor: theme.palette.primary.main,
											},
											"&.Mui-focused fieldset": {
												borderColor: theme.palette.primary.main,
											},
										},
									},
								}}
								sx={{ boxShadow: theme.shadows[1] }}
							/>
						</form>
					</Box>
					<Box width={{ xs: "100%", md: 180 }}>
						<Button
							fullWidth
							variant="outlined"
							startIcon={<FilterIcon />}
							onClick={() => setShowFilters(!showFilters)}
							sx={{
								borderRadius: 2,
								textTransform: "none",
								fontWeight: 500,
								py: 1,
								transition: "all 0.3s ease",
								"&:hover": {
									bgcolor: theme.palette.primary.light,
									color: "white",
								},
							}}
						>
							{showFilters ? "Hide Filters" : "Show Filters"}
						</Button>
					</Box>
				</Box>

				<Collapse in={showFilters}>
					<Box
						mt={2}
						p={2}
						sx={{
							bgcolor: "background.paper",
							borderRadius: 2,
							boxShadow: theme.shadows[2],
							transition: "all 0.3s ease",
						}}
					>
						<Box display="flex" flexWrap="wrap" gap={2}>
							<Box width={{ xs: "100%", md: 250 }}>
								<FormControl fullWidth>
									<InputLabel sx={{ fontWeight: 500 }}>
										Donation Type
									</InputLabel>
									<Select
										value={selectedDonationType}
										onChange={handleDonationTypeChange}
										label="Donation Type"
										sx={{
											bgcolor: "background.paper",
											borderRadius: 1,
											"& .MuiSelect-select": { py: 1 },
										}}
									>
										<MenuItem value="all">All Types</MenuItem>
										{Object.values(DonationType).map((type) => {
											const Icon = DonationTypeIcons[type];
											return (
												<MenuItem key={type} value={type}>
													<Box display="flex" alignItems="center">
														<Icon
															sx={{
																mr: 1,
																color: theme.palette.primary.main,
																fontSize: "1.2rem",
															}}
														/>
														{type.charAt(0) +
															type.slice(1).toLowerCase().replace("_", " ")}
													</Box>
												</MenuItem>
											);
										})}
									</Select>
								</FormControl>
							</Box>

							{allTags.size > 0 && (
								<Box width="100%">
									<Typography
										variant="subtitle2"
										sx={{
											fontWeight: 600,
											mb: 1,
											color: theme.palette.text.primary,
										}}
									>
										Categories
									</Typography>
									<Box display="flex" flexWrap="wrap" gap={0.75}>
										{Array.from(allTags).map((tag) => (
											<Chip
												key={tag}
												label={tag}
												clickable
												onClick={() => handleTagSelect(tag)}
												color={selectedTag === tag ? "primary" : "default"}
												icon={<CategoryIcon sx={{ fontSize: "1rem" }} />}
												sx={{
													borderRadius: 1,
													fontSize: "0.75rem",
													height: 28,
													transition: "all 0.2s ease",
													"&:hover": {
														bgcolor: theme.palette.primary.light,
														color: "white",
													},
												}}
											/>
										))}
									</Box>
								</Box>
							)}
						</Box>
					</Box>
				</Collapse>
			</Box>

			{/* Causes List */}
			{isLoading ? (
				<Box display="flex" flexWrap="wrap" gap={2}>
					{[...Array(8)].map((_, index) => (
						<Box
							key={index}
							sx={{
								width: {
									xs: "100%",
									sm: "calc(50% - 8px)",
									md: "calc(25% - 12px)",
								},
								minWidth: { xs: 240, sm: 260 },
								maxWidth: { xs: 360, sm: "none" },
								flexGrow: 0,
								flexShrink: 0,
							}}
						>
							<Skeleton
								variant="rectangular"
								height={120}
								sx={{ borderRadius: 2 }}
							/>
							<Skeleton variant="text" width="80%" sx={{ mt: 1.5 }} />
							<Skeleton variant="text" width="60%" />
							<Skeleton
								variant="rectangular"
								height={16}
								sx={{ mt: 1.5, borderRadius: 1 }}
							/>
							<Skeleton variant="text" width="40%" sx={{ mt: 1.5 }} />
						</Box>
					))}
				</Box>
			) : error ? (
				<Alert severity="error" sx={{ borderRadius: 2, py: 2 }}>
					Failed to load causes
				</Alert>
			) : causesData?.causes.length === 0 ? (
				<Alert severity="info" sx={{ borderRadius: 2, py: 2 }}>
					{searchTerm || selectedDonationType !== "all" || selectedTag
						? "No causes match your search criteria. Try adjusting your filters."
						: "No active causes available at the moment."}
				</Alert>
			) : (
				<Box display="flex" flexWrap="wrap" gap={2}>
					{causesData?.causes.map((cause: Cause) => {
						const progress = Math.min(
							100,
							Math.round((cause.raisedAmount / cause.targetAmount) * 100)
						);
						const primaryDonationType =
							cause.acceptedDonationTypes?.[0] || DonationType.MONEY;
						const DonationIcon = DonationTypeIcons[primaryDonationType];

						return (
							<Card
								key={cause.id}
								sx={{
									width: {
										xs: "100%",
										sm: "calc(50% - 8px)",
										md: "calc(25% - 12px)",
									},
									minWidth: { xs: 240, sm: 260 },
									maxWidth: { xs: 360, sm: "none" },
									minHeight: 320,
									display: "flex",
									flexDirection: "column",
									borderRadius: 2,
									boxShadow: theme.shadows[3],
									transition: "transform 0.3s ease, box-shadow 0.3s ease",
									"&:hover": {
										transform: "translateY(-4px)",
										boxShadow: theme.shadows[8],
									},
								}}
								onClick={() => handleViewCause(cause.id)}
							>
								<CardMedia
									component="img"
									height="120"
									image={
										cause.imageUrl || "https://placehold.co/600x400?text=Cause"
									}
									alt={cause.title}
									sx={{
										objectFit: "cover",
										borderTopLeftRadius: 2,
										borderTopRightRadius: 2,
									}}
								/>
								<CardContent
									sx={{
										flexGrow: 1,
										p: 1.5,
										display: "flex",
										flexDirection: "column",
									}}
								>
									<Box display="flex" alignItems="center" mb={1}>
										<DonationIcon
											sx={{
												mr: 1,
												color: theme.palette.primary.main,
												fontSize: "1.2rem",
											}}
										/>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{cause.organizationName || "Organization"}
										</Typography>
									</Box>
									<Typography
										variant="h6"
										component="div"
										sx={{
											fontWeight: 600,
											fontSize: "0.9rem",
											mb: 1,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{cause.title}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{
											fontSize: "0.8rem",
											mb: 1.5,
											overflow: "hidden",
											textOverflow: "ellipsis",
											display: "-webkit-box",
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
											flexGrow: 1,
										}}
									>
										{cause.description}
									</Typography>

									<Box sx={{ width: "100%", mb: 1 }}>
										<LinearProgress
											variant="determinate"
											value={progress}
											sx={{
												height: 6,
												borderRadius: 4,
												backgroundColor: theme.palette.grey[200],
												"& .MuiLinearProgress-bar": {
													background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
												},
											}}
										/>
									</Box>
									<Box
										display="flex"
										justifyContent="space-between"
										alignItems="center"
									>
										<Typography
											variant="body2"
											sx={{ fontWeight: 500, fontSize: "0.8rem" }}
										>
											${cause.raisedAmount.toLocaleString()}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ fontSize: "0.8rem" }}
										>
											of ${cause.targetAmount.toLocaleString()} ({progress}%)
										</Typography>
									</Box>

									{cause.tags && cause.tags.length > 0 && (
										<Box display="flex" gap={0.75} mt={1.5} flexWrap="wrap">
											{cause.tags.slice(0, 3).map((tag) => (
												<Chip
													key={tag}
													label={tag}
													size="small"
													variant="outlined"
													sx={{
														borderRadius: 1,
														borderColor: theme.palette.divider,
														bgcolor: theme.palette.background.paper,
														fontSize: "0.75rem",
														height: 24,
													}}
												/>
											))}
											{cause.tags.length > 3 && (
												<Chip
													label={`+${cause.tags.length - 3}`}
													size="small"
													variant="outlined"
													sx={{
														borderRadius: 1,
														borderColor: theme.palette.divider,
														fontSize: "0.75rem",
														height: 24,
													}}
												/>
											)}
										</Box>
									)}
								</CardContent>
								<CardActions sx={{ p: 1.5, pt: 0 }}>
									<Button
										size="small"
										color="primary"
										variant="contained"
										startIcon={<FavoriteIcon sx={{ fontSize: "1.2rem" }} />}
										onClick={(e) => {
											e.stopPropagation();
											router.push(`/dashboard/donate/${cause.id}`);
										}}
										sx={{
											borderRadius: 2,
											textTransform: "none",
											fontWeight: 500,
											px: 2,
											py: 0.75,
											fontSize: "0.8rem",
											transition: "all 0.3s ease",
											"&:hover": {
												bgcolor: theme.palette.primary.dark,
												transform: "scale(1.05)",
											},
										}}
									>
										Donate Now
									</Button>
								</CardActions>
							</Card>
						);
					})}
				</Box>
			)}

			{/* Pagination */}
			{causesData && causesData.totalPages > 1 && (
				<Box display="flex" justifyContent="center" mt={3} gap={2}>
					<Button
						disabled={page === 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						variant="outlined"
						sx={{
							borderRadius: 2,
							textTransform: "none",
							fontWeight: 500,
							px: 2,
							py: 0.75,
							fontSize: "0.8rem",
							transition: "all 0.3s ease",
							"&:hover": {
								bgcolor: theme.palette.primary.light,
								color: "white",
							},
						}}
					>
						Previous
					</Button>
					<Typography
						variant="body2"
						sx={{ alignSelf: "center", fontSize: "0.8rem" }}
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
							borderRadius: 2,
							textTransform: "none",
							fontWeight: 500,
							px: 2,
							py: 0.75,
							fontSize: "0.8rem",
							transition: "all 0.3s ease",
							"&:hover": {
								bgcolor: theme.palette.primary.light,
								color: "white",
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
