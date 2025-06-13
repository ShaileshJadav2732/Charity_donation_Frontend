"use client";

import { useGetCampaignDetailsWithDonationsQuery } from "@/store/api/campaignApi";
import {
	ArrowBack as ArrowBackIcon,
	CalendarMonth as CalendarIcon,
	Groups as GroupsIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Card,
	Chip,
	CircularProgress,
	IconButton,
	LinearProgress,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const StatusChip = ({ status }: { status: string }) => {
	const getStatusColor = (status: string) => {
		switch (status.toUpperCase()) {
			case "ACTIVE":
				return "success";
			case "DRAFT":
				return "default";
			case "PAUSED":
				return "warning";
			case "COMPLETED":
				return "info";
			case "CANCELLED":
				return "error";
			default:
				return "default";
		}
	};

	return (
		<Chip
			label={status}
			color={getStatusColor(status)}
			size="medium"
			sx={{ textTransform: "capitalize", fontWeight: 600 }}
		/>
	);
};

const CampaignDetailPage = () => {
	const params = useParams();
	const router = useRouter();

	const campaignId = params.id as string;

	const {
		data: campaignDetailsData,
		isLoading,
		error,
	} = useGetCampaignDetailsWithDonationsQuery(campaignId);

	const campaign = campaignDetailsData?.campaign;

	if (isLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="50vh"
			>
				<CircularProgress sx={{ color: "#287068" }} />
			</Box>
		);
	}

	if (error || !campaign) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">
					Failed to load campaign details. Please try again.
				</Alert>
			</Box>
		);
	}

	// Use real data from API
	const progress = campaign.progressPercentage || 0;
	const daysLeft = campaign.daysRemaining || 0;

	// Use aggregated donation items from API
	const allDonationItems = campaign.allDonationItems || [];

	return (
		<Box sx={{ backgroundColor: "#f8fffe", minHeight: "100vh" }}>
			{/* Hero Section with Background */}
			<Box
				sx={{
					background: "linear-gradient(135deg, #287068 0%, #2f8077 100%)",
					color: "white",
					py: 4,
					mb: 4,
				}}
			>
				<Box sx={{ maxWidth: "1200px", mx: "auto", px: 3 }}>
					{/* Header Navigation */}
					<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
						<IconButton
							onClick={() => router.back()}
							sx={{
								color: "white",
								backgroundColor: "rgba(255, 255, 255, 0.1)",
								"&:hover": {
									backgroundColor: "rgba(255, 255, 255, 0.2)",
								},
							}}
						>
							<ArrowBackIcon />
						</IconButton>
						<Typography
							variant="body2"
							sx={{ color: "rgba(255, 255, 255, 0.8)" }}
						>
							Back to Campaigns
						</Typography>
					</Stack>

					{/* Campaign Title and Status */}
					<Box sx={{ mb: 3 }}>
						<Stack
							direction={{ xs: "column", sm: "row" }}
							alignItems={{ xs: "flex-start", sm: "center" }}
							spacing={2}
							sx={{ mb: 2 }}
						>
							<Typography
								variant="h3"
								sx={{
									fontWeight: "bold",
									flexGrow: 1,
									fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
									lineHeight: 1.2,
								}}
							>
								{campaign.title}
							</Typography>
							<StatusChip status={campaign.status} />
						</Stack>

						{/* Campaign Meta Info */}
						<Stack direction="row" spacing={3} sx={{ mb: 2 }}>
							<Box display="flex" alignItems="center">
								<CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
								<Typography
									variant="body2"
									sx={{ color: "rgba(255, 255, 255, 0.9)" }}
								>
									{daysLeft} days remaining
								</Typography>
							</Box>
							<Box display="flex" alignItems="center">
								<GroupsIcon sx={{ mr: 1, fontSize: 20 }} />
								<Typography
									variant="body2"
									sx={{ color: "rgba(255, 255, 255, 0.9)" }}
								>
									{campaign.donorCount || 0} supporters
								</Typography>
							</Box>
						</Stack>

						{/* Quick Progress Overview */}
						{campaign.totalTargetAmount > 0 && (
							<Box sx={{ maxWidth: 400 }}>
								<Box display="flex" justifyContent="space-between" mb={1}>
									<Typography
										variant="body2"
										sx={{ color: "rgba(255, 255, 255, 0.9)" }}
									>
										₹{campaign.totalRaisedAmount.toLocaleString()} raised
									</Typography>
									<Typography
										variant="body2"
										sx={{ color: "rgba(255, 255, 255, 0.9)" }}
									>
										{progress.toFixed(0)}% of ₹
										{campaign.totalTargetAmount.toLocaleString()}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={progress}
									sx={{
										height: 8,
										borderRadius: 4,
										backgroundColor: "rgba(255, 255, 255, 0.2)",
										"& .MuiLinearProgress-bar": {
											backgroundColor: "white",
										},
									}}
								/>
							</Box>
						)}
					</Box>
				</Box>
			</Box>

			{/* Main Content Container */}
			<Box sx={{ maxWidth: "1200px", mx: "auto", px: 3 }}>
				{/* Main Content Grid */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
						gap: 4,
					}}
				>
					{/* Left Column - Description and Details */}
					<Box>
						{/* Description */}
						<Paper
							sx={{
								p: 4,
								mb: 3,
								borderRadius: 3,
								boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
								border: "1px solid rgba(40, 112, 104, 0.1)",
							}}
						>
							<Typography
								variant="h5"
								sx={{
									fontWeight: "bold",
									mb: 3,
									color: "#1a1a1a",
									position: "relative",
									"&::after": {
										content: '""',
										position: "absolute",
										bottom: -8,
										left: 0,
										width: 40,
										height: 3,
										backgroundColor: "#287068",
										borderRadius: 2,
									},
								}}
							>
								About This Campaign
							</Typography>
							<Typography
								variant="body1"
								sx={{
									lineHeight: 1.8,
									color: "#444",
									fontSize: "1.1rem",
									mt: 2,
								}}
							>
								{campaign.description}
							</Typography>
						</Paper>

						{/* Donation Items */}
						{allDonationItems.length > 0 && (
							<Paper
								sx={{
									p: 4,
									mb: 3,
									borderRadius: 3,
									boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
									border: "1px solid rgba(40, 112, 104, 0.1)",
									background:
										"linear-gradient(135deg, #f8fffe 0%, #ffffff 100%)",
								}}
							>
								<Typography
									variant="h5"
									sx={{
										fontWeight: "bold",
										mb: 3,
										color: "#1a1a1a",
										position: "relative",
										"&::after": {
											content: '""',
											position: "absolute",
											bottom: -8,
											left: 0,
											width: 40,
											height: 3,
											backgroundColor: "#287068",
											borderRadius: 2,
										},
									}}
								>
									Items Needed
								</Typography>
								<Box
									sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2 }}
								>
									{allDonationItems.map((item, index) => (
										<Chip
											key={index}
											label={item}
											sx={{
												backgroundColor: "#287068",
												color: "white",
												fontWeight: 600,
												fontSize: "0.9rem",
												height: 36,
												px: 1,
												borderRadius: 2,
												transition: "all 0.2s ease",
												"&:hover": {
													backgroundColor: "#1f5a52",
													transform: "translateY(-2px)",
													boxShadow: "0 4px 12px rgba(40, 112, 104, 0.3)",
												},
											}}
										/>
									))}
								</Box>
								<Box
									sx={{
										mt: 3,
										p: 2,
										backgroundColor: "rgba(40, 112, 104, 0.05)",
										borderRadius: 2,
										border: "1px solid rgba(40, 112, 104, 0.1)",
									}}
								>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ fontStyle: "italic" }}
									>
										💡 These items are needed across{" "}
										<strong>
											{campaign.causes?.filter(
												(c) => c.donationItems && c.donationItems.length > 0
											).length || 0}{" "}
											cause(s)
										</strong>{" "}
										in this campaign
									</Typography>
								</Box>
							</Paper>
						)}

						{/* Causes with Detailed Progress */}
						{campaign.causes && campaign.causes.length > 0 && (
							<Paper
								sx={{
									p: 4,
									borderRadius: 3,
									boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
									border: "1px solid rgba(40, 112, 104, 0.1)",
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										mb: 3,
									}}
								>
									<Typography
										variant="h5"
										sx={{
											fontWeight: "bold",
											color: "#1a1a1a",
											position: "relative",
											"&::after": {
												content: '""',
												position: "absolute",
												bottom: -8,
												left: 0,
												width: 40,
												height: 3,
												backgroundColor: "#287068",
												borderRadius: 2,
											},
										}}
									>
										🎯 Campaign Causes
									</Typography>
									<Chip
										label={`${campaign.causes.length} Cause${
											campaign.causes.length > 1 ? "s" : ""
										}`}
										sx={{
											backgroundColor: "#287068",
											color: "white",
											fontWeight: 600,
											fontSize: "0.9rem",
										}}
									/>
								</Box>

								{/* Causes Overview Stats */}
								<Box
									sx={{
										mb: 4,
										p: 3,
										backgroundColor: "rgba(40, 112, 104, 0.05)",
										borderRadius: 2,
									}}
								>
									<Typography
										variant="h6"
										sx={{ fontWeight: "bold", mb: 2, color: "#287068" }}
									>
										📊 Causes Overview
									</Typography>
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
											gap: 2,
										}}
									>
										<Box sx={{ textAlign: "center" }}>
											<Typography
												variant="h4"
												sx={{ fontWeight: "bold", color: "#287068" }}
											>
												{campaign.causes.length}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Total Causes
											</Typography>
										</Box>
										<Box sx={{ textAlign: "center" }}>
											<Typography
												variant="h4"
												sx={{ fontWeight: "bold", color: "#287068" }}
											>
												₹
												{campaign.causes
													.reduce(
														(sum, cause) => sum + (cause.targetAmount || 0),
														0
													)
													.toLocaleString()}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Combined Target
											</Typography>
										</Box>
										<Box sx={{ textAlign: "center" }}>
											<Typography
												variant="h4"
												sx={{ fontWeight: "bold", color: "#287068" }}
											>
												{
													campaign.causes.filter(
														(cause) =>
															cause.donationItems &&
															cause.donationItems.length > 0
													).length
												}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												With Items
											</Typography>
										</Box>
									</Box>
								</Box>

								{/* Individual Cause Cards */}
								<Stack spacing={3}>
									{campaign.causes.map((cause, index) => {
										// Use real data from API
										const causeProgress = cause.progressPercentage || 0;
										const raisedAmount = cause.raisedAmount || 0;

										return (
											<Card
												key={cause._id || index}
												sx={{
													p: 3,
													borderRadius: 3,
													border: "2px solid rgba(40, 112, 104, 0.1)",
													transition: "all 0.3s ease",
													"&:hover": {
														borderColor: "rgba(40, 112, 104, 0.3)",
														transform: "translateY(-2px)",
														boxShadow: "0 8px 24px rgba(40, 112, 104, 0.15)",
													},
												}}
											>
												{/* Cause Header */}
												<Box
													sx={{
														display: "flex",
														alignItems: "flex-start",
														justifyContent: "space-between",
														mb: 2,
													}}
												>
													<Box sx={{ flex: 1 }}>
														<Typography
															variant="h6"
															sx={{ fontWeight: 700, color: "#287068", mb: 1 }}
														>
															{cause.title}
														</Typography>
														<Typography
															variant="body1"
															color="text.secondary"
															sx={{ lineHeight: 1.6, mb: 2 }}
														>
															{cause.description}
														</Typography>
													</Box>
													<Chip
														label={cause.acceptanceType || "both"}
														size="small"
														sx={{
															backgroundColor:
																cause.acceptanceType === "money"
																	? "#4caf50"
																	: cause.acceptanceType === "items"
																	? "#ff9800"
																	: "#9c27b0",
															color: "white",
															fontWeight: 600,
															textTransform: "capitalize",
															ml: 2,
														}}
													/>
												</Box>

												{/* Progress Section */}
												{cause.targetAmount && cause.targetAmount > 0 && (
													<Box sx={{ mb: 3 }}>
														<Box
															sx={{
																display: "flex",
																justifyContent: "space-between",
																alignItems: "center",
																mb: 1,
															}}
														>
															<Typography
																variant="body2"
																color="text.secondary"
																sx={{ fontWeight: 500 }}
															>
																Funding Progress
															</Typography>
															<Typography
																variant="body2"
																sx={{ fontWeight: 600, color: "#287068" }}
															>
																{causeProgress.toFixed(1)}%
															</Typography>
														</Box>
														<LinearProgress
															variant="determinate"
															value={causeProgress}
															sx={{
																height: 8,
																borderRadius: 4,
																backgroundColor: "rgba(40, 112, 104, 0.1)",
																"& .MuiLinearProgress-bar": {
																	backgroundColor: "#287068",
																	borderRadius: 4,
																},
															}}
														/>
														<Box
															sx={{
																display: "flex",
																justifyContent: "space-between",
																mt: 1,
															}}
														>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																₹{raisedAmount.toLocaleString()} raised
															</Typography>
															<Typography
																variant="body2"
																sx={{ fontWeight: 600 }}
															>
																₹{cause.targetAmount.toLocaleString()} goal
															</Typography>
														</Box>
													</Box>
												)}

												{/* Donation Items */}
												{cause.donationItems &&
													cause.donationItems.length > 0 && (
														<Box sx={{ mb: 3 }}>
															<Typography
																variant="body2"
																sx={{
																	fontWeight: 600,
																	mb: 1,
																	color: "#287068",
																}}
															>
																📦 Needed Items ({cause.donationItems.length})
															</Typography>
															<Box
																sx={{
																	display: "flex",
																	flexWrap: "wrap",
																	gap: 1,
																}}
															>
																{[...new Set(cause.donationItems)]
																	.slice(0, 5)
																	.map((item, itemIndex) => (
																		<Chip
																			key={itemIndex}
																			label={item}
																			size="small"
																			variant="outlined"
																			sx={{
																				borderColor: "#287068",
																				color: "#287068",
																				fontSize: "0.75rem",
																				"&:hover": {
																					backgroundColor:
																						"rgba(40, 112, 104, 0.1)",
																				},
																			}}
																		/>
																	))}
																{[...new Set(cause.donationItems)].length >
																	5 && (
																	<Chip
																		label={`+${
																			[...new Set(cause.donationItems)].length -
																			5
																		} more`}
																		size="small"
																		sx={{
																			backgroundColor:
																				"rgba(40, 112, 104, 0.1)",
																			color: "#287068",
																			fontSize: "0.75rem",
																		}}
																	/>
																)}
															</Box>
														</Box>
													)}

												{/* Cause Actions */}
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "space-between",
														pt: 2,
														borderTop: "1px solid rgba(40, 112, 104, 0.1)",
													}}
												>
													<Box sx={{ display: "flex", gap: 2 }}>
														<Typography variant="body2" color="text.secondary">
															Cause #{index + 1}
														</Typography>
														{cause.targetAmount > 0 && (
															<Typography
																variant="body2"
																sx={{ fontWeight: 600, color: "#287068" }}
															>
																💰 ₹{cause.targetAmount.toLocaleString()}
															</Typography>
														)}
													</Box>
													<Button
														size="small"
														variant="outlined"
														sx={{
															borderColor: "#287068",
															color: "#287068",
															"&:hover": {
																borderColor: "#1f5a52",
																backgroundColor: "rgba(40, 112, 104, 0.1)",
															},
														}}
														onClick={() =>
															router.push(`/dashboard/causes/${cause._id}`)
														}
													>
														View Details
													</Button>
												</Box>
											</Card>
										);
									})}
								</Stack>
							</Paper>
						)}
					</Box>

					{/* Right Column - Progress and Stats */}
					<Box>
						<Paper
							sx={{
								p: 4,
								borderRadius: 3,
								position: "sticky",
								top: 100,
								boxShadow: "0 8px 32px rgba(40, 112, 104, 0.15)",
								border: "1px solid rgba(40, 112, 104, 0.1)",
								background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
							}}
						>
							{/* Progress Section */}
							{campaign.totalTargetAmount > 0 ? (
								<>
									<Typography
										variant="h5"
										sx={{
											fontWeight: "bold",
											mb: 3,

											color: "#1a1a1a",
											textAlign: "center",
										}}
									>
										🎯 Campaign Progress
									</Typography>

									{/* Large Progress Circle or Bar */}
									<Box sx={{ mb: 4, textAlign: "center" }}>
										<Typography
											variant="h2"
											sx={{
												fontWeight: "bold",
												color: "#287068",
												mb: 1,
											}}
										>
											{progress.toFixed(0)}%
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mb: 2 }}
										>
											of goal reached
										</Typography>
										<LinearProgress
											variant="determinate"
											value={progress}
											sx={{
												height: 12,
												borderRadius: 6,
												backgroundColor: "rgba(40, 112, 104, 0.1)",
												"& .MuiLinearProgress-bar": {
													backgroundColor: "#287068",
													borderRadius: 6,
												},
											}}
										/>
									</Box>

									{/* Amount Cards */}
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: 2,
											mb: 4,
										}}
									>
										<Box
											sx={{
												p: 2,
												backgroundColor: "rgba(40, 112, 104, 0.1)",
												borderRadius: 2,
												textAlign: "center",
											}}
										>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mb: 1 }}
											>
												💰 Raised
											</Typography>
											<Typography
												variant="h6"
												fontWeight="bold"
												color="#287068"
											>
												₹{campaign.totalRaisedAmount.toLocaleString()}
											</Typography>
										</Box>
										<Box
											sx={{
												p: 2,
												backgroundColor: "rgba(0, 0, 0, 0.05)",
												borderRadius: 2,
												textAlign: "center",
											}}
										>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mb: 1 }}
											>
												🎯 Goal
											</Typography>
											<Typography variant="h6" fontWeight="bold">
												₹{campaign.totalTargetAmount.toLocaleString()}
											</Typography>
										</Box>
									</Box>
								</>
							) : (
								<Alert severity="info" sx={{ mb: 3 }}>
									<Typography variant="body2">
										<strong>Items-only campaign</strong> - No monetary target
										set
									</Typography>
								</Alert>
							)}

							{/* Campaign Stats */}
							<Box sx={{ mb: 3 }}>
								<Typography
									variant="h6"
									sx={{ fontWeight: "bold", mb: 2, color: "#1a1a1a" }}
								>
									📊 Campaign Stats
								</Typography>
								<Stack spacing={2}>
									<Box
										sx={{
											p: 2,
											backgroundColor: "rgba(40, 112, 104, 0.05)",
											borderRadius: 2,
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
										}}
									>
										<Box display="flex" alignItems="center">
											<GroupsIcon sx={{ mr: 1, color: "#287068" }} />
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ fontWeight: 500 }}
											>
												Supporters
											</Typography>
										</Box>
										<Typography variant="h6" fontWeight="bold" color="#287068">
											{campaign.donorCount || 0}
										</Typography>
									</Box>
									<Box
										sx={{
											p: 2,
											backgroundColor: "rgba(40, 112, 104, 0.05)",
											borderRadius: 2,
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
										}}
									>
										<Box display="flex" alignItems="center">
											<CalendarIcon sx={{ mr: 1, color: "#287068" }} />
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ fontWeight: 500 }}
											>
												Days Left
											</Typography>
										</Box>
										<Typography variant="h6" fontWeight="bold" color="#287068">
											{daysLeft}
										</Typography>
									</Box>
								</Stack>
							</Box>
						</Paper>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default CampaignDetailPage;
