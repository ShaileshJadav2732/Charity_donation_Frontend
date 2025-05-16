"use client";

import {
	useDeleteCauseMutation,
	useGetCausesQuery,
	useGetActiveCampaignCausesQuery,
} from "@/store/api/causeApi";
import { RootState } from "@/store/store";
import { Cause } from "@/types/cause";
import { DonationType } from "@/types/donation";
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
	FormControl,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	LinearProgress,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
	Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
	Add as AddIcon,
	Search as SearchIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	FilterList as FilterIcon,
	Category as CategoryIcon,
	MonetizationOn as MoneyIcon,
	LocalMall as ClothesIcon,
	Bloodtype as BloodIcon,
	Fastfood as FoodIcon,
	Toys as ToysIcon,
	MenuBook as BooksIcon,
	Chair as FurnitureIcon,
	Home as HouseholdIcon,
	MoreHoriz as OtherIcon,
	Favorite as FavoriteIcon,
} from "@mui/icons-material";

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

	const [deleteCause, { isLoading: isDeleting }] = useDeleteCauseMutation();

	// Only for organizations
	const handleCreateCause = () => {
		router.push("/dashboard/causes/create");
	};

	const handleEditCause = (id: string) => {
		router.push(`/dashboard/causes/${id}/edit`);
	};

	const handleDeleteCause = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this cause?")) {
			try {
				await deleteCause(id).unwrap();
			} catch (err) {
				console.error("Failed to delete cause:", err);
			}
		}
	};

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

	// Filter causes (only used for organization view to filter locally)
	const filteredCauses =
		user?.role === "organization"
			? causesData?.causes?.filter((cause: Cause) =>
					cause.title.toLowerCase().includes(searchTerm.toLowerCase())
			  )
			: causesData?.causes;

	// Organization View
	if (user?.role === "organization") {
		return (
			<Box p={4}>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					mb={4}
				>
					<Typography variant="h4">Manage Causes</Typography>
					<Button
						variant="contained"
						color="primary"
						startIcon={<AddIcon />}
						onClick={handleCreateCause}
					>
						Create Cause
					</Button>
				</Box>

				<Box display="flex" gap={2} mb={4}>
					<TextField
						placeholder="Search causes..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						size="small"
						InputProps={{
							startAdornment: <SearchIcon color="action" />,
						}}
						sx={{ flexGrow: 1 }}
					/>
				</Box>

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
					<Grid container spacing={3}>
						{filteredCauses?.map((cause: Cause) => (
							<Grid item xs={12} sm={6} md={4} key={cause.id}>
								<Card>
									<CardContent>
										<Box
											display="flex"
											justifyContent="space-between"
											alignItems="flex-start"
											mb={2}
										>
											<Typography variant="h6" gutterBottom>
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
											}}
										>
											{cause.description}
										</Typography>
										<Box display="flex" justifyContent="space-between" mb={1}>
											<Typography variant="body2" color="text.secondary">
												Target:
											</Typography>
											<Typography variant="body2" fontWeight="bold">
												${cause.targetAmount.toLocaleString()}
											</Typography>
										</Box>
										<Box display="flex" justifyContent="space-between">
											<Typography variant="body2" color="text.secondary">
												Raised:
											</Typography>
											<Typography
												variant="body2"
												fontWeight="bold"
												color="success.main"
											>
												${cause.raisedAmount.toLocaleString()}
											</Typography>
										</Box>
										{cause.tags && cause.tags.length > 0 && (
											<Box display="flex" gap={0.5} mt={2} flexWrap="wrap">
												{cause.tags.map((tag) => (
													<Chip
														key={tag}
														label={tag}
														size="small"
														variant="outlined"
													/>
												))}
											</Box>
										)}
									</CardContent>
									<CardActions sx={{ justifyContent: "flex-end" }}>
										<IconButton
											size="small"
											onClick={() => handleEditCause(cause.id)}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											onClick={() => handleDeleteCause(cause.id)}
											disabled={isDeleting}
										>
											<DeleteIcon />
										</IconButton>
									</CardActions>
								</Card>
							</Grid>
						))}
					</Grid>
				)}
			</Box>
		);
	}

	// Donor View - Shows only causes from active campaigns
	return (
		<Box p={4}>
			<Typography variant="h4" gutterBottom>
				Browse Active Causes
			</Typography>
			<Typography variant="body1" color="text.secondary" paragraph>
				Discover causes from active campaigns that need your support.
			</Typography>

			{/* Search and Filters */}
			<Box mb={4}>
				<Grid container spacing={2}>
					<Grid item xs={12} md={8}>
						<form onSubmit={handleSearch}>
							<TextField
								fullWidth
								placeholder="Search causes..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon />
										</InputAdornment>
									),
								}}
							/>
						</form>
					</Grid>
					<Grid item xs={12} md={4}>
						<Button
							fullWidth
							variant="outlined"
							startIcon={<FilterIcon />}
							onClick={() => setShowFilters(!showFilters)}
						>
							Filters
						</Button>
					</Grid>
				</Grid>

				{showFilters && (
					<Box mt={2} p={2} bgcolor="background.paper" borderRadius={1}>
						<Grid container spacing={2}>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth>
									<InputLabel>Donation Type</InputLabel>
									<Select
										value={selectedDonationType}
										onChange={handleDonationTypeChange}
										label="Donation Type"
									>
										<MenuItem value="all">All Types</MenuItem>
										{Object.values(DonationType).map((type) => {
											const Icon = DonationTypeIcons[type];
											return (
												<MenuItem key={type} value={type}>
													<Box display="flex" alignItems="center">
														<Icon style={{ marginRight: 8 }} />
														{type.charAt(0) +
															type.slice(1).toLowerCase().replace("_", " ")}
													</Box>
												</MenuItem>
											);
										})}
									</Select>
								</FormControl>
							</Grid>

							{allTags.size > 0 && (
								<Grid item xs={12}>
									<Typography variant="subtitle2" gutterBottom>
										Categories
									</Typography>
									<Box display="flex" flexWrap="wrap" gap={1}>
										{Array.from(allTags).map((tag) => (
											<Chip
												key={tag}
												label={tag}
												clickable
												onClick={() => handleTagSelect(tag)}
												color={selectedTag === tag ? "primary" : "default"}
												icon={<CategoryIcon />}
											/>
										))}
									</Box>
								</Grid>
							)}
						</Grid>
					</Box>
				)}
			</Box>

			{/* Causes Grid */}
			{isLoading ? (
				<Box display="flex" justifyContent="center" p={4}>
					<CircularProgress />
				</Box>
			) : error ? (
				<Alert severity="error">Failed to load causes</Alert>
			) : causesData?.causes.length === 0 ? (
				<Alert severity="info">
					{searchTerm || selectedDonationType !== "all" || selectedTag
						? "No causes match your search criteria. Try adjusting your filters."
						: "No active causes available at the moment."}
				</Alert>
			) : (
				<Grid container spacing={3}>
					{causesData?.causes.map((cause: Cause) => {
						// Calculate progress
						const progress = Math.min(
							100,
							Math.round((cause.raisedAmount / cause.targetAmount) * 100)
						);

						// Get primary donation type if available
						const primaryDonationType =
							cause.acceptedDonationTypes?.[0] || DonationType.MONEY;
						const DonationIcon = DonationTypeIcons[primaryDonationType];

						return (
							<Grid item xs={12} sm={6} md={4} key={cause.id}>
								<Card
									sx={{
										height: "100%",
										display: "flex",
										flexDirection: "column",
										cursor: "pointer",
										"&:hover": {
											boxShadow: 6,
										},
									}}
									onClick={() => handleViewCause(cause.id)}
								>
									<CardMedia
										component="img"
										height="140"
										image={
											cause.imageUrl ||
											"https://placehold.co/600x400?text=Cause"
										}
										alt={cause.title}
									/>
									<CardContent sx={{ flexGrow: 1 }}>
										<Box display="flex" alignItems="center" mb={1}>
											<DonationIcon
												style={{ marginRight: 8, color: "#009688" }}
											/>
											<Typography variant="caption" color="text.secondary">
												{cause.organizationName || "Organization"}
											</Typography>
										</Box>
										<Typography variant="h6" gutterBottom component="div">
											{cause.title}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{
												mb: 2,
												overflow: "hidden",
												textOverflow: "ellipsis",
												display: "-webkit-box",
												WebkitLineClamp: 2,
												WebkitBoxOrient: "vertical",
											}}
										>
											{cause.description}
										</Typography>

										{/* Progress bar */}
										<Box sx={{ width: "100%", mb: 1 }}>
											<LinearProgress
												variant="determinate"
												value={progress}
												color="primary"
											/>
										</Box>
										<Box display="flex" justifyContent="space-between">
											<Typography variant="body2">
												${cause.raisedAmount.toLocaleString()}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												of ${cause.targetAmount.toLocaleString()} ({progress}%)
											</Typography>
										</Box>

										{cause.tags && cause.tags.length > 0 && (
											<Box display="flex" gap={0.5} mt={2} flexWrap="wrap">
												{cause.tags.slice(0, 3).map((tag) => (
													<Chip
														key={tag}
														label={tag}
														size="small"
														variant="outlined"
													/>
												))}
												{cause.tags.length > 3 && (
													<Chip
														label={`+${cause.tags.length - 3}`}
														size="small"
														variant="outlined"
													/>
												)}
											</Box>
										)}
									</CardContent>
									<CardActions>
										<Button
											size="small"
											color="primary"
											startIcon={<FavoriteIcon />}
											onClick={(e) => {
												e.stopPropagation();
												router.push(`/dashboard/donate/${cause.id}`);
											}}
										>
											Donate Now
										</Button>
									</CardActions>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			)}

			{/* Pagination */}
			{causesData && causesData.totalPages > 1 && (
				<Box display="flex" justifyContent="center" mt={4}>
					<Button
						disabled={page === 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						variant="outlined"
						sx={{ mx: 1 }}
					>
						Previous
					</Button>
					<Button
						disabled={page === causesData.totalPages}
						onClick={() =>
							setPage((p) => Math.min(causesData.totalPages, p + 1))
						}
						variant="outlined"
						sx={{ mx: 1 }}
					>
						Next
					</Button>
				</Box>
			)}
		</Box>
	);
};

export default CausesPage;
