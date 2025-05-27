"use client";

import React from "react";
import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	Button,
	Avatar,
	Chip,
	LinearProgress,
	Divider,
	Paper,
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
import { useGetDonorStatsQuery } from "@/store/api/donationApi";
import { useGetActiveCampaignCausesQuery } from "@/store/api/causeApi";
import { useRouter } from "next/navigation";

interface DonationData {
	_id: string;
	amount?: number;
	status: string;
	createdAt: string;
	cause?: {
		title: string;
	};
	organization?: {
		name: string;
	};
}

const DonorHomePage: React.FC = () => {
	const { user } = useSelector((state: RootState) => state.auth);
	const { data: statsData } = useGetDonorStatsQuery();
	const { data: causesData } = useGetActiveCampaignCausesQuery({
		limit: 6,
		page: 1,
	});
	const router = useRouter();

	// Use real stats data - handle the actual API response structure
	const stats = {
		totalDonations: statsData?.data?.length || 0,
		totalAmount: Array.isArray(statsData?.data)
			? statsData.data.reduce(
					(sum: number, donation: any) => sum + (donation.amount || 0),
					0
			  )
			: 0,
		causesSupported: Array.isArray(statsData?.data)
			? new Set(statsData.data.map((d: any) => d.cause?._id).filter(Boolean))
					.size
			: 0,
		organizationsSupported: Array.isArray(statsData?.data)
			? new Set(
					statsData.data.map((d: any) => d.organization?._id).filter(Boolean)
			  ).size
			: 0,
		recentDonations: Array.isArray(statsData?.data)
			? statsData.data.slice(0, 5)
			: [],
	};

	// Use real causes data
	const realCauses = causesData?.causes || [];

	// Transform real causes into featured causes with urgency calculation
	const featuredCauses = realCauses.slice(0, 3).map((cause: any) => {
		const raised = cause.raisedAmount || 0;
		const goal = cause.targetAmount || 1;
		const progressPercentage = (raised / goal) * 100;

		// Determine urgency based on progress and time factors
		let urgency = "Low";
		if (progressPercentage < 30) {
			urgency = "High";
		} else if (progressPercentage < 70) {
			urgency = "Medium";
		}

		return {
			id: cause._id || cause.id, // Handle both _id and id fields
			title: cause.title,
			organization: cause.organizationId?.name || "Organization",
			description: cause.description,
			raised: raised,
			goal: goal,
			urgency: urgency,
			image: cause.imageUrl || "/api/placeholder/300/200",
			tags: cause.tags || [],
			acceptanceType: cause.acceptanceType,
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
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
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
					{(user as any)?.firstName || user?.email?.split("@")[0] || "Friend"}!
					👋
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
					<Grid container spacing={3} alignItems="center">
						<Grid item xs={12} md={8}>
							<Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
								Your Impact So Far
							</Typography>
							<Grid container spacing={3}>
								<Grid item xs={6} sm={3}>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{formatCurrency(stats.totalAmount)}
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Total Donated
									</Typography>
								</Grid>
								<Grid item xs={6} sm={3}>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{stats.causesSupported}
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Causes Supported
									</Typography>
								</Grid>
								<Grid item xs={6} sm={3}>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{stats.organizationsSupported}
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Organizations
									</Typography>
								</Grid>
								<Grid item xs={6} sm={3}>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{stats.totalDonations}
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Total Donations
									</Typography>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
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
						</Grid>
					</Grid>
				</Paper>
			</Box>

			{/* Quick Actions */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={4}>
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
				</Grid>
				<Grid item xs={12} sm={4}>
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
				</Grid>
				<Grid item xs={12} sm={4}>
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
				</Grid>
			</Grid>

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
						Urgent Causes
					</Typography>
					<Button
						endIcon={<ArrowRight size={16} />}
						onClick={() => router.push("/dashboard/causes")}
						sx={{ color: "#287068", fontWeight: 600 }}
					>
						View All
					</Button>
				</Box>
				<Grid container spacing={3}>
					{featuredCauses.map((cause) => (
						<Grid item xs={12} md={4} key={cause.id}>
							<Card
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
												{formatCurrency(cause.raised)} /{" "}
												{formatCurrency(cause.goal)}
											</Typography>
										</Box>
										<LinearProgress
											variant="determinate"
											value={(cause.raised / cause.goal) * 100}
											sx={{
												height: 8,
												borderRadius: 4,
												backgroundColor: "#f0f0f0",
												"& .MuiLinearProgress-bar": {
													backgroundColor: getUrgencyColor(cause.urgency),
												},
											}}
										/>
									</Box>
									<Button
										variant="contained"
										fullWidth
										onClick={() => router.push(`/dashboard/donate/${cause.id}`)}
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
						</Grid>
					))}
				</Grid>
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
							{stats.recentDonations
								.slice(0, 5)
								.map((donation: DonationData, index: number) => (
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
												sx={{ display: "flex", alignItems: "center", flex: 1 }}
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
														{new Date(donation.createdAt).toLocaleDateString()}
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
								))}
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
