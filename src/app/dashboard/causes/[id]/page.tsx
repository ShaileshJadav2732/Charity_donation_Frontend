"use client";

import AddCauseToCampaignButton from "@/components/cause/AddCauseToCampaignButton";
import { useGetCauseByIdQuery } from "@/store/api/causeApi";
import { useGetOrganizationByCauseIdQuery } from "@/store/api/organizationApi";
import { RootState } from "@/store/store";
import { DonationType } from "@/types/donation";
import { LocalMall as ClothesIcon } from "@mui/icons-material";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
	ArrowBack as ArrowBackIcon,
	Bloodtype as BloodIcon,
	MenuBook as BooksIcon,
	Business as BusinessIcon,
	CalendarToday as CalendarIcon,
	Category as CategoryIcon,
	Email as EmailIcon,
	Fastfood as FoodIcon,
	Living as FurnitureIcon,
	FavoriteOutlined as HeartIcon,
	Living as HouseholdIcon,
	LocationOn as LocationIcon,
	MonetizationOn as MoneyIcon,
	People as PeopleIcon,
	Phone as PhoneIcon,
	Public as PublicIcon,
	ChildCare as ToysIcon,
} from "@mui/icons-material";
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	LinearProgress,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";

// Extended DonationType to include missing types
enum ExtendedDonationType {
	MONEY = "MONEY",
	BLOOD = "BLOOD",
	FOOD = "FOOD",
	TOYS = "TOYS",
	BOOKS = "BOOKS",
	FURNITURE = "FURNITURE",
	HOUSEHOLD = "HOUSEHOLD",
	IN_KIND = "IN_KIND",
	VOLUNTEER = "VOLUNTEER",
}

const donationTypeIcons = {
	[DonationType.MONEY]: MoneyIcon,
	[DonationType.BLOOD]: BloodIcon,
	[DonationType.FOOD]: FoodIcon,
	[DonationType.TOYS]: ToysIcon,
	[DonationType.BOOKS]: BooksIcon,
	[DonationType.FURNITURE]: FurnitureIcon,
	[DonationType.HOUSEHOLD]: HouseholdIcon,
	[ExtendedDonationType.IN_KIND]: MoneyIcon,
	[ExtendedDonationType.VOLUNTEER]: PeopleIcon,
	CLOTHES: ClothesIcon,
	OTHER: CategoryIcon,
};

