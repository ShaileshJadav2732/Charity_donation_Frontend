"use client";

import {
	BarChart,
	DonationTypeChart,
	DoughnutChart,
	LineChart,
	StatsCard,
} from "@/components/analytics";
import { useGetOrganizationAnalyticsQuery } from "@/store/api/analyticsApi";
import {
	Alert,
	AlertTitle,
	Box,
	Button,
	Container,
	Fade,
	Grow,
	MenuItem,
	Select,
	Skeleton,
	Typography,
} from "@mui/material";
import {
	Activity,
	DollarSign,
	Megaphone,
	TrendingUp,
	Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";

// TypeScript interfaces for type safety
interface Trend {
	month: string;
	amount: number;
	count: number;
}

interface DonationType {
	type: string;
	amount: number;
	count: number;
}

interface Campaign {
	title: string;
	targetAmount: number;
	raisedAmount: number;
}

interface Cause {
	name: string;
	count: number;
	amount: number;
}

interface Donor {
	email: string;
	count: number;
	amount: number;
}

interface Activity {
	id: string;
	campaignName: string;
	timestamp: string;
	amount?: number;
	type?: string;
	donorName?: string;
	donorEmail?: string;
	donationType?: string;
	status?: string;
	rating?: number;
	comment?: string;
	targetAmount?: number;
	raisedAmount?: number;
}

interface AnalyticsData {
	stats: {
		donations: {
			totalAmount: number;
			totalDonations: number;
			averageDonation: number;
		};
		campaigns: {
			activeCampaigns: number;
			totalCampaigns: number;
		};
	};
	charts: {
		monthlyTrends: Trend[];
		donationsByType: DonationType[];
		campaignPerformance?: Campaign[];
		topCauses?: Cause[];
		topDonors?: Donor[];
	};
	recentActivities: {
		donations: Activity[];
		campaigns?: Activity[];
		feedback?: Activity[];
	};
}

const OrganizationAnalyticsPage: React.FC = () => {
	const { data, isLoading, isError, refetch } =
		useGetOrganizationAnalyticsQuery();
	const [dateRange, setDateRange] = useState<string>("last12Months"); // State for date range filter

	// Memoize formatted chart data to prevent unnecessary recalculations
	const formatMonthlyTrendsData = useMemo(() => {
		if (
			!data?.data?.charts?.monthlyTrends ||
			data.data.charts.monthlyTrends.length === 0
		) {
			return { labels: [], datasets: [] };
		}

		return {
			labels: data.data.charts.monthlyTrends.map((trend: Trend) => {
				const [year, month] = trend.month.split("-");
				const date = new Date(parseInt(year), parseInt(month) - 1);
				return date.toLocaleDateString("en-US", {
					month: "short",
					year: "numeric",
				});
			}),
			datasets: [
				{
					label: "Donation Amount",
					data: data.data.charts.monthlyTrends.map(
						(trend: Trend) => trend.amount
					),
					borderColor: "#2f8077",
					backgroundColor: "rgba(47, 128, 119, 0.2)",
					fill: true,
					tension: 0.4,
					pointHoverRadius: 8,
				},
				{
					label: "Donation Count",
					data: data.data.charts.monthlyTrends.map(
						(trend: Trend) => trend.count
					),
					borderColor: "#14b8a6",

					backgroundColor: "rgba(20, 184, 166, 0.2)",
					fill: true,
					tension: 0.4,
					pointHoverRadius: 8,
				},
			],
		};
	}, [data]);

	const formatDonationTypesData = useMemo(() => {
		if (
			!data?.data?.charts?.donationsByType ||
			data.data.charts.donationsByType.length === 0
		) {
			return { labels: [], datasets: [] };
		}

		// Enhanced color palette with better visual appeal and distinction
		const donationTypeColors: { [key: string]: string } = {
			CLOTHES: "#3b82f6",
			FOOD: "#10b981",
			BOOKS: "#8b5cf6",
			ELECTRONICS: "#f59e0b",
			FURNITURE: "#ef4444",
			TOYS: "#ec4899",
			BLOOD: "#dc2626",
			MEDICINE: "#059669",
			OTHER: "#6b7280",
		};

		// Get colors for each donation type, fallback to default colors if type not found
		const defaultColors = [
			"#3b82f6",
			"#10b981",
			"#8b5cf6",
			"#f59e0b",
			"#ef4444",
			"#ec4899",
			"#dc2626",
			"#059669",
			"#6b7280",
		];

		const colors = data.data.charts.donationsByType.map(
			(type: DonationType, index: number) =>
				donationTypeColors[type.type.toUpperCase()] ||
				defaultColors[index % defaultColors.length]
		);

		return {
			labels: data.data.charts.donationsByType.map(
				(type: DonationType) =>
					type.type.charAt(0).toUpperCase() + type.type.slice(1).toLowerCase()
			),
			datasets: [
				{
					data: data.data.charts.donationsByType.map((type: DonationType) =>
						type.count > 0 ? type.amount || type.count : type.count
					),
					backgroundColor: colors,
					borderColor: colors.map((color) => color),
					borderWidth: 3,
					hoverBorderWidth: 5,
					hoverOffset: 15,
					hoverBackgroundColor: colors.map((color) => color + "E6"),
				},
			],
		};
	}, [data]);

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					minHeight: "60vh",
					gap: 3,
					py: 4,
				}}
			>
				<Skeleton variant="circular" width={60} height={60} />
				<Skeleton variant="text" width={200} height={40} />
				<Skeleton variant="rectangular" width="80%" height={400} />
			</Box>
		);
	}

	if (isError || !data?.success) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Alert
					severity="error"
					sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
					action={
						<Button color="inherit" size="small" onClick={refetch}>
							Retry
						</Button>
					}
				>
					<AlertTitle>Error</AlertTitle>
					Failed to load analytics data. Please try again later.
				</Alert>
			</Container>
		);
	}

	const analyticsData: AnalyticsData = data.data;
	const { stats, charts } = analyticsData;

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
				py: { xs: 3, md: 4 },
			}}
			role="main"
			aria-label="Organization Analytics Dashboard"
		>
			<Container maxWidth="xl">
				<Fade in timeout={600}>
					<Box sx={{ mb: 6, textAlign: { xs: "center", md: "left" } }}>
						<Typography
							variant="h4"
							sx={{
								fontWeight: 700,
								color: "#1f2937",
								mb: 1,
								background: "linear-gradient(135deg, #2f8077 0%, #14b8a6 100%)",
								backgroundClip: "text",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}
						>
							Analytics Dashboard
						</Typography>
						<Typography
							variant="h6"
							color="text.secondary"
							sx={{ fontWeight: 400 }}
						>
							Comprehensive insights into your organization&apos;s impact and
							performance
						</Typography>
						<Box
							sx={{
								mt: 2,
								display: "flex",
								justifyContent: { xs: "center", md: "flex-start" },
							}}
						>
							<Select
								value={dateRange}
								onChange={(e) => setDateRange(e.target.value)}
								size="small"
								sx={{ minWidth: 160, borderRadius: 2 }}
								aria-label="Select date range for analytics"
							>
								<MenuItem value="last6Months">Last 6 Months</MenuItem>
								<MenuItem value="last12Months">Last 12 Months</MenuItem>
								<MenuItem value="last24Months">Last 24 Months</MenuItem>
							</Select>
						</Box>
					</Box>
				</Fade>

				{/* Stats Overview Cards */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							sm: "repeat(2, 1fr)",
							md: "repeat(4, 1fr)",
						},
						gap: 2,
						mb: 6,
					}}
				>
					{[
						{
							title: "Total Raised",
							value: stats.donations.totalAmount,
							prefix: "₹",
							subtitle: `${stats.donations.totalDonations} donations`,
							icon: <DollarSign size={24} />,
							color: "#2f8077",
							trend: { value: 12.5, isPositive: true },
						},
						{
							title: "Average Donation",
							value: stats.donations.averageDonation,
							prefix: "₹",
							icon: <TrendingUp size={24} />,
							color: "#14b8a6",
							trend: { value: 8.3, isPositive: true },
						},
						{
							title: "Active Campaigns",
							value: stats.campaigns.activeCampaigns,
							subtitle: `${stats.campaigns.totalCampaigns} total`,
							icon: <Megaphone size={24} />,
							color: "#0d9488",
							trend: { value: 5.2, isPositive: true },
						},
						{
							title: "Total Donors",
							value: charts.topDonors?.length || 0,
							subtitle: "Unique donors",
							icon: <Users size={24} />,
							color: "#047857",
							trend: { value: 3.7, isPositive: true },
						},
					].map((stat, index) => (
						<Grow in timeout={800 + index * 200} key={index}>
							<Box
								sx={{
									transition: "transform 0.3s ease-in-out",
									"&:hover": { transform: "translateY(-4px)" },
								}}
							>
								<StatsCard
									title={stat.title}
									value={stat.value}
									prefix={stat.prefix}
									subtitle={stat.subtitle}
									icon={stat.icon}
									color={stat.color}
									trend={stat.trend}
									aria-label={`${stat.title} statistics card`}
								/>
							</Box>
						</Grow>
					))}
				</Box>

				{/* Charts Section */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
						gap: 3,
						mb: 6,
					}}
				>
					<Grow in timeout={1200}>
						<Box
							sx={{
								p: 3,
								borderRadius: 3,
								backgroundColor: "white",
								boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
							}}
						>
							<LineChart
								title="Donation Trends Over Time"
								data={formatMonthlyTrendsData}
								height={400}
								currency={true}
								showGrid={true}
								aria-label="Donation trends over time chart"
							/>
						</Box>
					</Grow>
					<Grow in timeout={1400}>
						<Box
							sx={{
								p: 3,
								borderRadius: 3,
								backgroundColor: "white",
								boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
							}}
						>
							<DoughnutChart
								title="Donation Types Distribution"
								data={formatDonationTypesData}
								height={500}
								currency={true}
								cutout="60%"
								centerText={`₹${stats.donations.totalAmount.toLocaleString()}`}
								aria-label="Donation types distribution chart"
							/>
						</Box>
					</Grow>
				</Box>

				{/* Campaign Performance and Top Causes */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
						gap: 3,
						mb: 6,
					}}
				>
					{charts.campaignPerformance &&
						charts.campaignPerformance.length > 0 && (
							<Grow in timeout={1600}>
								<Box
									sx={{
										p: 3,
										borderRadius: 3,
										backgroundColor: "white",
										boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
									}}
								>
									<BarChart
										title="Campaign Performance"
										data={{
											labels: charts.campaignPerformance.map(
												(campaign: Campaign) =>
													campaign.title.length > 15
														? campaign.title.substring(0, 15) + "..."
														: campaign.title
											),
											datasets: [
												{
													label: "Target Amount",
													data: charts.campaignPerformance.map(
														(campaign: Campaign) => campaign.targetAmount
													),
													backgroundColor: "rgba(47, 128, 119, 0.3)",
													borderColor: "#2f8077",
													borderWidth: 2,
													borderRadius: 6,
												},
												{
													label: "Raised Amount",
													data: charts.campaignPerformance.map(
														(campaign: Campaign) => campaign.raisedAmount
													),
													backgroundColor: "rgba(20, 184, 166, 0.8)",
													borderColor: "#14b8a6",
													borderWidth: 2,
													borderRadius: 6,
												},
											],
										}}
										height={350}
										currency={true}
										aria-label="Campaign performance chart"
									/>
								</Box>
							</Grow>
						)}
					{charts.topCauses && charts.topCauses.length > 0 && (
						<Grow in timeout={1800}>
							<Box
								sx={{
									p: 3,
									borderRadius: 3,
									backgroundColor: "white",
									boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
								}}
							>
								<DonationTypeChart
									title="Top Performing Causes"
									data={charts.topCauses.map((cause: Cause) => ({
										type: cause.name,
										count: cause.count,
										amount: cause.amount,
									}))}
									showAmount={true}
									variant="list"
									aria-label="Top performing causes list"
								/>
							</Box>
						</Grow>
					)}
				</Box>
			</Container>
		</Box>
	);
};

export default OrganizationAnalyticsPage;
