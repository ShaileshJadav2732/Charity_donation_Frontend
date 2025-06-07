"use client";

import React from "react";
import {
	Box,
	Typography,
	Card,
	CardContent,
	Button,
	Avatar,
	Chip,
	LinearProgress,
	Divider,
	Paper,
	Alert,
} from "@mui/material";
import {
	Heart,
	TrendingUp,
	Target,
	Plus,
	ArrowRight,
	Gift,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useGetDonorDonationsQuery } from "@/store/api/donationApi";
import { useGetActiveCampaignCausesQuery } from "@/store/api/causeApi";
import { useRouter } from "next/navigation";
import { Cause } from "@/types/cause";

const DonorHomePage: React.FC = () => {
	const { user } = useSelector((state: RootState) => state.auth);
	const { data: donationsData } = useGetDonorDonationsQuery({
		page: 1,
		limit: 100, // Get more donations to calculate stats
	});
	const {
		data: causesData,
		isLoading: causesLoading,
		error: causesError,
	} = useGetActiveCampaignCausesQuery({
		limit: 6,
		page: 1,
	});

	const router = useRouter();

	// Use real donations data - handle the actual API response structure
	const donations = Array.isArray(donationsData?.data)
		? donationsData.data
		: [];
	const stats = {
		totalDonations: donations.length || 0,
		totalAmount: Array.isArray(donations)
			? donations.reduce(
					(sum: number, donation: { amount?: number }) =>
						sum + (donation.amount || 0),
					0
			  )
			: 0,
		causesSupported: Array.isArray(donations)
			? new Set(
					donations
						.map((d: { cause?: { _id?: string } }) => d.cause?._id)
						.filter(Boolean)
			  ).size
			: 0,
		organizationsSupported: Array.isArray(donations)
			? new Set(
					donations
						.map(
							(d: { organization?: { _id?: string } }) => d.organization?._id
						)
						.filter(Boolean)
			  ).size
			: 0,
		recentDonations: Array.isArray(donations) ? donations.slice(0, 5) : [],
	};

	// Use real causes data
	const realCauses = causesData?.causes || [];

	// Transform real causes into featured causes with urgency calculation
	const featuredCauses = realCauses.slice(0, 3).map((cause: Cause) => {
		// Ensure we have valid numbers for calculation
		const raised =
			typeof cause.raisedAmount === "number" ? cause.raisedAmount : 0;
		const goal =
			typeof cause.targetAmount === "number" && cause.targetAmount > 0
				? cause.targetAmount
				: 1;
		const progressPercentage = (raised / goal) * 100;

		// Determine urgency based on progress and time factors
		let urgency = "Low";
		if (progressPercentage < 30) {
			urgency = "High";
		} else if (progressPercentage < 70) {
			urgency = "Medium";
		}

		return {
			id: cause.id, // Use the id field from Cause type
			title: cause.title,
			organization: cause.organizationName || "Organization",
			description: cause.description,
			raised: raised,
			goal: goal,
			urgency: urgency,
			image: cause.imageUrl || "/api/placeholder/300/200",
			tags: cause.tags || [],
			acceptanceType: cause.acceptanceType,
			donationItems: cause.donationItems || [],
		};
	});

	const getUrgencyColor = (urgency: string) => {
		switch (urgency) {
			case "High":
				return "#ef4444";
			case "Medium":
				return "#f59e0b";
			case "Low":
				return "#10b981";
			default:
				return "#6b7280";
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	};

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	return (
		<Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
			{/* Welcome Section */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 1 }}
				>
					{getGreeting()},{" "}
					{(user as { firstName?: string; email?: string })?.firstName ||
						user?.email?.split("@")[0]}
					!
				</Typography>
				<Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
					Thank you for making a difference. Your generosity is changing lives.
				</Typography>

				{/* Quick Impact Summary */}
				<Paper
					sx={{
						p: 3,
						background: "linear-gradient(135deg, #287068 0%, #2f8077 100%)",
						color: "white",
						borderRadius: 3,
					}}
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", md: "row" },
							gap: 3,
							alignItems: "center",
						}}
					>
						<Box sx={{ flex: 1 }}>
							<Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
								Your Impact So Far
							</Typography>
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: {
										xs: "repeat(2, 1fr)",
										sm: "repeat(4, 1fr)",
									},
									gap: 3,
								}}
							>
								<Box>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{formatCurrency(stats.totalAmount)}
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Total Donated
									</Typography>
								</Box>
								<Box>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{stats.causesSupported}
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Causes Supported
									</Typography>
								</Box>
								<Box>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{stats.organizationsSupported}
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Organizations
									</Typography>
								</Box>
								<Box>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{stats.totalDonations}
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Total Donations
									</Typography>
								</Box>
							</Box>
						</Box>
						<Box sx={{ textAlign: "center" }}>
							<Button
								variant="contained"
								size="large"
								startIcon={<Plus />}
								onClick={() => router.push("/dashboard/causes")}
								sx={{
									backgroundColor: "white",
									color: "#287068",
									fontWeight: 600,
									px: 4,
									py: 1.5,
									"&:hover": {
										backgroundColor: "#f8f9fa",
									},
								}}
							>
								Make a Donation
							</Button>
						</Box>
					</Box>
				</Paper>
			</Box>

			{/* Quick Actions */}
			<Box sx={{ mb: 4 }}>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
						gap: 3,
					}}
				>
					<Card
						sx={{
							p: 2,
							textAlign: "center",
							cursor: "pointer",
							transition: "all 0.2s",
							"&:hover": {
								transform: "translateY(-4px)",
								boxShadow: "0 8px 25px rgba(40, 112, 104, 0.15)",
							},
						}}
						onClick={() => router.push("/dashboard/causes")}
					>
						<Avatar
							sx={{
								backgroundColor: "#287068",
								width: 56,
								height: 56,
								mx: "auto",
								mb: 2,
							}}
						>
							<Heart size={24} />
						</Avatar>
						<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
							Browse Causes
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Discover causes that need your support
						</Typography>
					</Card>
					<Card
						sx={{
							p: 2,
							textAlign: "center",
							cursor: "pointer",
							transition: "all 0.2s",
							"&:hover": {
								transform: "translateY(-4px)",
								boxShadow: "0 8px 25px rgba(40, 112, 104, 0.15)",
							},
						}}
						onClick={() => router.push("/dashboard/donations")}
					>
						<Avatar
							sx={{
								backgroundColor: "#2f8077",
								width: 56,
								height: 56,
								mx: "auto",
								mb: 2,
							}}
						>
							<Gift size={24} />
						</Avatar>
						<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
							My Donations
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Track your donation history and status
						</Typography>
					</Card>
					<Card
						sx={{
							p: 2,
							textAlign: "center",
							cursor: "pointer",
							transition: "all 0.2s",
							"&:hover": {
								transform: "translateY(-4px)",
								boxShadow: "0 8px 25px rgba(40, 112, 104, 0.15)",
							},
						}}
						onClick={() => router.push("/dashboard/analytics")}
					>
						<Avatar
							sx={{
								backgroundColor: "#4a9b8e",
								width: 56,
								height: 56,
								mx: "auto",
								mb: 2,
							}}
						>
							<TrendingUp size={24} />
						</Avatar>
						<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
							View Analytics
						</Typography>
						<Typography variant="body2" color="text.secondary">
							See detailed insights about your impact
						</Typography>
					</Card>
				</Box>
			</Box>

			{/* Featured Urgent Causes */}
			<Box sx={{ mb: 4 }}>
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
						sx={{ fontWeight: "bold", color: "#1a1a1a" }}
					>
						Urgent Causes {causesLoading && "(Loading...)"}
					</Typography>
					<Button
						endIcon={<ArrowRight size={16} />}
						onClick={() => router.push("/dashboard/causes")}
						sx={{ color: "#287068", fontWeight: 600 }}
					>
						View All
					</Button>
				</Box>

				{/* Error state */}
				{causesError && (
					<Box
						sx={{ p: 2, backgroundColor: "#ffebee", borderRadius: 2, mb: 2 }}
					>
						<Typography color="error">
							Error loading causes: {JSON.stringify(causesError)}
						</Typography>
					</Box>
				)}

				{/* No data state */}
				{!causesLoading && !causesError && featuredCauses.length === 0 && (
					<Box
						sx={{ p: 2, backgroundColor: "#fff3e0", borderRadius: 2, mb: 2 }}
					>
						<Typography color="warning.main">
							No causes available at the moment.
						</Typography>
					</Box>
				)}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
						gap: 3,
					}}
				>
					{featuredCauses.map((cause) => (
						<Card
							key={cause.id}
							onClick={() => router.push(`/dashboard/causes/${cause.id}`)}
							sx={{
								height: "100%",
								cursor: "pointer",
								transition: "all 0.2s",
								"&:hover": {
									transform: "translateY(-4px)",
									boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
								},
							}}
						>
							<Box
								sx={{
									height: 160,
									background: `linear-gradient(45deg, ${getUrgencyColor(
										cause.urgency
									)}20, ${getUrgencyColor(cause.urgency)}40)`,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									position: "relative",
								}}
							>
								<Chip
									label={`${cause.urgency} Priority`}
									size="small"
									sx={{
										position: "absolute",
										top: 12,
										right: 12,
										backgroundColor: getUrgencyColor(cause.urgency),
										color: "white",
										fontWeight: 600,
									}}
								/>
								<Target size={48} color={getUrgencyColor(cause.urgency)} />
							</Box>
							<CardContent>
								<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
									{cause.title}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 1 }}
								>
									{cause.organization}
								</Typography>
								<Typography variant="body2" sx={{ mb: 2 }}>
									{cause.description}
								</Typography>
								{/* Progress bar for causes that accept monetary donations */}
								{cause.acceptanceType !== "items" && cause.goal > 0 ? (
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
											<Typography variant="body2" sx={{ fontWeight: 600 }}>
												{Math.round((cause.raised / cause.goal) * 100)}%
											</Typography>
										</Box>
										<LinearProgress
											variant="determinate"
											value={
												Math.min(
													100,
													Math.max(0, (cause.raised / cause.goal) * 100)
												) || 25
											} // Fallback to 25% for testing
											sx={{
												height: 8,
												borderRadius: 4,
												backgroundColor: "#f0f0f0",
												"& .MuiLinearProgress-bar": {
													backgroundColor: getUrgencyColor(cause.urgency),
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
													{formatCurrency(cause.raised)}
												</Typography>
											</Box>
											<Box sx={{ textAlign: "right" }}>
												<Typography variant="body2" color="text.secondary">
													Goal
												</Typography>
												<Typography variant="h6" sx={{ fontWeight: 600 }}>
													{formatCurrency(cause.goal)}
												</Typography>
											</Box>
										</Box>
									</Box>
								) : null}

								{/* Items section for causes that accept items */}
								{cause.acceptanceType !== "money" ? (
									<Box sx={{ mb: 2 }}>
										{cause.acceptanceType === "items" ? (
											<Alert severity="info" sx={{ py: 1, mb: 1 }}>
												<Typography variant="body2">
													<strong>Items-only cause</strong> - This cause accepts
													item donations only
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
											<Box display="flex" gap={0.5} flexWrap="wrap">
												{cause.donationItems.slice(0, 2).map((item, index) => (
													<Chip
														key={index}
														label={item}
														size="small"
														variant="outlined"
														sx={{
															borderRadius: 1,
															fontSize: "0.7rem",
															height: 22,
															borderColor: getUrgencyColor(cause.urgency),
															color: getUrgencyColor(cause.urgency),
														}}
													/>
												))}
												{cause.donationItems.length > 2 && (
													<Chip
														label={`+${cause.donationItems.length - 2} more`}
														size="small"
														variant="outlined"
														sx={{
															borderRadius: 1,
															fontSize: "0.7rem",
															height: 22,
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
								<Button
									variant="contained"
									fullWidth
									onClick={(e) => {
										e.stopPropagation(); // Prevent card click
										router.push(`/dashboard/donate/${cause.id}`);
									}}
									sx={{
										backgroundColor: "#287068",
										"&:hover": {
											backgroundColor: "#1f5a52",
										},
									}}
								>
									Donate Now
								</Button>
							</CardContent>
						</Card>
					))}
				</Box>
			</Box>

			{/* Recent Activity */}
			{stats.recentDonations && stats.recentDonations.length > 0 && (
				<Box sx={{ mb: 4 }}>
					<Typography
						variant="h5"
						sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 3 }}
					>
						Recent Activity
					</Typography>
					<Card>
						<CardContent sx={{ p: 0 }}>
							{stats.recentDonations.slice(0, 5).map(
								(
									donation: {
										_id?: string;
										amount?: number;
										type?: string;
										cause?: { title?: string };
										organization?: { name?: string };
										status?: string;
										createdAt?: string;
										quantity?: number;
										unit?: string;
									},
									index: number
								) => (
									<Box key={donation._id || index}>
										<Box
											sx={{
												p: 3,
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
											}}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													flex: 1,
												}}
											>
												<Avatar
													sx={{
														backgroundColor: "#287068",
														width: 40,
														height: 40,
														mr: 2,
													}}
												>
													<Heart size={20} />
												</Avatar>
												<Box>
													<Typography
														variant="subtitle1"
														sx={{ fontWeight: 600 }}
													>
														{donation.cause?.title || "Donation"}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{donation.organization?.name || "Organization"}
													</Typography>
													<Typography variant="caption" color="text.secondary">
														{donation.createdAt
															? new Date(
																	donation.createdAt
															  ).toLocaleDateString()
															: "Unknown date"}
													</Typography>
												</Box>
											</Box>
											<Box sx={{ textAlign: "right" }}>
												<Chip
													label={donation.status}
													size="small"
													color={
														donation.status === "CONFIRMED"
															? "success"
															: donation.status === "PENDING"
															? "warning"
															: "info"
													}
													sx={{ mb: 1 }}
												/>
												{donation.amount && (
													<Typography
														variant="subtitle2"
														sx={{ fontWeight: 600 }}
													>
														{formatCurrency(donation.amount)}
													</Typography>
												)}
											</Box>
										</Box>
										{index < Math.min(stats.recentDonations.length - 1, 4) && (
											<Divider />
										)}
									</Box>
								)
							)}
							<Box
								sx={{ p: 2, textAlign: "center", backgroundColor: "#f8f9fa" }}
							>
								<Button
									onClick={() => router.push("/dashboard/donations")}
									sx={{ color: "#287068", fontWeight: 600 }}
								>
									View All Donations
								</Button>
							</Box>
						</CardContent>
					</Card>
				</Box>
			)}

			{/* Motivational Message */}
			<Paper
				sx={{
					p: 3,
					textAlign: "center",
					background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
					border: "1px solid #dee2e6",
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontWeight: 600, mb: 1, color: "#287068" }}
				>
					&ldquo;The best way to find yourself is to lose yourself in the
					service of others.&rdquo;
				</Typography>
				<Typography variant="body2" color="text.secondary">
					- Mahatma Gandhi
				</Typography>
			</Paper>
		</Box>
	);
};

export default DonorHomePage;