export default function CauseDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const { id } = params;
	const router = useRouter();

	const [activeTab, setActiveTab] = useState("about");
	const { user } = useSelector((state: RootState) => state.auth);

	const { data, isLoading, error } = useGetCauseByIdQuery(id);
	const {
		data: organizationData,
		isLoading: orgLoading,
		error: orgError,
	} = useGetOrganizationByCauseIdQuery(id, { skip: !id });

	console.log("Cause data:", JSON.stringify(data, null, 2));
	console.log("Organization data:", JSON.stringify(organizationData, null, 2));
	console.log("Organization error:", orgError);
	console.log("Cause error:", error);

	const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
		setActiveTab(newValue);
	};

	const handleDonate = () => {
		router.push(`/dashboard/donate/${id}`);
	};

	const handleBack = () => {
		router.push("/dashboard/causes");
	};

	const handleViewOrganization = () => {
		if (data?.cause.organizationId) {
			router.push(`/dashboard/organizations/${data.cause.organizationId}`);
		}
	};

	// Get organization details
	const organization = organizationData?.organization;

	// Debug the data structures
	useEffect(() => {
		if (data) {
			console.log("Cause data structure:", data);
		}
		if (organizationData) {
			console.log("Organization data structure:", organizationData);
		}
	}, [data, organizationData]);

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" p={8}>
				<CircularProgress />
			</Box>
		);
	}

	if (error || !data) {
		// Get more detailed error information
		let errorMessage = "Unable to load cause details. Please try again later.";
		let isAuthError = false;

		if (error) {
			// Check if it's a FetchBaseQueryError
			if ("status" in error) {
				const fetchError = error as FetchBaseQueryError;
				if (fetchError.status === 404) {
					errorMessage = "This cause doesn't exist or has been removed.";
				} else if (fetchError.status === 403) {
					errorMessage = "You don't have permission to view this cause.";
				} else if (fetchError.status === 401) {
					errorMessage = "Please log in to view this cause.";
					isAuthError = true;
				} else {
					errorMessage =
						"There was an error loading this cause. Please try again later.";
				}
			}
		}

		console.error("Error loading cause:", error);

		return (
			<Box p={4}>
				<Alert severity="error" sx={{ mb: 2 }}>
					{errorMessage}
				</Alert>
				{!isAuthError && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						If you believe this is an error, please try refreshing the page or
						contact support.
					</Typography>
				)}
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={handleBack}
					sx={{ mt: 2 }}
				>
					Back to causes
				</Button>
			</Box>
		);
	}
	console.log(data?.cause.targetAmount);
	const progress =
		data?.cause.raisedAmount && data.cause.targetAmount
			? Math.min(
					100,
					Math.round((data?.cause.raisedAmount / data.cause.targetAmount) * 100)
			  )
			: 0;

	// Extract data from the API response
	const donorCount = data?.cause?.donorCount || 0;

	// Handle donation types and acceptance type
	let acceptanceType: "money" | "items" | "both" = "money";
	let donationItems: string[] = [];
	let acceptedDonationTypes: DonationType[] = [DonationType.MONEY];

	// Check if the API response includes these fields
	if (data?.cause) {
		if (data.cause.acceptanceType) {
			acceptanceType = data.cause.acceptanceType;
		}

		if (data.cause.donationItems && Array.isArray(data.cause.donationItems)) {
			donationItems = data.cause.donationItems;
		}

		if (
			data.cause.acceptedDonationTypes &&
			Array.isArray(data.cause.acceptedDonationTypes)
		) {
			acceptedDonationTypes = data.cause.acceptedDonationTypes;
		} else if (acceptanceType === "both") {
			// If acceptanceType is 'both' but no acceptedDonationTypes, include MONEY and some default item types
			acceptedDonationTypes = [
				DonationType.MONEY,
				DonationType.CLOTHES,
				DonationType.FOOD,
			];
		} else if (acceptanceType === "items") {
			// If acceptanceType is 'items' but no acceptedDonationTypes, include some default item types
			acceptedDonationTypes = [
				DonationType.CLOTHES,
				DonationType.FOOD,
				DonationType.HOUSEHOLD,
			];
		}
	}

	// Calculate urgency based on progress
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
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	return (
		<Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
			{/* Back button */}
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={handleBack}
				sx={{
					mb: 4,
					color: "#287068",
					fontWeight: 600,
					"&:hover": {
						backgroundColor: "rgba(40, 112, 104, 0.1)",
					},
				}}
			>
				Back to causes
			</Button>

			{/* Cause Header */}
			<Card
				sx={{ mb: 4, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
			>
				{/* Hero Section */}
				<Box
					sx={{
						height: { xs: 250, md: 350 },
						position: "relative",
						background: `linear-gradient(135deg, ${urgencyColor}20, ${urgencyColor}40)`,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{/* Urgency Badge */}
					<Chip
						label={`${urgency} Priority`}
						sx={{
							position: "absolute",
							top: 24,
							right: 24,
							backgroundColor: urgencyColor,
							color: "white",
							fontWeight: 600,
							fontSize: "0.875rem",
							px: 2,
							py: 1,
						}}
					/>

					{/* Main Icon */}
					{data?.cause.imageUrl ? (
						<Box
							component="img"
							src={data?.cause?.imageUrl}
							alt={data?.cause?.title || "Cause"}
							sx={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								position: "absolute",
								top: 0,
								left: 0,
								zIndex: 1,
							}}
						/>
					) : (
						<PublicIcon
							sx={{ fontSize: 120, color: urgencyColor, zIndex: 2 }}
						/>
					)}

					{/* Overlay for better text readability when image is present */}
					{data?.cause.imageUrl && (
						<Box
							sx={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								background: `linear-gradient(135deg, ${urgencyColor}40, ${urgencyColor}60)`,
								zIndex: 2,
							}}
						/>
					)}
				</Box>

				<CardContent sx={{ p: 4 }}>
					{/* Title and Organization */}
					<Typography
						variant="h3"
						sx={{
							fontWeight: "bold",
							mb: 2,
							color: "#1a1a1a",
						}}
					>
						{data?.cause?.title || "Untitled Cause"}
					</Typography>

					<Box display="flex" alignItems="center" mb={4}>
						<Avatar
							sx={{
								backgroundColor: "#287068",
								width: 32,
								height: 32,
								mr: 2,
							}}
						>
							<PeopleIcon sx={{ fontSize: 18 }} />
						</Avatar>
						<Typography variant="h6" sx={{ color: "#287068", fontWeight: 600 }}>
							{data?.cause.organizationName || "Organization"}
						</Typography>
					</Box>

					{/* Cause Stats */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
							gap: 3,
							mb: 4,
						}}
					>
						<Card
							sx={{
								borderRadius: 3,
								border: "2px solid #287068",
								backgroundColor: "rgba(40, 112, 104, 0.05)",
								transition: "all 0.3s ease",
								"&:hover": {
									transform: "translateY(-4px)",
									boxShadow: "0 8px 25px rgba(40, 112, 104, 0.15)",
								},
							}}
						>
							<CardContent sx={{ p: 3 }}>
								<Box display="flex" alignItems="center" mb={2}>
									<Avatar
										sx={{
											backgroundColor: "#287068",
											width: 48,
											height: 48,
											mr: 2,
										}}
									>
										<MoneyIcon sx={{ fontSize: 24 }} />
									</Avatar>
									<Box>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ fontWeight: 500 }}
										>
											Amount Raised
										</Typography>
										<Typography
											variant="h4"
											sx={{ fontWeight: "bold", color: "#287068" }}
										>
											{formatCurrency(data?.cause.raisedAmount || 0)}
										</Typography>
									</Box>
								</Box>
								<Typography variant="body2" color="text.secondary">
									of {formatCurrency(data?.cause.targetAmount || 0)} goal
								</Typography>
							</CardContent>
						</Card>

						<Card
							sx={{
								borderRadius: 3,
								border: "2px solid #ef4444",
								backgroundColor: "rgba(239, 68, 68, 0.05)",
								transition: "all 0.3s ease",
								"&:hover": {
									transform: "translateY(-4px)",
									boxShadow: "0 8px 25px rgba(239, 68, 68, 0.15)",
								},
							}}
						>
							<CardContent sx={{ p: 3 }}>
								<Box display="flex" alignItems="center" mb={2}>
									<Avatar
										sx={{
											backgroundColor: "#ef4444",
											width: 48,
											height: 48,
											mr: 2,
										}}
									>
										<HeartIcon sx={{ fontSize: 24 }} />
									</Avatar>
									<Box>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ fontWeight: 500 }}
										>
											Contributors
										</Typography>
										<Typography
											variant="h4"
											sx={{ fontWeight: "bold", color: "#ef4444" }}
										>
											{donorCount}
										</Typography>
									</Box>
								</Box>
								<Typography variant="body2" color="text.secondary">
									people have donated
								</Typography>
							</CardContent>
						</Card>

						<Card
							sx={{
								borderRadius: 3,
								border: "2px solid #3b82f6",
								backgroundColor: "rgba(59, 130, 246, 0.05)",
								transition: "all 0.3s ease",
								"&:hover": {
									transform: "translateY(-4px)",
									boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)",
								},
							}}
						>
							<CardContent sx={{ p: 3 }}>
								<Box display="flex" alignItems="center" mb={2}>
									<Avatar
										sx={{
											backgroundColor: "#3b82f6",
											width: 48,
											height: 48,
											mr: 2,
										}}
									>
										<CalendarIcon sx={{ fontSize: 24 }} />
									</Avatar>
									<Box>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ fontWeight: 500 }}
										>
											Created On
										</Typography>
										<Typography
											variant="h6"
											sx={{ fontWeight: "bold", color: "#3b82f6" }}
										>
											{data?.cause.createdAt
												? new Date(data.cause.createdAt).toLocaleDateString(
														undefined,
														{
															month: "short",
															day: "numeric",
															year: "numeric",
														}
												  )
												: "N/A"}
										</Typography>
									</Box>
								</Box>
								<Typography variant="body2" color="text.secondary">
									campaign start date
								</Typography>
							</CardContent>
						</Card>
					</Box>

					{/* Enhanced Progress Section */}
					<Box
						sx={{
							mb: 4,
							p: 3,
							backgroundColor: "rgba(40, 112, 104, 0.05)",
							borderRadius: 3,
							border: "1px solid rgba(40, 112, 104, 0.2)",
						}}
					>
						<Typography
							variant="h6"
							sx={{ mb: 2, fontWeight: 600, color: "#287068" }}
						>
							Funding Progress
						</Typography>
						<Box sx={{ mb: 2 }}>
							<Box display="flex" justifyContent="space-between" mb={1}>
								<Typography variant="body1" sx={{ fontWeight: 600 }}>
									{formatCurrency(data?.cause.raisedAmount || 0)}
								</Typography>
								<Typography variant="body1" sx={{ fontWeight: 600 }}>
									{formatCurrency(data?.cause.targetAmount || 0)}
								</Typography>
							</Box>
							<LinearProgress
								variant="determinate"
								value={progress}
								sx={{
									height: 12,
									borderRadius: 6,
									backgroundColor: "#f0f0f0",
									"& .MuiLinearProgress-bar": {
										backgroundColor: urgencyColor,
										borderRadius: 6,
									},
								}}
							/>
							<Box display="flex" justifyContent="space-between" mt={1}>
								<Typography variant="body2" color="text.secondary">
									{progress}% funded
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{100 - progress}% remaining
								</Typography>
							</Box>
						</Box>
					</Box>

					{/* Action Buttons */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
							gap: 3,
							mb: 4,
						}}
					>
						{/* Monetary Donation Button */}
						{(acceptanceType === "money" || acceptanceType === "both") && (
							<Button
								variant="contained"
								size="large"
								startIcon={<MoneyIcon />}
								onClick={handleDonate}
								disabled={user?.role !== "donor"}
								sx={{
									backgroundColor: "#287068",
									borderRadius: 3,
									textTransform: "none",
									fontWeight: 600,
									py: 2,
									fontSize: "1rem",
									transition: "all 0.3s ease",
									"&:hover": {
										backgroundColor: "#1f5a52",
										transform: "translateY(-2px)",
										boxShadow: "0 8px 25px rgba(40, 112, 104, 0.3)",
									},
									"&:disabled": {
										backgroundColor: "#e0e0e0",
										color: "#9e9e9e",
									},
								}}
							>
								Donate Money
							</Button>
						)}

						{/* Item Donation Button */}
						{(acceptanceType === "items" || acceptanceType === "both") && (
							<Button
								variant={acceptanceType === "both" ? "outlined" : "contained"}
								size="large"
								startIcon={<CategoryIcon />}
								onClick={handleDonate}
								disabled={user?.role !== "donor"}
								sx={{
									backgroundColor:
										acceptanceType === "both" ? "transparent" : "#287068",
									borderColor: "#287068",
									color: acceptanceType === "both" ? "#287068" : "white",
									borderWidth: 2,
									borderRadius: 3,
									textTransform: "none",
									fontWeight: 600,
									py: 2,
									fontSize: "1rem",
									transition: "all 0.3s ease",
									"&:hover": {
										backgroundColor: "#287068",
										color: "white",
										transform: "translateY(-2px)",
										boxShadow: "0 8px 25px rgba(40, 112, 104, 0.3)",
									},
									"&:disabled": {
										backgroundColor: "transparent",
										borderColor: "#e0e0e0",
										color: "#9e9e9e",
									},
								}}
							>
								Donate Items
							</Button>
						)}

						{/* Volunteer Button */}
						{acceptedDonationTypes.includes(
							ExtendedDonationType.VOLUNTEER as unknown as DonationType
						) && (
							<Button
								variant="outlined"
								size="large"
								startIcon={<PeopleIcon />}
								disabled={user?.role !== "donor"}
								sx={{
									borderColor: "#f59e0b",
									color: "#f59e0b",
									borderWidth: 2,
									borderRadius: 3,
									textTransform: "none",
									fontWeight: 600,
									py: 2,
									fontSize: "1rem",
									transition: "all 0.3s ease",
									"&:hover": {
										backgroundColor: "#f59e0b",
										color: "white",
										transform: "translateY(-2px)",
										boxShadow: "0 8px 25px rgba(245, 158, 11, 0.3)",
									},
									"&:disabled": {
										borderColor: "#e0e0e0",
										color: "#9e9e9e",
									},
								}}
							>
								Volunteer
							</Button>
						)}
					</Box>

					{/* User Role Alert */}
					{user?.role !== "donor" && (
						<Box
							sx={{
								mb: 4,
								p: 3,
								backgroundColor: "rgba(59, 130, 246, 0.05)",
								borderRadius: 3,
								border: "2px solid #3b82f6",
							}}
						>
							<Alert
								severity="info"
								sx={{
									mb: 3,
									backgroundColor: "transparent",
									border: "none",
									"& .MuiAlert-icon": {
										color: "#3b82f6",
									},
								}}
							>
								<Typography variant="body1" sx={{ fontWeight: 500 }}>
									You are logged in as an organization. Donation features are
									only available to donors.
								</Typography>
							</Alert>

							{/* Add to Campaign Button for Organizations */}
							<Box>
								<Typography
									variant="h6"
									sx={{ mb: 2, fontWeight: 600, color: "#3b82f6" }}
								>
									Campaign Management
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 2 }}
								>
									Make this cause visible to donors by adding it to an active
									campaign:
								</Typography>
								<AddCauseToCampaignButton causeId={id} />
							</Box>
						</Box>
					)}

					{/* Acceptance Type Alert */}
					<Box
						sx={{
							mb: 4,
							p: 3,
							backgroundColor: "rgba(40, 112, 104, 0.05)",
							borderRadius: 3,
							border: "2px solid #287068",
						}}
					>
						<Box display="flex" alignItems="center" mb={2}>
							<Avatar
								sx={{
									backgroundColor: "#287068",
									width: 40,
									height: 40,
									mr: 2,
								}}
							>
								{acceptanceType === "money" ? (
									<MoneyIcon sx={{ fontSize: 20 }} />
								) : acceptanceType === "items" ? (
									<CategoryIcon sx={{ fontSize: 20 }} />
								) : (
									<HeartIcon sx={{ fontSize: 20 }} />
								)}
							</Avatar>
							<Typography
								variant="h6"
								sx={{ fontWeight: 600, color: "#287068" }}
							>
								Donation Information
							</Typography>
						</Box>
						<Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
							{acceptanceType === "money"
								? "This cause accepts monetary donations only."
								: acceptanceType === "items"
								? "This cause accepts item donations only."
								: "This cause accepts both monetary and item donations."}
						</Typography>
						{(acceptanceType === "items" || acceptanceType === "both") &&
							donationItems.length > 0 && (
								<Typography variant="body2" color="text.secondary">
									See the "Details" tab for a list of specific items needed.
								</Typography>
							)}
					</Box>

					{/* Organization Information */}
					{data?.cause.organizationName && (
						<Box mb={4}>
							<Typography
								variant="h6"
								sx={{ mb: 3, fontWeight: 600, color: "#287068" }}
							>
								About the Organization
							</Typography>
							<Card
								sx={{
									p: 4,
									borderRadius: 3,
									border: "2px solid #287068",
									backgroundColor: "rgba(40, 112, 104, 0.02)",
									boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
								}}
							>
								<Box
									sx={{
										display: "flex",
										flexDirection: { xs: "column", md: "row" },
										gap: 4,
									}}
								>
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											minWidth: { xs: "100%", md: "140px" },
										}}
									>
										<Avatar
											sx={{
												width: 100,
												height: 100,
												backgroundColor: "#287068",
												border: "3px solid white",
												boxShadow: "0 4px 12px rgba(40, 112, 104, 0.3)",
											}}
										>
											<BusinessIcon sx={{ fontSize: 50 }} />
										</Avatar>
									</Box>
									<Box sx={{ flexGrow: 1 }}>
										<Typography variant="h6" gutterBottom>
											{data.cause.organizationName}
										</Typography>

										<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
											<BusinessIcon
												sx={{ mr: 1, color: "text.secondary", fontSize: 20 }}
											/>
											<Typography variant="body2" color="text.secondary">
												Organization ID: {data.cause.organizationId}
											</Typography>
										</Box>

										{!orgLoading && organization ? (
											<>
												{organization.email &&
													organization.email !== "Not available" && (
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																mb: 1,
															}}
														>
															<EmailIcon
																sx={{
																	mr: 1,
																	color: "text.secondary",
																	fontSize: 20,
																}}
															/>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																{organization.email}
															</Typography>
														</Box>
													)}

												{organization.phoneNumber &&
													organization.phoneNumber !== "Not available" && (
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																mb: 1,
															}}
														>
															<PhoneIcon
																sx={{
																	mr: 1,
																	color: "text.secondary",
																	fontSize: 20,
																}}
															/>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																{organization.phoneNumber}
															</Typography>
														</Box>
													)}

												{organization.address && (
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															mb: 1,
														}}
													>
														<LocationIcon
															sx={{
																mr: 1,
																color: "text.secondary",
																fontSize: 20,
															}}
														/>
														<Typography variant="body2" color="text.secondary">
															{`${organization.address}${
																organization.city
																	? `, ${organization.city}`
																	: ""
															}${
																organization.state
																	? `, ${organization.state}`
																	: ""
															}${
																organization.country
																	? `, ${organization.country}`
																	: ""
															}`}
														</Typography>
													</Box>
												)}

												<Typography
													variant="body2"
													color="text.secondary"
													sx={{ mt: 2 }}
												>
													{organization.description ||
														"This is the organization managing this charitable cause. Click below to view their complete profile."}
												</Typography>
											</>
										) : orgLoading ? (
											<Box display="flex" alignItems="center" my={2}>
												<CircularProgress size={20} sx={{ mr: 2 }} />
												<Typography variant="body2" color="text.secondary">
													Loading organization details...
												</Typography>
											</Box>
										) : (
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mt: 2 }}
											>
												This is the organization managing this charitable cause.
												Click below to view their complete profile.
											</Typography>
										)}

										<Button
											variant="contained"
											startIcon={<BusinessIcon />}
											onClick={handleViewOrganization}
											sx={{
												mt: 3,
												backgroundColor: "#287068",
												borderRadius: 2,
												textTransform: "none",
												fontWeight: 600,
												px: 3,
												py: 1.5,
												transition: "all 0.3s ease",
												"&:hover": {
													backgroundColor: "#1f5a52",
													transform: "translateY(-2px)",
													boxShadow: "0 4px 12px rgba(40, 112, 104, 0.3)",
												},
											}}
										>
											View Organization Profile
										</Button>
									</Box>
								</Box>
							</Card>
						</Box>
					)}

					{/* Tags */}
					{data?.cause.tags && data.cause.tags.length > 0 && (
						<Box mb={4}>
							<Typography
								variant="h6"
								sx={{ mb: 2, fontWeight: 600, color: "#287068" }}
							>
								Categories
							</Typography>
							<Box display="flex" flexWrap="wrap" gap={2}>
								{data.cause.tags.map((tag) => (
									<Chip
										key={tag}
										label={tag}
										icon={<CategoryIcon />}
										sx={{
											borderRadius: 3,
											backgroundColor: "#f8f9fa",
											color: "#287068",
											fontWeight: 500,
											border: "1px solid #287068",
											"&:hover": {
												backgroundColor: "#287068",
												color: "white",
											},
										}}
									/>
								))}
							</Box>
						</Box>
					)}
				</CardContent>
			</Card>

			{/* Tabs */}
			<Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
				<Box sx={{ borderBottom: 2, borderColor: "#287068" }}>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						aria-label="cause details tabs"
						sx={{
							"& .MuiTab-root": {
								textTransform: "none",
								fontWeight: 600,
								fontSize: "1rem",
								color: "#6b7280",
								"&.Mui-selected": {
									color: "#287068",
								},
							},
							"& .MuiTabs-indicator": {
								backgroundColor: "#287068",
								height: 3,
							},
						}}
					>
						<Tab label="About" value="about" />
						<Tab label="Donors" value="donors" />
					</Tabs>
				</Box>

				<CardContent sx={{ p: 4 }}>
					{activeTab === "about" && (
						<Box>
							<Typography
								variant="h5"
								sx={{ mb: 3, fontWeight: 600, color: "#287068" }}
							>
								About This Cause
							</Typography>
							<Typography
								variant="body1"
								sx={{
									whiteSpace: "pre-wrap",
									mb: 4,
									lineHeight: 1.7,
									fontSize: "1.1rem",
								}}
							>
								{data?.cause.description || "No description available."}
							</Typography>

							{/* Donation Acceptance Type */}
							<Box mt={4}>
								<Typography
									variant="h5"
									sx={{ mb: 3, fontWeight: 600, color: "#287068" }}
								>
									Ways You Can Help
								</Typography>

								{/* Acceptance Type Banner */}
								<Box
									sx={{
										mb: 4,
										p: 3,
										backgroundColor: "rgba(40, 112, 104, 0.05)",
										borderRadius: 3,
										border: "2px solid #287068",
									}}
								>
									<Box display="flex" alignItems="center" mb={2}>
										<Avatar
											sx={{
												backgroundColor: "#287068",
												width: 40,
												height: 40,
												mr: 2,
											}}
										>
											{acceptanceType === "money" ? (
												<MoneyIcon sx={{ fontSize: 20 }} />
											) : acceptanceType === "items" ? (
												<CategoryIcon sx={{ fontSize: 20 }} />
											) : (
												<HeartIcon sx={{ fontSize: 20 }} />
											)}
										</Avatar>
										<Typography
											variant="h6"
											sx={{ fontWeight: 600, color: "#287068" }}
										>
											Donation Types Accepted
										</Typography>
									</Box>
									<Typography variant="body1" sx={{ fontWeight: 500 }}>
										{acceptanceType === "money"
											? "This cause accepts monetary donations only"
											: acceptanceType === "items"
											? "This cause accepts item donations only"
											: "This cause accepts both monetary and item donations"}
									</Typography>
								</Box>

								{/* Donation Types Cards */}
								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
										gap: 3,
									}}
								>
									{acceptedDonationTypes.map(
										(type: DonationType, index: number) => {
											const TypeIcon = donationTypeIcons[type] || MoneyIcon;
											let title = "Donation";
											let description = "Support this cause";
											let cardColor = "#287068";

											switch (type) {
												case DonationType.MONEY:
													title = "Monetary Donations";
													description =
														"Support this cause with financial contributions.";
													cardColor = "#287068";
													break;
												case ExtendedDonationType.IN_KIND as unknown as DonationType:
													title = "In-Kind Donations";
													description = "Donate goods, supplies, or services.";
													cardColor = "#3b82f6";
													break;
												case ExtendedDonationType.VOLUNTEER as unknown as DonationType:
													title = "Volunteer Work";
													description = "Contribute your time and skills.";
													cardColor = "#f59e0b";
													break;
												case DonationType.BLOOD:
													title = "Blood Donations";
													description = "Donate blood to save lives.";
													cardColor = "#ef4444";
													break;
												case DonationType.FOOD:
													title = "Food Donations";
													description = "Donate food items to those in need.";
													cardColor = "#10b981";
													break;
												case DonationType.BOOKS:
													title = "Book Donations";
													description =
														"Donate books for education and knowledge.";
													cardColor = "#8b5cf6";
													break;
												case DonationType.CLOTHES:
													title = "Clothing Donations";
													description = "Donate clothes to those in need.";
													cardColor = "#f97316";
													break;
												case DonationType.FURNITURE:
													title = "Furniture Donations";
													description =
														"Donate furniture to help furnish homes.";
													cardColor = "#6b7280";
													break;
												case DonationType.HOUSEHOLD:
													title = "Household Items";
													description =
														"Donate household items to support families.";
													cardColor = "#ec4899";
													break;
												default:
													title = `${type} Donations`;
													description = `Donate ${type.toLowerCase()} to support this cause.`;
													cardColor = "#287068";
											}

											return (
												<Card
													key={index}
													sx={{
														borderRadius: 3,
														border: `2px solid ${cardColor}`,
														backgroundColor: `${cardColor}05`,
														transition: "all 0.3s ease",
														"&:hover": {
															transform: "translateY(-4px)",
															boxShadow: `0 8px 25px ${cardColor}20`,
														},
													}}
												>
													<CardContent sx={{ p: 3 }}>
														<Box display="flex" alignItems="center" mb={2}>
															<Avatar
																sx={{
																	backgroundColor: cardColor,
																	width: 48,
																	height: 48,
																	mr: 2,
																}}
															>
																{TypeIcon && (
																	<TypeIcon
																		sx={{ fontSize: 24, color: "white" }}
																	/>
																)}
															</Avatar>
															<Typography
																variant="h6"
																sx={{ fontWeight: 600, color: cardColor }}
															>
																{title}
															</Typography>
														</Box>
														<Typography
															variant="body2"
															sx={{ lineHeight: 1.6 }}
														>
															{description}
														</Typography>
													</CardContent>
												</Card>
											);
										}
									)}
								</Box>

								{/* Donation Items Section */}
								{(acceptanceType === "items" || acceptanceType === "both") &&
									donationItems.length > 0 && (
										<Box mt={4}>
											<Typography
												variant="h6"
												sx={{ mb: 3, fontWeight: 600, color: "#287068" }}
											>
												Specific Items Needed
											</Typography>
											<Card
												sx={{
													p: 3,
													borderRadius: 3,
													border: "2px solid #287068",
													backgroundColor: "rgba(40, 112, 104, 0.02)",
												}}
											>
												<Box display="flex" flexWrap="wrap" gap={2}>
													{donationItems.map((item: string, index: number) => (
														<Chip
															key={index}
															label={item}
															icon={<CategoryIcon />}
															sx={{
																borderRadius: 3,
																backgroundColor: "#f8f9fa",
																color: "#287068",
																fontWeight: 500,
																border: "1px solid #287068",
																px: 2,
																py: 1,
																"&:hover": {
																	backgroundColor: "#287068",
																	color: "white",
																},
															}}
														/>
													))}
												</Box>
											</Card>
										</Box>
									)}
							</Box>
						</Box>
					)}

					{activeTab === "donors" && (
						<Box sx={{ textAlign: "center", py: 6 }}>
							<Avatar
								sx={{
									width: 120,
									height: 120,
									backgroundColor: "#287068",
									mx: "auto",
									mb: 3,
									boxShadow: "0 8px 25px rgba(40, 112, 104, 0.3)",
								}}
							>
								<PeopleIcon sx={{ width: 60, height: 60, color: "white" }} />
							</Avatar>

							<Typography
								variant="h4"
								sx={{ mb: 2, fontWeight: 600, color: "#287068" }}
							>
								{donorCount
									? `${donorCount} People Have Donated`
									: "No Donors Yet"}
							</Typography>

							<Typography
								variant="h6"
								color="text.secondary"
								sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
							>
								{donorCount
									? "Thank you to all our amazing donors for supporting this cause and making a difference!"
									: "Be the first to support this cause and help make a positive impact in the community!"}
							</Typography>

							{user?.role === "donor" && (
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
										gap: 3,
										flexWrap: "wrap",
									}}
								>
									{(acceptanceType === "money" ||
										acceptanceType === "both") && (
										<Button
											variant="contained"
											onClick={handleDonate}
											startIcon={<MoneyIcon />}
											sx={{
												backgroundColor: "#287068",
												borderRadius: 3,
												textTransform: "none",
												fontWeight: 600,
												px: 4,
												py: 2,
												fontSize: "1rem",
												transition: "all 0.3s ease",
												"&:hover": {
													backgroundColor: "#1f5a52",
													transform: "translateY(-2px)",
													boxShadow: "0 8px 25px rgba(40, 112, 104, 0.3)",
												},
											}}
										>
											Donate Money
										</Button>
									)}

									{(acceptanceType === "items" ||
										acceptanceType === "both") && (
										<Button
											variant={
												acceptanceType === "both" ? "outlined" : "contained"
											}
											onClick={handleDonate}
											startIcon={<CategoryIcon />}
											sx={{
												backgroundColor:
													acceptanceType === "both" ? "transparent" : "#287068",
												borderColor: "#287068",
												color: acceptanceType === "both" ? "#287068" : "white",
												borderWidth: 2,
												borderRadius: 3,
												textTransform: "none",
												fontWeight: 600,
												px: 4,
												py: 2,
												fontSize: "1rem",
												transition: "all 0.3s ease",
												"&:hover": {
													backgroundColor: "#287068",
													color: "white",
													transform: "translateY(-2px)",
													boxShadow: "0 8px 25px rgba(40, 112, 104, 0.3)",
												},
											}}
										>
											Donate Items
										</Button>
									)}
								</Box>
							)}
						</Box>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
