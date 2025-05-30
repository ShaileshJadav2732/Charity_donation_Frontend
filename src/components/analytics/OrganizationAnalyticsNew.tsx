"use client";

import React from "react";
import {
	Typography,
	Box,
	CircularProgress,
	Alert,
	Button,
	Card,
	Avatar,
	Container,
	Fade,
	Grow,
	Stack,
} from "@mui/material";
import {
	DollarSign,
	Users,
	Target,
	TrendingUp,
	Megaphone,
	Sparkles,
	Zap,
	BarChart3,
	Award,
	Gift,
} from "lucide-react";
import { useGetOrganizationAnalyticsQuery } from "@/store/api/analyticsApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Link from "next/link";
// Define the actual API response type
interface OrganizationStats {
	donations: {
		totalAmount: number;
		totalDonations: number;
		averageDonation: number;
	};
	campaigns: {
		totalCampaigns: number;
		activeCampaigns: number;
	};
	feedback: {
		averageRating: number;
		totalFeedback: number;
	};
}

interface ChartData {
	monthlyTrends: Array<{
		month: string;
		amount: number;
		count: number;
	}>;
	donationsByType: Array<{
		type: string;
		count: number;
		amount: number;
	}>;
}

interface RecentActivity {
	id: string;
	type: string;
	amount?: number;
	campaignName: string;
	timestamp: string;
}

interface OrganizationAnalyticsData {
	stats: OrganizationStats;
	charts: ChartData;
	recentActivities: {
		donations: RecentActivity[];
		campaigns: RecentActivity[];
		feedback: RecentActivity[];
	};
}

interface StatCard {
	title: string;
	value: number;
	prefix?: string;
	suffix?: string;
	subtitle?: string;
	icon: React.ReactElement;
	color: string;
	bgGradient: string;
}

