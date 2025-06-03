"use client";

import {
	useGetCauseByIdQuery,
	useGetOrganizationUserIdByCauseIdQuery,
} from "@/store/api/causeApi";
import { useGetOrganizationByCauseIdQuery } from "@/store/api/organizationApi";
import { RootState } from "@/store/store";
import { DonationType } from "@/types/donation";
import StartConversationButton from "@/components/messaging/StartConversationButton";

import {
	ArrowBack,
	Bloodtype,
	Business,
	CalendarToday,
	Category,
	Email,
	Fastfood,
	Living,
	LocalMall,
	LocationOn,
	MonetizationOn,
	Phone,
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
	Tab,
	Tabs,
	Typography,
	useTheme,
} from "@mui/material";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { use } from "react";
const donationTypeIcons = {
	[DonationType.MONEY]: MonetizationOn,
	[DonationType.BLOOD]: Bloodtype,
	[DonationType.FOOD]: Fastfood,
	[DonationType.TOYS]: Category,
	[DonationType.BOOKS]: Category,
	[DonationType.FURNITURE]: Living,
	[DonationType.HOUSEHOLD]: Living,

	CLOTHES: LocalMall,
	OTHER: Category,
};

export default function CauseDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("about");
	const { user } = useSelector((state: RootState) => state.auth);
	const theme = useTheme();

	const { data, isLoading, error } = useGetCauseByIdQuery(id);
	const { data: organizationData } = useGetOrganizationByCauseIdQuery(id, {
		skip: !id,
	});

	// Get organization User ID for messaging using the new dedicated API
	const { data: orgUserIdData } = useGetOrganizationUserIdByCauseIdQuery(id, {
		skip: !id || user?.role !== "donor", // Only fetch for donors
	});

	const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
		setActiveTab(newValue);
	};

	const handleDonate = () => router.push(`/dashboard/donate/${id}`);
	const handleBack = () => router.push("/dashboard/causes");

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					p: 4,
					minHeight: "80vh",
					alignItems: "center",
				}}
			>
				<CircularProgress size={60} thickness={4} />
			</Box>
		);
	}

	if (error || !data) {
		let errorMessage = "Unable to load cause details.";
		if (error && "status" in error) {
			const fetchError = error as FetchBaseQueryError;
			errorMessage =
				fetchError.status === 404
					? "Cause not found."
					: fetchError.status === 403
					? "Access denied."
					: fetchError.status === 401
					? "Please log in."
					: "An error occurred.";
		}

		return (
			<Box sx={{ p: 4 }}>
				<Alert severity="error" sx={{ mb: 2 }}>
					{errorMessage}
				</Alert>
				<Button
					startIcon={<ArrowBack />}
					onClick={handleBack}
					variant="outlined"
					sx={{
						borderColor: theme.palette.primary.main,
						color: theme.palette.primary.main,
						"&:hover": {
							backgroundColor: theme.palette.primary.light,
							borderColor: theme.palette.primary.dark,
						},
					}}
				>
					Back to Causes
				</Button>
			</Box>
		);
	}

	const { cause } = data;
	const organization = organizationData?.organization;
	const progress =
		cause.raisedAmount && cause.targetAmount
			? Math.min(
					100,
					Math.round((cause.raisedAmount / cause.targetAmount) * 100)
			  )
			: 0;
	const acceptanceType = cause.acceptanceType || "money";
	const donationItems = cause.donationItems || [];
	const acceptedDonationTypes = cause.acceptedDonationTypes || [
		DonationType.MONEY,
	];
	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);

	const urgency = progress < 30 ? "High" : progress < 70 ? "Medium" : "Low";
	const urgencyColor =
		progress < 30
			? theme.palette.error.main
			: progress < 70
			? theme.palette.warning.main
			: theme.palette.success.main;

	return (
		<Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
			<Button
				startIcon={<ArrowBack />}
				onClick={handleBack}
				sx={{
					mb: 3,
					color: theme.palette.primary.main,
					fontWeight: 600,
					"&:hover": {
						backgroundColor: theme.palette.primary.light,
					},
				}}
				variant="text"
			>
				Back to Causes
			</Button>

			<Card
				sx={{
					borderRadius: 3,
					boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
					overflow: "hidden",
				}}
			>
				{/* Hero Section */}
				<Box
					sx={{
						height: { xs: 240, md: 360 },
						position: "relative",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
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
								opacity: 0.9,
							}}
						/>
					) : (
						<Category
							sx={{
								fontSize: 80,
								color: "white",
								opacity: 0.7,
							}}
						/>
					)}

					<Box
						sx={{
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							height: "40%",
							background:
								"linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
						}}
					/>

					<Chip
						label={`${urgency} Priority`}
						sx={{
							position: "absolute",
							top: 16,
							right: 16,
							bgcolor: urgencyColor,
							color: "white",
							fontWeight: 600,
							fontSize: "0.875rem",
							px: 1.5,
							py: 0.5,
						}}
					/>

					<Typography
						variant="h3"
						sx={{
							position: "absolute",
							bottom: 24,
							left: 24,
							color: "white",
							fontWeight: 700,
							textShadow: "0 2px 4px rgba(0,0,0,0.3)",
							maxWidth: "80%",
						}}
					>
						{cause.title || "Untitled Cause"}
					</Typography>
				</Box>

				<CardContent sx={{ p: { xs: 3, md: 4 } }}>
					{/* Organization Info */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							mb: 4,
							backgroundColor: theme.palette.grey[50],
							p: 2,
							borderRadius: 2,
							borderLeft: `4px solid ${theme.palette.primary.main}`,
						}}
					>
						<Avatar
							sx={{
								bgcolor: theme.palette.primary.main,
								mr: 2,
								width: 56,
								height: 56,
							}}
						>
							<Business sx={{ fontSize: 28 }} />
						</Avatar>
						<Box>
							<Typography
								variant="h6"
								sx={{
									color: theme.palette.text.primary,
									fontWeight: 600,
								}}
							>
								{cause.organizationName || "Organization"}
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: theme.palette.text.secondary,
									mt: 0.5,
								}}
							>
								Managing this cause
							</Typography>
						</Box>
					</Box>

					{/* Stats Grid */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
							gap: 3,
							mb: 4,
						}}
					>
						<Card
							sx={{
								height: "100%",
								borderLeft: `4px solid ${theme.palette.primary.main}`,
								boxShadow: "none",
							}}
						>
							<CardContent>
								<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
									<Avatar
										sx={{
											bgcolor: theme.palette.primary.light,
											color: theme.palette.primary.main,
											mr: 2,
											width: 48,
											height: 48,
										}}
									>
										<MonetizationOn />
									</Avatar>
									<Box>
										<Typography variant="body2" color="text.secondary">
											Raised
										</Typography>
										<Typography
											variant="h5"
											sx={{
												color: theme.palette.primary.main,
												fontWeight: 700,
											}}
										>
											{formatCurrency(cause.raisedAmount || 0)}
										</Typography>
									</Box>
								</Box>
								<Typography variant="body2" color="text.secondary">
									of {formatCurrency(cause.targetAmount || 0)} goal
								</Typography>
							</CardContent>
						</Card>

						<Card
							sx={{
								height: "100%",
								borderLeft: `4px solid ${theme.palette.secondary.main}`,
								boxShadow: "none",
							}}
						>
							<CardContent>
								<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
									<Avatar
										sx={{
											bgcolor: theme.palette.secondary.light,
											color: theme.palette.secondary.main,
											mr: 2,
											width: 48,
											height: 48,
										}}
									>
										<CalendarToday />
									</Avatar>
									<Box>
										<Typography variant="body2" color="text.secondary">
											Created
										</Typography>
										<Typography
											variant="h5"
											sx={{
												color: theme.palette.secondary.main,
												fontWeight: 700,
											}}
										>
											{cause.createdAt
												? new Date(cause.createdAt).toLocaleDateString()
												: "N/A"}
										</Typography>
									</Box>
								</Box>
								<Typography variant="body2" color="text.secondary">
									{cause.endDate
										? `Ends ${new Date(cause.endDate).toLocaleDateString()}`
										: "Ongoing"}
								</Typography>
							</CardContent>
						</Card>
					</Box>

					{/* Progress Section */}
					<Box
						sx={{
							mb: 4,
							p: 3,
							borderRadius: 2,
							backgroundColor: theme.palette.grey[50],
							border: `1px solid ${theme.palette.divider}`,
						}}
					>
						<Box
							sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
						>
							<Typography variant="body1" fontWeight={500}>
								{progress}% funded
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{urgency} priority
							</Typography>
						</Box>

						<LinearProgress
							variant="determinate"
							value={progress}
							sx={{
								height: 10,
								borderRadius: 5,
								mb: 1,
								bgcolor: theme.palette.grey[300],
								"& .MuiLinearProgress-bar": {
									bgcolor: urgencyColor,
									borderRadius: 5,
								},
							}}
						/>

						<Box sx={{ display: "flex", justifyContent: "space-between" }}>
							<Typography variant="body2" color="text.secondary">
								{formatCurrency(cause.raisedAmount || 0)} raised
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{formatCurrency(cause.targetAmount || 0)} goal
							</Typography>
						</Box>
					</Box>

					{/* Organization Details */}
					{cause.organizationName && (
						<Box sx={{ mb: 4 }}>
							<Typography
								variant="h5"
								sx={{
									mb: 3,
									fontWeight: 700,
									color: theme.palette.text.primary,
								}}
							>
								About the Organization
							</Typography>
							<Card
								sx={{
									p: 3,
									border: `1px solid ${theme.palette.divider}`,
									backgroundColor: theme.palette.background.paper,
									boxShadow: "none",
								}}
							>
								<Box
									sx={{
										display: "flex",
										flexDirection: { xs: "column", md: "row" },
										gap: 3,
									}}
								>
									<Avatar
										sx={{
											bgcolor: theme.palette.primary.main,
											width: 100,
											height: 100,
											fontSize: 40,
										}}
									>
										<Business sx={{ fontSize: 48 }} />
									</Avatar>
									<Box sx={{ flex: 1 }}>
										<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
											{cause.organizationName}
										</Typography>

										<Box
											sx={{
												display: "grid",
												gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
												gap: 2,
												mb: 2,
											}}
										>
											{organization?.email && (
												<Box sx={{ display: "flex", alignItems: "center" }}>
													<Email
														sx={{
															mr: 1.5,
															color: theme.palette.text.secondary,
															fontSize: 20,
														}}
													/>
													<Typography variant="body2" color="text.secondary">
														{organization.email}
													</Typography>
												</Box>
											)}
											{organization?.phoneNumber && (
												<Box sx={{ display: "flex", alignItems: "center" }}>
													<Phone
														sx={{
															mr: 1.5,
															color: theme.palette.text.secondary,
															fontSize: 20,
														}}
													/>
													<Typography variant="body2" color="text.secondary">
														{organization.phoneNumber}
													</Typography>
												</Box>
											)}
											{organization?.address && (
												<Box
													sx={{
														display: "flex",
														alignItems: "flex-start",
														gridColumn: { xs: "1", md: "1 / -1" },
													}}
												>
													<LocationOn
														sx={{
															mr: 1.5,
															color: theme.palette.text.secondary,
															fontSize: 20,
															mt: 0.5,
														}}
													/>
													<Typography variant="body2" color="text.secondary">
														{`${organization.address}${
															organization.city ? `, ${organization.city}` : ""
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
										</Box>

										<Typography
											variant="body1"
											color="text.secondary"
											sx={{ mt: 1, lineHeight: 1.6 }}
										>
											{organization?.description || "Managing this cause."}
										</Typography>
									</Box>
								</Box>
							</Card>
						</Box>
					)}

					{/* Tags/Categories */}
					{cause.tags && cause.tags.length > 0 && (
						<Box sx={{ mb: 4 }}>
							<Typography
								variant="h5"
								sx={{
									mb: 2,
									fontWeight: 700,
									color: theme.palette.text.primary,
								}}
							>
								Categories
							</Typography>
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
								{cause.tags.map((tag) => (
									<Chip
										key={tag}
										label={tag}
										sx={{
											bgcolor: theme.palette.primary.light,
											color: theme.palette.primary.dark,
											px: 1.5,
											py: 1,
											fontSize: "0.875rem",
											"& .MuiChip-label": {
												px: 0.5,
											},
										}}
									/>
								))}
							</Box>
						</Box>
					)}

					{/* Tabbed Content */}
					<Card
						sx={{
							borderRadius: 2,
							boxShadow: "none",
							border: `1px solid ${theme.palette.divider}`,
						}}
					>
						<Tabs
							value={activeTab}
							onChange={handleTabChange}
							sx={{
								borderBottom: `1px solid ${theme.palette.divider}`,
								"& .MuiTab-root": {
									color: theme.palette.text.secondary,
									textTransform: "none",
									fontSize: "1rem",
									fontWeight: 500,
									minHeight: 60,
									"&.Mui-selected": {
										color: theme.palette.primary.main,
										fontWeight: 600,
									},
								},
								"& .MuiTabs-indicator": {
									bgcolor: theme.palette.primary.main,
									height: 3,
								},
							}}
						>
							<Tab label="About the Cause" value="about" />
						</Tabs>
						<CardContent sx={{ p: { xs: 2, md: 4 } }}>
							{activeTab === "about" && (
								<Box>
									<Typography
										variant="h5"
										sx={{
											mb: 3,
											fontWeight: 700,
											color: theme.palette.text.primary,
										}}
									>
										Our Mission
									</Typography>
									<Typography
										sx={{
											mb: 4,
											lineHeight: 1.8,
											fontSize: "1.1rem",
											color: theme.palette.text.secondary,
										}}
									>
										{cause.description || "No description available."}
									</Typography>

									<Divider sx={{ my: 4 }} />

									<Typography
										variant="h5"
										sx={{
											mb: 3,
											fontWeight: 700,
											color: theme.palette.text.primary,
										}}
									>
										How You Can Help
									</Typography>
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
											gap: 3,
											mb: 3,
										}}
									>
										{acceptedDonationTypes.map((type: DonationType) => {
											const TypeIcon = donationTypeIcons[type] || Category;
											// Fix: Define the title based on the donation type
											const getTypeTitle = (donationType: DonationType) => {
												switch (donationType) {
													case DonationType.MONEY:
														return "Money Donations";
													case DonationType.BLOOD:
														return "Blood Donations";
													case DonationType.FOOD:
														return "Food Donations";
													case DonationType.TOYS:
														return "Toy Donations";
													case DonationType.BOOKS:
														return "Book Donations";
													case DonationType.FURNITURE:
														return "Furniture Donations";
													case DonationType.HOUSEHOLD:
														return "Household Items";
													default:
														return "Other Donations";
												}
											};

											const title = getTypeTitle(type);

											return (
												<Card
													key={type}
													sx={{
														height: "100%",
														border: `1px solid ${theme.palette.divider}`,
														boxShadow: "none",
														"&:hover": {
															borderColor: theme.palette.primary.main,
															transform: "translateY(-4px)",
															boxShadow: `0 6px 16px ${theme.palette.primary.light}`,
														},
														transition: "all 0.3s ease",
													}}
												>
													<CardContent sx={{ p: 3 }}>
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																mb: 2,
															}}
														>
															<Avatar
																sx={{
																	bgcolor: theme.palette.primary.light,
																	color: theme.palette.primary.main,
																	mr: 2,
																	width: 48,
																	height: 48,
																}}
															>
																<TypeIcon />
															</Avatar>
															<Typography
																variant="h6"
																sx={{
																	color: theme.palette.text.primary,
																	fontWeight: 600,
																}}
															>
																{title}
															</Typography>
														</Box>
														<Typography
															variant="body2"
															sx={{ color: theme.palette.text.secondary }}
														>
															Support this cause with {title.toLowerCase()}.
															Your contribution will make a direct impact.
														</Typography>
													</CardContent>
												</Card>
											);
										})}
									</Box>

									{(acceptanceType === "items" || acceptanceType === "both") &&
										donationItems.length > 0 && (
											<Box>
												<Typography
													variant="h5"
													sx={{
														mb: 2,
														fontWeight: 700,
														color: theme.palette.text.primary,
													}}
												>
													Items Needed
												</Typography>
												<Box
													sx={{
														display: "flex",
														flexWrap: "wrap",
														gap: 1.5,
														mb: 3,
													}}
												>
													{donationItems.map((item: string, index: number) => (
														<Chip
															key={index}
															label={item}
															sx={{
																bgcolor: theme.palette.secondary.light,
																color: theme.palette.secondary.dark,
																px: 2,
																py: 1.5,
																fontSize: "0.9rem",
																"& .MuiChip-label": {
																	px: 1,
																},
															}}
														/>
													))}
												</Box>
											</Box>
										)}
								</Box>
							)}
						</CardContent>
					</Card>
					{/* Donation Buttons - Only show for donors */}
					{user?.role === "donor" && (
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
								gap: 2,
								mb: 4,
							}}
						>
							{(acceptanceType === "money" || acceptanceType === "both") && (
								<Button
									variant="contained"
									size="large"
									startIcon={<MonetizationOn />}
									onClick={handleDonate}
									sx={{
										bgcolor: theme.palette.primary.main,
										py: 1.5,
										fontSize: "1rem",
										"&:hover": {
											bgcolor: theme.palette.primary.dark,
											transform: "translateY(-2px)",
											boxShadow: `0 4px 12px ${theme.palette.primary.light}`,
										},
										transition: "all 0.2s ease",
										boxShadow: "none",
									}}
								>
									Donate Money
								</Button>
							)}
							{(acceptanceType === "items" || acceptanceType === "both") && (
								<Button
									variant={acceptanceType === "both" ? "outlined" : "contained"}
									size="large"
									startIcon={<Category />}
									onClick={handleDonate}
									sx={{
										bgcolor:
											acceptanceType === "both"
												? "transparent"
												: theme.palette.secondary.main,
										borderColor: theme.palette.secondary.main,
										color:
											acceptanceType === "both"
												? theme.palette.secondary.main
												: "white",
										py: 1.5,
										fontSize: "1rem",
										"&:hover": {
											bgcolor: theme.palette.secondary.main,
											color: "white",
											transform: "translateY(-2px)",
											boxShadow: `0 4px 12px ${theme.palette.secondary.light}`,
										},
										transition: "all 0.2s ease",
										boxShadow: "none",
									}}
								>
									Donate Items
								</Button>
							)}
						</Box>
					)}

					{/* Message Organization Button - Only show for donors */}
					{user?.role === "donor" &&
						orgUserIdData?.data?.organizationUserId && (
							<Box sx={{ mb: 3 }}>
								{/* Use organizationUserId from dedicated API (cause ID → organization.userId) */}
								<StartConversationButton
									recipientId={orgUserIdData.data.organizationUserId}
									recipientType="user"
									recipientName={
										orgUserIdData.data.organizationName ||
										cause.organizationName ||
										"Organization"
									}
									recipientRole="organization"
									relatedCause={cause.id}
									variant="button"
									size="large"
									fullWidth
								/>
							</Box>
						)}
				</CardContent>
			</Card>
		</Box>
	);
}
