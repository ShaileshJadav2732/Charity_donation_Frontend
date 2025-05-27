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
	Users,
	Megaphone,
	BarChart3,
	Award,
	Calendar,
	DollarSign,
	Star,
	Activity,
	Eye,
	Zap,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useGetOrganizationAnalyticsQuery } from "@/store/api/analyticsApi";
import { useGetOrganizationCausesQuery } from "@/store/api/causeApi";
import { useGetCurrentOrganizationQuery } from "@/store/api/organizationApi";
import { useRouter } from "next/navigation";

interface CauseData {
	_id: string;
	title: string;
	description: string;
	targetAmount: number;
	raisedAmount: number;
	status: string;
	urgency: "low" | "medium" | "high";
	createdAt: string;
}

const OrganizationHomePage: React.FC = () => {
	const { user } = useSelector((state: RootState) => state.auth);
	const { data: organizationData } = useGetCurrentOrganizationQuery();
	const { data: analyticsData } = useGetOrganizationAnalyticsQuery();

	// Get organization ID from the current organization data
	const organizationId = organizationData?.organization?._id;

	const { data: causesData } = useGetOrganizationCausesQuery(
		{
			organizationId: organizationId || "",
			limit: 6,
			page: 1,
		},
		{
			skip: !organizationId, // Skip the query if organizationId is not available
		}
	);
	const router = useRouter();

	// Process analytics data
	const stats = {
		totalRaised: analyticsData?.data?.stats?.donations?.totalAmount || 0,
		totalDonations: analyticsData?.data?.stats?.donations?.totalDonations || 0,
		averageDonation:
			analyticsData?.data?.stats?.donations?.averageDonation || 0,
		activeCampaigns:
			analyticsData?.data?.stats?.campaigns?.activeCampaigns || 0,
		totalCampaigns: analyticsData?.data?.stats?.campaigns?.totalCampaigns || 0,
		averageRating: analyticsData?.data?.stats?.feedback?.averageRating || 0,
		totalFeedback: analyticsData?.data?.stats?.feedback?.totalFeedback || 0,
		totalCauses: causesData?.causes?.length || 0,
	};

	// Process causes data
	const recentCauses = causesData?.causes?.slice(0, 3) || [];

	const formatCurrency = (amount: number) => {
		if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
		if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
		if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
		return `₹${amount.toLocaleString()}`;
	};

	const getUrgencyColor = (urgency: string) => {
		switch (urgency) {
			case "high":
				return "#ef4444";
			case "medium":
				return "#f59e0b";
			case "low":
				return "#10b981";
			default:
				return "#6b7280";
		}
	};

	const getUrgencyLabel = (urgency: string) => {
		switch (urgency) {
			case "high":
				return "🔴 Urgent";
			case "medium":
				return "🟡 Important";
			case "low":
				return "🟢 Standard";
			default:
				return "⚪ Unknown";
		}
	};

	const getProgressPercentage = (raised: number, target: number) => {
		return target > 0 ? Math.min((raised / target) * 100, 100) : 0;
	};

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	const getOrganizationName = () => {
		return (
			organizationData?.organization?.name ||
			(user as any)?.organizationName ||
			(user as any)?.name ||
			user?.email?.split("@")[0] ||
			"Organization"
		);
	};

	return (
		<Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
			{/* Welcome Section */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 1 }}
				>
					{getGreeting()}, {getOrganizationName()}! 👋
				</Typography>
				<Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
					Welcome to your organization dashboard. Track your impact and manage
					your causes effectively.
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
								Your Organization's Impact
							</Typography>
							<Grid container spacing={3}>
								<Grid item xs={6} sm={3}>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{formatCurrency(stats.totalRaised)}
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Total Raised
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
								<Grid item xs={6} sm={3}>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{stats.activeCampaigns}
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Active Campaigns
									</Typography>
								</Grid>
								<Grid item xs={6} sm={3}>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										{stats.averageRating.toFixed(1)}⭐
									</Typography>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										Average Rating
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
								Create New Cause
							</Button>
						</Grid>
					</Grid>
				</Paper>
			</Box>

			{/* Quick Actions */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h5"
					sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 3 }}
				>
					Quick Actions
				</Typography>
				<Grid container spacing={3}>
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
							onClick={() => router.push("/dashboard/campaigns")}
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
								<Megaphone size={24} />
							</Avatar>
							<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
								Manage Campaigns
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Create and manage your fundraising campaigns
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
							onClick={() => router.push("/dashboard/donations/pending")}
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
								<Gift size={24} />
							</Avatar>
							<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
								Manage Donations
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Review and process incoming donations
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
									backgroundColor: "#5fb3a3",
									width: 56,
									height: 56,
									mx: "auto",
									mb: 2,
								}}
							>
								<BarChart3 size={24} />
							</Avatar>
							<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
								View Analytics
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Detailed insights about your organization's impact
							</Typography>
						</Card>
					</Grid>
				</Grid>
			</Box>

			{/* Recent Causes */}
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
						Recent Causes
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
					{recentCauses.length > 0 ? (
						recentCauses.map((cause: CauseData) => (
							<Grid item xs={12} md={4} key={cause._id}>
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
									onClick={() => router.push(`/dashboard/causes/${cause._id}`)}
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
										<Box
											sx={{
												position: "absolute",
												top: 12,
												right: 12,
											}}
										>
											<Chip
												label={getUrgencyLabel(cause.urgency)}
												size="small"
												sx={{
													backgroundColor: getUrgencyColor(cause.urgency),
													color: "white",
													fontWeight: 600,
												}}
											/>
										</Box>
										<Target size={48} color={getUrgencyColor(cause.urgency)} />
									</Box>
									<CardContent sx={{ p: 3 }}>
										<Typography
											variant="h6"
											sx={{ fontWeight: 600, mb: 1, minHeight: 48 }}
										>
											{cause.title}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mb: 2, minHeight: 40 }}
										>
											{cause.description.length > 100
												? `${cause.description.substring(0, 100)}...`
												: cause.description}
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
													{getProgressPercentage(
														cause.raisedAmount,
														cause.targetAmount
													).toFixed(1)}
													%
												</Typography>
											</Box>
											<LinearProgress
												variant="determinate"
												value={getProgressPercentage(
													cause.raisedAmount,
													cause.targetAmount
												)}
												sx={{
													height: 8,
													borderRadius: 4,
													backgroundColor: "#f0f0f0",
													"& .MuiLinearProgress-bar": {
														backgroundColor: getUrgencyColor(cause.urgency),
														borderRadius: 4,
													},
												}}
											/>
										</Box>

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
												<Typography variant="h6" sx={{ fontWeight: 600 }}>
													{formatCurrency(cause.raisedAmount)}
												</Typography>
											</Box>
											<Box sx={{ textAlign: "right" }}>
												<Typography variant="body2" color="text.secondary">
													Goal
												</Typography>
												<Typography variant="h6" sx={{ fontWeight: 600 }}>
													{formatCurrency(cause.targetAmount)}
												</Typography>
											</Box>
										</Box>
									</CardContent>
								</Card>
							</Grid>
						))
					) : (
						<Grid item xs={12}>
							<Card sx={{ p: 4, textAlign: "center" }}>
								<Target size={48} color="#ccc" style={{ marginBottom: 16 }} />
								<Typography variant="h6" color="text.secondary" gutterBottom>
									No causes created yet
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 2 }}
								>
									Start making an impact by creating your first cause
								</Typography>
								<Button
									variant="contained"
									startIcon={<Plus />}
									onClick={() => router.push("/dashboard/causes")}
									sx={{
										backgroundColor: "#287068",
										"&:hover": { backgroundColor: "#1f5a52" },
									}}
								>
									Create Your First Cause
								</Button>
							</Card>
						</Grid>
					)}
				</Grid>
			</Box>

			{/* Performance Metrics */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h5"
					sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 3 }}
				>
					Performance Overview
				</Typography>
				<Grid container spacing={3}>
					<Grid item xs={12} sm={6} md={3}>
						<Card sx={{ p: 3, textAlign: "center" }}>
							<Avatar
								sx={{
									backgroundColor: "#e3f2fd",
									color: "#1976d2",
									width: 56,
									height: 56,
									mx: "auto",
									mb: 2,
								}}
							>
								<DollarSign size={24} />
							</Avatar>
							<Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
								{formatCurrency(stats.averageDonation)}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Average Donation
							</Typography>
						</Card>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<Card sx={{ p: 3, textAlign: "center" }}>
							<Avatar
								sx={{
									backgroundColor: "#f3e5f5",
									color: "#7b1fa2",
									width: 56,
									height: 56,
									mx: "auto",
									mb: 2,
								}}
							>
								<Users size={24} />
							</Avatar>
							<Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
								{stats.totalCampaigns}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Total Campaigns
							</Typography>
						</Card>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<Card sx={{ p: 3, textAlign: "center" }}>
							<Avatar
								sx={{
									backgroundColor: "#fff3e0",
									color: "#f57c00",
									width: 56,
									height: 56,
									mx: "auto",
									mb: 2,
								}}
							>
								<Star size={24} />
							</Avatar>
							<Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
								{stats.averageRating.toFixed(1)}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Average Rating
							</Typography>
						</Card>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<Card sx={{ p: 3, textAlign: "center" }}>
							<Avatar
								sx={{
									backgroundColor: "#e8f5e8",
									color: "#2e7d32",
									width: 56,
									height: 56,
									mx: "auto",
									mb: 2,
								}}
							>
								<Activity size={24} />
							</Avatar>
							<Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
								{stats.totalCauses}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Total Causes
							</Typography>
						</Card>
					</Grid>
				</Grid>
			</Box>

			{/* Additional Quick Links */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h5"
					sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 3 }}
				>
					Additional Resources
				</Typography>
				<Grid container spacing={3}>
					<Grid item xs={12} sm={6}>
						<Card
							sx={{
								p: 3,
								cursor: "pointer",
								transition: "all 0.2s",
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
								},
							}}
							onClick={() => router.push("/dashboard/donors")}
						>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Avatar
									sx={{
										backgroundColor: "#287068",
										mr: 2,
									}}
								>
									<Heart size={20} />
								</Avatar>
								<Box>
									<Typography variant="h6" sx={{ fontWeight: 600 }}>
										Donor Management
									</Typography>
									<Typography variant="body2" color="text.secondary">
										View and manage your donor relationships
									</Typography>
								</Box>
							</Box>
						</Card>
					</Grid>
					<Grid item xs={12} sm={6}>
						<Card
							sx={{
								p: 3,
								cursor: "pointer",
								transition: "all 0.2s",
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
								},
							}}
							onClick={() => router.push("/dashboard/feedback")}
						>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Avatar
									sx={{
										backgroundColor: "#4a9b8e",
										mr: 2,
									}}
								>
									<Award size={20} />
								</Avatar>
								<Box>
									<Typography variant="h6" sx={{ fontWeight: 600 }}>
										Feedback & Reviews
									</Typography>
									<Typography variant="body2" color="text.secondary">
										See what donors are saying about your work
									</Typography>
								</Box>
							</Box>
						</Card>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
};

export default OrganizationHomePage;