// Stunning Welcome Component for new organizations
const StunningWelcome: React.FC = () => {
	const { user } = useSelector((state: RootState) => state.auth);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background:
					"linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Animated Background */}
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: `
						radial-gradient(circle at 20% 80%, rgba(20, 184, 166, 0.3) 0%, transparent 50%),
						radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
						radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
					`,
					animation: "gradientShift 8s ease-in-out infinite",
					"@keyframes gradientShift": {
						"0%, 100%": { opacity: 1 },
						"50%": { opacity: 0.8 },
					},
				}}
			/>

			{/* Floating Elements */}
			{[...Array(6)].map((_, i) => (
				<Box
					key={i}
					sx={{
						position: "absolute",
						width: { xs: 60, md: 100 },
						height: { xs: 60, md: 100 },
						borderRadius: "50%",
						background: `rgba(${i % 2 ? "20, 184, 166" : "59, 130, 246"}, 0.1)`,
						backdropFilter: "blur(10px)",
						border: `1px solid rgba(${
							i % 2 ? "20, 184, 166" : "59, 130, 246"
						}, 0.2)`,
						top: `${Math.random() * 80}%`,
						left: `${Math.random() * 80}%`,
						animation: `float${i} ${6 + i}s ease-in-out infinite`,
						"@keyframes float0": {
							"0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
							"50%": { transform: "translateY(-20px) rotate(180deg)" },
						},
						"@keyframes float1": {
							"0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
							"50%": { transform: "translateY(-30px) rotate(-180deg)" },
						},
						"@keyframes float2": {
							"0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
							"50%": { transform: "translateY(-25px) rotate(90deg)" },
						},
						"@keyframes float3": {
							"0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
							"50%": { transform: "translateY(-15px) rotate(-90deg)" },
						},
						"@keyframes float4": {
							"0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
							"50%": { transform: "translateY(-35px) rotate(270deg)" },
						},
						"@keyframes float5": {
							"0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
							"50%": { transform: "translateY(-40px) rotate(-270deg)" },
						},
					}}
				/>
			))}

			<Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, py: 8 }}>
				{/* Hero Section */}
				<Fade in timeout={1000}>
					<Box sx={{ textAlign: "center", mb: 8 }}>
						<Box
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: 1,
								bgcolor: "rgba(20, 184, 166, 0.1)",
								border: "1px solid rgba(20, 184, 166, 0.3)",
								borderRadius: 50,
								px: 3,
								py: 1,
								mb: 4,
								backdropFilter: "blur(10px)",
							}}
						>
							<Sparkles size={20} color="#14b8a6" />
							<Typography
								variant="body2"
								sx={{ color: "#14b8a6", fontWeight: 600 }}
							>
								Welcome to the Future of Giving
							</Typography>
						</Box>

						<Typography
							variant="h1"
							sx={{
								fontSize: { xs: "3rem", md: "5rem", lg: "6rem" },
								fontWeight: 900,
								background:
									"linear-gradient(135deg, #ffffff 0%, #14b8a6 50%, #3b82f6 100%)",
								backgroundClip: "text",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								mb: 3,
								lineHeight: 1.1,
							}}
						>
							GreenGive
						</Typography>

						<Typography
							variant="h4"
							sx={{
								color: "rgba(255,255,255,0.9)",
								mb: 2,
								fontWeight: 300,
								maxWidth: 800,
								mx: "auto",
							}}
						>
							Hello {user?.email?.split("@")[0] || "there"}! 👋
						</Typography>

						<Typography
							variant="h6"
							sx={{
								color: "rgba(255,255,255,0.7)",
								maxWidth: 600,
								mx: "auto",
								lineHeight: 1.6,
								mb: 6,
							}}
						>
							Transform your organization&apos;s impact with our revolutionary
							donation platform. Track, manage, and amplify your social good
							with stunning analytics and seamless donor experiences.
						</Typography>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={3}
							justifyContent="center"
						>
							<Button
								component={Link}
								href="/dashboard/causes"
								variant="contained"
								size="large"
								sx={{
									background:
										"linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
									px: 4,
									py: 2,
									borderRadius: 3,
									fontWeight: 700,
									fontSize: "1.1rem",
									textTransform: "none",
									boxShadow: "0 8px 32px rgba(20, 184, 166, 0.3)",
									"&:hover": {
										transform: "translateY(-2px)",
										boxShadow: "0 12px 40px rgba(20, 184, 166, 0.4)",
									},
									transition: "all 0.3s ease",
								}}
								startIcon={<Target size={24} />}
							>
								Create Your First Cause
							</Button>
							<Button
								component={Link}
								href="/dashboard/campaigns"
								variant="outlined"
								size="large"
								sx={{
									borderColor: "rgba(255,255,255,0.3)",
									color: "white",
									px: 4,
									py: 2,
									borderRadius: 3,
									fontWeight: 600,
									fontSize: "1.1rem",
									textTransform: "none",
									backdropFilter: "blur(10px)",
									"&:hover": {
										borderColor: "#14b8a6",
										bgcolor: "rgba(20, 184, 166, 0.1)",
										transform: "translateY(-2px)",
									},
									transition: "all 0.3s ease",
								}}
								startIcon={<Megaphone size={24} />}
							>
								Launch Campaign
							</Button>
						</Stack>
					</Box>
				</Fade>

				{/* Feature Cards */}
				<Box sx={{ mb: 8 }}>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
							gap: 4,
						}}
					>
						{[
							{
								icon: <BarChart3 size={40} />,
								title: "Real-time Analytics",
								description:
									"Track your impact with beautiful, real-time dashboards and insights",
								color: "#14b8a6",
								delay: 1200,
							},
							{
								icon: <Users size={40} />,
								title: "Donor Management",
								description:
									"Build lasting relationships with comprehensive donor profiles and engagement tools",
								color: "#3b82f6",
								delay: 1400,
							},
							{
								icon: <Zap size={40} />,
								title: "Campaign Power",
								description:
									"Create compelling campaigns that inspire action and drive donations",
								color: "#8b5cf6",
								delay: 1600,
							},
						].map((feature, index) => (
							<Grow in timeout={feature.delay} key={index}>
								<Card
									sx={{
										background: "rgba(255,255,255,0.05)",
										backdropFilter: "blur(20px)",
										border: "1px solid rgba(255,255,255,0.1)",
										borderRadius: 4,
										p: 4,
										height: "100%",
										transition: "all 0.3s ease",
										"&:hover": {
											transform: "translateY(-8px)",
											boxShadow: `0 20px 60px rgba(${
												feature.color === "#14b8a6"
													? "20, 184, 166"
													: feature.color === "#3b82f6"
													? "59, 130, 246"
													: "139, 92, 246"
											}, 0.3)`,
											border: `1px solid ${feature.color}`,
										},
									}}
								>
									<Box
										sx={{
											width: 80,
											height: 80,
											borderRadius: 3,
											background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)`,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											mb: 3,
											color: feature.color,
										}}
									>
										{feature.icon}
									</Box>
									<Typography
										variant="h5"
										fontWeight="bold"
										sx={{ color: "white", mb: 2 }}
									>
										{feature.title}
									</Typography>
									<Typography
										variant="body1"
										sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}
									>
										{feature.description}
									</Typography>
								</Card>
							</Grow>
						))}
					</Box>
				</Box>

				{/* Quick Start Guide */}
				<Fade in timeout={1800}>
					<Card
						sx={{
							background: "rgba(255,255,255,0.05)",
							backdropFilter: "blur(20px)",
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: 4,
							p: 6,
						}}
					>
						<Typography
							variant="h4"
							fontWeight="bold"
							sx={{ color: "white", mb: 4, textAlign: "center" }}
						>
							🚀 Quick Start Guide
						</Typography>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									sm: "repeat(2, 1fr)",
									md: "repeat(4, 1fr)",
								},
								gap: 4,
							}}
						>
							{[
								{
									step: "1",
									title: "Complete Profile",
									desc: "Add your organization details and mission",
								},
								{
									step: "2",
									title: "Create Causes",
									desc: "Set up causes that matter to your organization",
								},
								{
									step: "3",
									title: "Launch Campaigns",
									desc: "Create compelling fundraising campaigns",
								},
								{
									step: "4",
									title: "Track Impact",
									desc: "Monitor donations and measure your success",
								},
							].map((item, index) => (
								<Box sx={{ textAlign: "center" }} key={index}>
									<Avatar
										sx={{
											width: 60,
											height: 60,
											bgcolor: "#14b8a6",
											fontSize: "1.5rem",
											fontWeight: "bold",
											mx: "auto",
											mb: 2,
										}}
									>
										{item.step}
									</Avatar>
									<Typography
										variant="h6"
										fontWeight="bold"
										sx={{ color: "white", mb: 1 }}
									>
										{item.title}
									</Typography>
									<Typography
										variant="body2"
										sx={{ color: "rgba(255,255,255,0.7)" }}
									>
										{item.desc}
									</Typography>
								</Box>
							))}
						</Box>
					</Card>
				</Fade>
			</Container>
		</Box>
	);
};

// Enhanced Dashboard with Data
const EnhancedDashboard: React.FC<{ data: OrganizationAnalyticsData }> = ({
	data,
}) => {
	const { user } = useSelector((state: RootState) => state.auth);

	// Debug: Log the data structure

	const safeStats = {
		donations: {
			totalAmount: data?.stats?.donations?.totalAmount || 0,
			totalDonations: data?.stats?.donations?.totalDonations || 0,
			averageDonation: data?.stats?.donations?.averageDonation || 0,
		},
		campaigns: {
			totalCampaigns: data?.stats?.campaigns?.totalCampaigns || 0,
			activeCampaigns: data?.stats?.campaigns?.activeCampaigns || 0,
		},
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background:
					"linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
			}}
		>
			<Container maxWidth="xl" sx={{ py: 4 }}>
				{/* Welcome Header */}
				<Fade in timeout={600}>
					<Card
						sx={{
							background:
								"linear-gradient(135deg, #0f766e 0%, #0d9488 25%, #14b8a6 50%, #2dd4bf 100%)",
							borderRadius: 4,
							p: 6,
							mb: 6,
							color: "white",
							position: "relative",
							overflow: "hidden",
							boxShadow: "0 20px 60px rgba(20, 184, 166, 0.3)",
						}}
					>
						{/* Animated Background */}
						<Box
							sx={{
								position: "absolute",
								top: -100,
								right: -100,
								width: 300,
								height: 300,
								borderRadius: "50%",
								background: "rgba(255,255,255,0.1)",
								animation: "pulse 4s ease-in-out infinite",
								"@keyframes pulse": {
									"0%, 100%": { transform: "scale(1)" },
									"50%": { transform: "scale(1.1)" },
								},
							}}
						/>

						<Box
							sx={{
								display: "flex",
								flexDirection: { xs: "column", md: "row" },
								gap: 4,
								alignItems: "center",
							}}
						>
							<Box sx={{ flex: 1, position: "relative", zIndex: 2 }}>
								<Typography variant="h3" fontWeight="800" gutterBottom>
									Welcome back, {user?.email?.split("@")[0] || "there"}! 👋
								</Typography>
								<Typography
									variant="h6"
									sx={{ opacity: 0.9, mb: 2, fontWeight: 400 }}
								>
									Your organization is making a real difference. Here&apos;s
									your impact dashboard.
								</Typography>
								<Typography
									variant="body1"
									sx={{ opacity: 0.8, maxWidth: 600 }}
								>
									Track your progress, engage with donors, and amplify your
									social impact with real-time insights.
								</Typography>
							</Box>
							<Box
								sx={{ textAlign: "center", position: "relative", zIndex: 2 }}
							>
								<Box
									sx={{
										width: 120,
										height: 120,
										borderRadius: "50%",
										background: "rgba(255,255,255,0.2)",
										backdropFilter: "blur(10px)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										mx: "auto",
										animation: "float 3s ease-in-out infinite",
										"@keyframes float": {
											"0%, 100%": { transform: "translateY(0px)" },
											"50%": { transform: "translateY(-10px)" },
										},
									}}
								>
									<Award size={60} color="white" />
								</Box>
							</Box>
						</Box>
					</Card>
				</Fade>

				{/* Enhanced Stats Cards */}
				<Fade in timeout={800}>
					<Box sx={{ mb: 6 }}>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									sm: "repeat(2, 1fr)",
									md: "repeat(4, 1fr)",
								},
								gap: 4,
							}}
						>
							{(
								[
									{
										title: "Total Raised",
										value: safeStats.donations.totalAmount,
										prefix: "₹",
										subtitle: `${safeStats.donations.totalDonations} donations`,
										icon: <DollarSign size={28} />,
										color: "#0f766e",
										bgGradient:
											"linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
									},
									{
										title: "Average Donation",
										value: safeStats.donations.averageDonation,
										prefix: "₹",
										icon: <TrendingUp size={28} />,
										color: "#0d9488",
										bgGradient:
											"linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)",
									},
									{
										title: "Active Campaigns",
										value: safeStats.campaigns.activeCampaigns,
										subtitle: `${safeStats.campaigns.totalCampaigns} total`,
										icon: <Megaphone size={28} />,
										color: "#14b8a6",
										bgGradient:
											"linear-gradient(135deg, #14b8a6 0%, #5eead4 100%)",
									},
								] as StatCard[]
							).map((stat, index) => (
								<Grow in timeout={800 + index * 200} key={index}>
									<Card
										sx={{
											p: 4,
											height: 200,
											borderRadius: 4,
											background: "white",
											boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
											border: "1px solid rgba(0,0,0,0.05)",
											position: "relative",
											overflow: "hidden",
											transition: "all 0.3s ease",
											"&:hover": {
												transform: "translateY(-8px)",
												boxShadow: `0 20px 40px ${stat.color}20`,
											},
											"&::before": {
												content: '""',
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												height: 4,
												background: stat.bgGradient,
											},
											"&::after": {
												content: '""',
												position: "absolute",
												top: -50,
												right: -50,
												width: 120,
												height: 120,
												borderRadius: "50%",
												background: `${stat.color}10`,
												zIndex: 0,
											},
										}}
									>
										<Box
											sx={{
												position: "relative",
												zIndex: 1,
												height: "100%",
												display: "flex",
												flexDirection: "column",
												justifyContent: "space-between",
											}}
										>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "flex-start",
												}}
											>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{
														fontWeight: 600,
														textTransform: "uppercase",
														letterSpacing: 1,
													}}
												>
													{stat.title}
												</Typography>
												<Box
													sx={{
														width: 48,
														height: 48,
														borderRadius: 2,
														background: stat.bgGradient,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														color: "white",
													}}
												>
													{stat.icon}
												</Box>
											</Box>

											<Box>
												<Typography
													variant="h3"
													sx={{
														fontWeight: 800,
														color: "text.primary",
														mb: 1,
														fontSize: "2.5rem",
													}}
												>
													{stat.prefix}
													{typeof stat.value === "number"
														? stat.value.toLocaleString()
														: stat.value}
													{stat.suffix}
												</Typography>

												{stat.subtitle && (
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ fontWeight: 500 }}
													>
														{stat.subtitle}
													</Typography>
												)}
											</Box>
										</Box>
									</Card>
								</Grow>
							))}
						</Box>
					</Box>
				</Fade>

				{/* Quick Actions */}
				<Fade in timeout={1200}>
					<Card
						sx={{
							p: 4,
							mb: 6,
							borderRadius: 4,
							boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
						}}
					>
						<Typography
							variant="h5"
							fontWeight="bold"
							gutterBottom
							sx={{ color: "#0f766e", mb: 3 }}
						>
							⚡ Quick Actions
						</Typography>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									sm: "repeat(2, 1fr)",
									md: "repeat(4, 1fr)",
								},
								gap: 3,
							}}
						>
							{[
								{
									label: "New Cause",
									href: "/dashboard/causes",
									icon: <Target size={20} />,
									color: "#0f766e",
								},
								{
									label: "New Campaign",
									href: "/dashboard/campaigns",
									icon: <Megaphone size={20} />,
									color: "#0d9488",
								},
								{
									label: "View Donors",
									href: "/dashboard/donors",
									icon: <Users size={20} />,
									color: "#14b8a6",
								},
								{
									label: "Donations",
									href: "/dashboard/donations",
									icon: <Gift size={20} />,
									color: "#2dd4bf",
								},
							].map((action, index) => (
								<Button
									key={index}
									component={Link}
									href={action.href}
									variant="outlined"
									fullWidth
									sx={{
										py: 2,
										borderRadius: 3,
										borderColor: action.color,
										color: action.color,
										fontWeight: 600,
										textTransform: "none",
										"&:hover": {
											bgcolor: `${action.color}10`,
											borderColor: action.color,
											transform: "translateY(-2px)",
										},
										transition: "all 0.3s ease",
									}}
									startIcon={action.icon}
								>
									{action.label}
								</Button>
							))}
						</Box>
					</Card>
				</Fade>
			</Container>
		</Box>
	);
};

// Main Component
const OrganizationAnalytics: React.FC = () => {
	const { data, isLoading, error } = useGetOrganizationAnalyticsQuery();

	if (isLoading) {
		return (
			<Box
				sx={{
					minHeight: "100vh",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
				}}
			>
				<CircularProgress size={60} sx={{ color: "#14b8a6" }} />
			</Box>
		);
	}

	if (error) {
		return (
			<Container maxWidth="xl" sx={{ py: 4 }}>
				<Alert
					severity="error"
					sx={{
						borderRadius: 3,
						"& .MuiAlert-icon": { color: "#dc2626" },
					}}
				>
					Failed to load analytics data. Please try again later.
				</Alert>
			</Container>
		);
	}

	// Show stunning welcome for new organizations
	if (!data?.data) {
		return <StunningWelcome />;
	}

	// Show enhanced dashboard for existing organizations
	return <EnhancedDashboard data={data.data} />;
};

export default OrganizationAnalytics;
