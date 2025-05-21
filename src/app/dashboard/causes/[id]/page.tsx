"use client";

import { useGetCauseByIdQuery } from "@/store/api/causeApi";
import { useGetOrganizationByCauseIdQuery } from "@/store/api/organizationApi";
import { RootState } from "@/store/store";
import { DonationType } from "@/types/donation";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { LocalMall as ClothesIcon } from "@mui/icons-material";

import {
	ArrowBack as ArrowBackIcon,
	Bloodtype as BloodIcon,
	MenuBook as BooksIcon,
	Business as BusinessIcon,
	CalendarToday as CalendarIcon,
	Category as CategoryIcon,
	AccessTime as ClockIcon,
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
	Divider,
	LinearProgress,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Paper,
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

const donationTypeIcons: Record<string, React.ComponentType<any>> = {
	[DonationType.MONEY]: MoneyIcon,
	[DonationType.BLOOD]: BloodIcon,
	[DonationType.FOOD]: FoodIcon,
	[DonationType.TOYS]: ToysIcon,
	[DonationType.BOOKS]: BooksIcon,
	[DonationType.FURNITURE]: FurnitureIcon,
	[DonationType.HOUSEHOLD]: HouseholdIcon,
	[ExtendedDonationType.IN_KIND]: MoneyIcon,
	[ExtendedDonationType.VOLUNTEER]: PeopleIcon,
	"CLOTHES": ClothesIcon,
	"OTHER": CategoryIcon,
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
			if ('status' in error) {
				const fetchError = error as FetchBaseQueryError;
				if (fetchError.status === 404) {
					errorMessage = "This cause doesn't exist or has been removed.";
				} else if (fetchError.status === 403) {
					errorMessage = "You don't have permission to view this cause.";
				} else if (fetchError.status === 401) {
					errorMessage = "Please log in to view this cause.";
					isAuthError = true;
				} else {
					errorMessage = "There was an error loading this cause. Please try again later.";
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
						If you believe this is an error, please try refreshing the page or contact support.
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
	let acceptanceType: 'money' | 'items' | 'both' = 'money';
	let donationItems: string[] = [];
	let acceptedDonationTypes: DonationType[] = [DonationType.MONEY];

	// Check if the API response includes these fields
	if (data?.cause) {
		// @ts-ignore - These properties might exist in the API response but not in the TypeScript type
		if (data.cause.acceptanceType) {
			// @ts-ignore
			acceptanceType = data.cause.acceptanceType;
		}

		// @ts-ignore
		if (data.cause.donationItems && Array.isArray(data.cause.donationItems)) {
			// @ts-ignore
			donationItems = data.cause.donationItems;
		}

		// @ts-ignore
		if (data.cause.acceptedDonationTypes && Array.isArray(data.cause.acceptedDonationTypes)) {
			// @ts-ignore
			acceptedDonationTypes = data.cause.acceptedDonationTypes;
		} else if (acceptanceType === 'both') {
			// If acceptanceType is 'both' but no acceptedDonationTypes, include MONEY and some default item types
			acceptedDonationTypes = [DonationType.MONEY, DonationType.CLOTHES, DonationType.FOOD];
		} else if (acceptanceType === 'items') {
			// If acceptanceType is 'items' but no acceptedDonationTypes, include some default item types
			acceptedDonationTypes = [DonationType.CLOTHES, DonationType.FOOD, DonationType.HOUSEHOLD];
		}
	}

	return (
		<Box p={4}>
			{/* Back button */}
			<Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 4 }}>
				Back to causes
			</Button>

			{/* Cause Header */}
			<Card sx={{ mb: 4, overflow: "hidden" }}>
				<Box
					sx={{
						height: { xs: 200, md: 300 },
						position: "relative",
						bgcolor: "grey.100",
					}}
				>
					{data?.cause.imageUrl ? (
						<Box
							component="img"
							src={data?.cause?.imageUrl}
							alt={data?.cause?.title || "Cause"}
							sx={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
						/>
					) : (
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
							height="100%"
						>
							<PublicIcon sx={{ fontSize: 80, color: "grey.300" }} />
						</Box>
					)}
				</Box>

				<CardContent sx={{ p: 4 }}>
					<Typography variant="h4" fontWeight="bold" gutterBottom>
						{data?.cause?.title || "Untitled Cause"}
					</Typography>

					<Box display="flex" alignItems="center" mb={3}>
						<PeopleIcon sx={{ mr: 1, color: "grey.500" }} />
						<Typography variant="body2" color="text.secondary">
							{data?.cause.organizationName || "Organization"}
						</Typography>
					</Box>

					{/* Cause Stats */}
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
						<Card variant="outlined" sx={{ flexGrow: 1, minWidth: "220px" }}>
							<CardContent>
								<Box
									display="flex"
									alignItems="center"
									justifyContent="space-between"
									mb={1}
								>
									<Typography variant="body2" color="text.secondary">
										Raised
									</Typography>
									<MoneyIcon color="primary" />
								</Box>
								<Typography variant="h5" fontWeight="bold">
									$
									{data?.cause.raisedAmount
										? data.cause.raisedAmount.toLocaleString()
										: "0"}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									of $
									{data?.cause.targetAmount
										? data.cause.targetAmount.toLocaleString()
										: "0"}{" "}
									goal
								</Typography>
							</CardContent>
						</Card>

						<Card variant="outlined" sx={{ flexGrow: 1, minWidth: "220px" }}>
							<CardContent>
								<Box
									display="flex"
									alignItems="center"
									justifyContent="space-between"
									mb={1}
								>
									<Typography variant="body2" color="text.secondary">
										Contributors
									</Typography>
									<HeartIcon color="error" />
								</Box>
								<Typography variant="h5" fontWeight="bold">
									{donorCount}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									people have donated
								</Typography>
							</CardContent>
						</Card>

						<Card variant="outlined" sx={{ flexGrow: 1, minWidth: "220px" }}>
							<CardContent>
								<Box
									display="flex"
									alignItems="center"
									justifyContent="space-between"
									mb={1}
								>
									<Typography variant="body2" color="text.secondary">
										Created
									</Typography>
									<CalendarIcon color="info" />
								</Box>
								<Typography variant="h5" fontWeight="bold">
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
								<Typography variant="caption" color="text.secondary">
									start date
								</Typography>
							</CardContent>
						</Card>
					</Box>

					{/* Progress Bar */}
					<Box mb={4}>
						<LinearProgress
							variant="determinate"
							value={progress}
							sx={{ height: 10, borderRadius: 5, mb: 1 }}
						/>
						<Box display="flex" justifyContent="space-between">
							<Typography variant="body2" color="text.secondary">
								{progress}% funded
							</Typography>
							<Typography variant="body2" color="text.secondary">
								$
								{data?.cause.targetAmount
									? data.cause.targetAmount.toLocaleString()
									: "0"}{" "}
								goal
							</Typography>
						</Box>
					</Box>

					{/* Action Buttons */}
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
						{/* Monetary Donation Button */}
						{(acceptanceType === 'money' || acceptanceType === 'both') && (
							<Button
								fullWidth
								variant="contained"
								color="primary"
								size="large"
								startIcon={<MoneyIcon />}
								onClick={handleDonate}
								disabled={user?.role !== "donor"}
								sx={{ flexGrow: 1, minWidth: "200px" }}
							>
								Donate Money
							</Button>
						)}

						{/* Item Donation Button */}
						{(acceptanceType === 'items' || acceptanceType === 'both') && (
							<Button
								fullWidth
								variant={acceptanceType === 'both' ? "outlined" : "contained"}
								color="primary"
								size="large"
								startIcon={<CategoryIcon />}
								onClick={handleDonate}
								disabled={user?.role !== "donor"}
								sx={{ flexGrow: 1, minWidth: "200px" }}
							>
								Donate Items
							</Button>
						)}

						{/* Volunteer Button */}
						{acceptedDonationTypes.includes(
							ExtendedDonationType.VOLUNTEER as unknown as DonationType
						) && (
								<Button
									fullWidth
									variant="outlined"
									color="primary"
									size="large"
									startIcon={<PeopleIcon />}
									disabled={user?.role !== "donor"}
									sx={{ flexGrow: 1, minWidth: "200px" }}
								>
									Volunteer
								</Button>
							)}
					</Box>

					{/* User Role Alert */}
					{user?.role !== "donor" && (
						<Alert severity="info" sx={{ mb: 4 }}>
							You are logged in as an organization. Donation features are only
							available to donors.
						</Alert>
					)}

					{/* Acceptance Type Alert */}
					<Alert
						severity="info"
						sx={{ mb: 4 }}
						icon={
							acceptanceType === 'money' ? <MoneyIcon /> :
								acceptanceType === 'items' ? <CategoryIcon /> :
									<HeartIcon />
						}
					>
						<Typography variant="body1">
							{acceptanceType === 'money'
								? 'This cause accepts monetary donations only.'
								: acceptanceType === 'items'
									? 'This cause accepts item donations only.'
									: 'This cause accepts both monetary and item donations.'
							}
							{(acceptanceType === 'items' || acceptanceType === 'both') && donationItems.length > 0 && (
								<span> See the "Details" tab for a list of specific items needed.</span>
							)}
						</Typography>
					</Alert>

					{/* Organization Information */}
					{data?.cause.organizationName && (
						<Box mb={4}>
							<Typography variant="h6" gutterBottom>
								About the Organization
							</Typography>
							<Paper variant="outlined" sx={{ p: 3 }}>
								<Box
									sx={{
										display: "flex",
										flexDirection: { xs: "column", md: "row" },
										gap: 3,
									}}
								>
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											minWidth: { xs: "100%", md: "120px" },
										}}
									>
										<Avatar
											sx={{
												width: 80,
												height: 80,
												bgcolor: "primary.main",
											}}
										>
											<BusinessIcon sx={{ fontSize: 40 }} />
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
															{`${organization.address}${organization.city
																? `, ${organization.city}`
																: ""
																}${organization.state
																	? `, ${organization.state}`
																	: ""
																}${organization.country
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
											variant="text"
											color="primary"
											startIcon={<BusinessIcon />}
											onClick={handleViewOrganization}
											sx={{ mt: 2 }}
										>
											View Organization Profile
										</Button>
									</Box>
								</Box>
							</Paper>
						</Box>
					)}

					{/* Tags */}
					{data?.cause.tags && data.cause.tags.length > 0 && (
						<Box mb={4}>
							<Typography variant="subtitle2" gutterBottom>
								Categories
							</Typography>
							<Box display="flex" flexWrap="wrap" gap={1}>
								{data.cause.tags.map((tag) => (
									<Chip
										key={tag}
										label={tag}
										icon={<CategoryIcon />}
										variant="outlined"
									/>
								))}
							</Box>
						</Box>
					)}
				</CardContent>
			</Card>

			{/* Tabs */}
			<Card>
				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						aria-label="cause details tabs"
					>
						<Tab label="About" value="about" />
						<Tab label="Details" value="details" />
						<Tab label="Donors" value="donors" />
					</Tabs>
				</Box>

				<CardContent>
					{activeTab === "about" && (
						<Box>
							<Typography variant="h6" gutterBottom>
								About This Cause
							</Typography>
							<Typography
								variant="body1"
								sx={{ whiteSpace: "pre-wrap", mb: 4 }}
							>
								{data?.cause.description || "No description available."}
							</Typography>

							{/* Donation Acceptance Type */}
							<Box mt={4}>
								<Typography variant="h6" gutterBottom>
									Ways You Can Help
								</Typography>

								{/* Acceptance Type Banner */}
								<Alert
									severity="info"
									sx={{ mb: 3 }}
									icon={
										acceptanceType === 'money' ? <MoneyIcon /> :
											acceptanceType === 'items' ? <CategoryIcon /> :
												<HeartIcon />
									}
								>
									<Typography variant="subtitle1">
										{acceptanceType === 'money'
											? 'This cause accepts monetary donations only'
											: acceptanceType === 'items'
												? 'This cause accepts item donations only'
												: 'This cause accepts both monetary and item donations'
										}
									</Typography>
								</Alert>

								{/* Donation Types Cards */}
								<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
									{acceptedDonationTypes.map((type: DonationType, index: number) => {
										const TypeIcon = donationTypeIcons[type] || MoneyIcon;
										let title = "Donation";
										let description = "Support this cause";

										switch (type) {
											case DonationType.MONEY:
												title = "Monetary Donations";
												description =
													"Support this cause with financial contributions.";
												break;
											case ExtendedDonationType.IN_KIND as unknown as DonationType:
												title = "In-Kind Donations";
												description = "Donate goods, supplies, or services.";
												break;
											case ExtendedDonationType.VOLUNTEER as unknown as DonationType:
												title = "Volunteer Work";
												description = "Contribute your time and skills.";
												break;
											case DonationType.BLOOD:
												title = "Blood Donations";
												description = "Donate blood to save lives.";
												break;
											case DonationType.FOOD:
												title = "Food Donations";
												description = "Donate food items to those in need.";
												break;
											case DonationType.BOOKS:
												title = "Book Donations";
												description =
													"Donate books for education and knowledge.";
												break;
											case DonationType.CLOTHES:
												title = "Clothing Donations";
												description = "Donate clothes to those in need.";
												break;
											case DonationType.FURNITURE:
												title = "Furniture Donations";
												description = "Donate furniture to help furnish homes.";
												break;
											case DonationType.HOUSEHOLD:
												title = "Household Items";
												description = "Donate household items to support families.";
												break;
											default:
												title = `${type} Donations`;
												description = `Donate ${type.toLowerCase()} to support this cause.`;
										}

										return (
											<Card
												key={index}
												variant="outlined"
												sx={{
													flexGrow: 1,
													minWidth: "240px",
													maxWidth: "350px",
												}}
											>
												<CardContent>
													<Box display="flex" alignItems="center" mb={2}>
														<Box
															sx={{
																bgcolor: "primary.50",
																borderRadius: "50%",
																p: 1,
																mr: 2,
															}}
														>
															{TypeIcon && <TypeIcon color="primary" />}
														</Box>
														<Typography variant="h6">{title}</Typography>
													</Box>
													<Typography variant="body2">
														{description}
													</Typography>
												</CardContent>
											</Card>
										);
									})}
								</Box>

								{/* Donation Items Section */}
								{(acceptanceType === 'items' || acceptanceType === 'both') && donationItems.length > 0 && (
									<Box mt={4}>
										<Typography variant="subtitle1" gutterBottom fontWeight="medium">
											Specific Items Needed:
										</Typography>
										<Box display="flex" flexWrap="wrap" gap={1} mt={1}>
											{donationItems.map((item: string, index: number) => (
												<Chip
													key={index}
													label={item}
													color="primary"
													variant="outlined"
													icon={<CategoryIcon />}
													sx={{ m: 0.5 }}
												/>
											))}
										</Box>
									</Box>
								)}
							</Box>
						</Box>
					)}

					{activeTab === "details" && (
						<Box>
							<Typography variant="h6" gutterBottom>
								Cause Details
							</Typography>
							<List>
								<ListItem>
									<ListItemAvatar>
										<Avatar sx={{ bgcolor: "primary.light" }}>
											<MoneyIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary="Funding Goal"
										secondary={`$${data?.cause.targetAmount
											? data.cause?.targetAmount.toLocaleString()
											: "0"
											}`}
									/>
								</ListItem>
								<Divider variant="inset" component="li" />
								<ListItem>
									<ListItemAvatar>
										<Avatar sx={{ bgcolor: "primary.light" }}>
											<ClockIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary="Created On"
										secondary={
											data?.cause?.createdAt
												? new Date(data.cause?.createdAt).toLocaleDateString()
												: "N/A"
										}
									/>
									{/* {console.log("cause data", data?.data.cause)} */}
								</ListItem>
								<Divider variant="inset" component="li" />
								<ListItem>
									<ListItemAvatar>
										<Avatar sx={{ bgcolor: "primary.light" }}>
											<PeopleIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary="Organization"
										secondary={data?.cause?.organizationName || "Organization"}
									/>
								</ListItem>
								<Divider variant="inset" component="li" />
								<ListItem>
									<ListItemAvatar>
										<Avatar sx={{ bgcolor: "primary.light" }}>
											<BusinessIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary="Organization ID"
										secondary={data?.cause?.organizationId || "N/A"}
									/>
								</ListItem>
								<Divider variant="inset" component="li" />
								<ListItem>
									<ListItemAvatar>
										<Avatar sx={{ bgcolor: "primary.light" }}>
											<MoneyIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary="Donation Acceptance Type"
										secondary={
											acceptanceType === 'money'
												? 'Monetary Donations Only'
												: acceptanceType === 'items'
													? 'Item Donations Only'
													: 'Both Monetary and Item Donations'
										}
									/>
								</ListItem>
							</List>

							{/* Donation Items Section */}
							{(acceptanceType === 'items' || acceptanceType === 'both') && donationItems.length > 0 && (
								<Box mt={4}>
									<Typography variant="h6" gutterBottom>
										Accepted Donation Items
									</Typography>
									<Card variant="outlined">
										<CardContent>
											<Box display="flex" flexWrap="wrap" gap={1}>
												{donationItems.map((item: string, index: number) => (
													<Chip
														key={index}
														label={item}
														color="primary"
														variant="outlined"
														icon={<CategoryIcon />}
														sx={{ m: 0.5 }}
													/>
												))}
											</Box>
											{donationItems.length === 0 && (
												<Typography variant="body2" color="text.secondary">
													No specific items listed. Please contact the organization for details.
												</Typography>
											)}
										</CardContent>
									</Card>
								</Box>
							)}

							{/* Organization Contact Information */}
							{data?.cause.organizationId && (
								<Box mt={4}>
									<Typography variant="h6" gutterBottom>
										Organization Contact Information
									</Typography>
									<Card variant="outlined" sx={{ mt: 2 }}>
										<CardContent>
											{orgLoading ? (
												<Box display="flex" justifyContent="center" p={3}>
													<CircularProgress size={30} />
												</Box>
											) : organization ? (
												<List>
													<ListItem>
														<ListItemAvatar>
															<Avatar sx={{ bgcolor: "primary.light" }}>
																<BusinessIcon />
															</Avatar>
														</ListItemAvatar>
														<ListItemText
															primary="Organization"
															secondary={organization.name || data?.cause.organizationName || "Organization"}
														/>
													</ListItem>

													{organization.email &&
														organization.email !== "Not available" && (
															<>
																<Divider variant="inset" component="li" />
																<ListItem>
																	<ListItemAvatar>
																		<Avatar sx={{ bgcolor: "primary.light" }}>
																			<EmailIcon />
																		</Avatar>
																	</ListItemAvatar>
																	<ListItemText
																		primary="Email"
																		secondary={organization.email}
																	/>
																</ListItem>
															</>
														)}

													{organization.phoneNumber &&
														organization.phoneNumber !== "Not available" && (
															<>
																<Divider variant="inset" component="li" />
																<ListItem>
																	<ListItemAvatar>
																		<Avatar sx={{ bgcolor: "primary.light" }}>
																			<PhoneIcon />
																		</Avatar>
																	</ListItemAvatar>
																	<ListItemText
																		primary="Phone"
																		secondary={organization.phoneNumber}
																	/>
																</ListItem>
															</>
														)}

													{organization.address && (
														<>
															<Divider variant="inset" component="li" />
															<ListItem>
																<ListItemAvatar>
																	<Avatar sx={{ bgcolor: "primary.light" }}>
																		<LocationIcon />
																	</Avatar>
																</ListItemAvatar>
																<ListItemText
																	primary="Address"
																	secondary={`${organization.address}${organization.city
																		? `, ${organization.city}`
																		: ""
																		}${organization.state
																			? `, ${organization.state}`
																			: ""
																		}${organization.country
																			? `, ${organization.country}`
																			: ""
																		}`}
																/>
															</ListItem>
														</>
													)}
												</List>
											) : (
												<Box p={3}>
													<Typography
														variant="body2"
														color="text.secondary"
														align="center"
													>
														Click below to view full organization details.
													</Typography>
												</Box>
											)}

											<Box display="flex" justifyContent="center" mt={2}>
												<Button
													variant="contained"
													color="primary"
													startIcon={<BusinessIcon />}
													onClick={handleViewOrganization}
												>
													View Full Organization Profile
												</Button>
											</Box>
										</CardContent>
									</Card>
								</Box>
							)}
						</Box>
					)}

					{activeTab === "donors" && (
						<Box
							display="flex"
							flexDirection="column"
							alignItems="center"
							py={4}
						>
							<Avatar
								sx={{
									width: 80,
									height: 80,
									bgcolor: "grey.200",
									mb: 2,
								}}
							>
								<PeopleIcon sx={{ width: 40, height: 40, color: "grey.500" }} />
							</Avatar>
							<Typography variant="h6" gutterBottom>
								{donorCount
									? `${donorCount} people have donated`
									: "No donors yet"}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{donorCount
									? "Thank you to all our donors for supporting this cause!"
									: "Be the first to support this cause!"}
							</Typography>

							{user?.role === "donor" && (
								<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 3 }}>
									{(acceptanceType === 'money' || acceptanceType === 'both') && (
										<Button
											variant="contained"
											color="primary"
											onClick={handleDonate}
											startIcon={<MoneyIcon />}
										>
											Donate Money
										</Button>
									)}

									{(acceptanceType === 'items' || acceptanceType === 'both') && (
										<Button
											variant={acceptanceType === 'both' ? "outlined" : "contained"}
											color="primary"
											onClick={handleDonate}
											startIcon={<CategoryIcon />}
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
