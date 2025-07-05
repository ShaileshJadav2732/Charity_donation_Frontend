"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useGetOrganizationAnalyticsQuery } from "@/store/api/analyticsApi";
import { useGetOrganizationCampaignsQuery } from "@/store/api/campaignApi";
import {
	Box,
	Container,
	Typography,
	CircularProgress,
	Alert,
	AlertTitle,
	Button,
	Grow,
	Fade,
	Select,
	MenuItem,
	Skeleton,
} from "@mui/material";
import { DollarSign, TrendingUp, Megaphone, Users } from "lucide-react";
import LineChart from "@/components/analytics/LineChart";
import DoughnutChart from "@/components/analytics/DoughnutChart";
import BarChart from "@/components/analytics/BarChart";
import StatsCard from "@/components/analytics/StatsCard";

// Import specific types for each chart
import {
	AnalyticsData,
	ProcessedDonationData,
	DonationType,
	Trend,
	StatsCard as StatsCardType,
	LineChartData,
	DoughnutChartData,
	BarChartData,
} from "@/types/analytics";

const OrganizationAnalyticsPage: React.FC = () => {
	const { data, isLoading, isError, refetch } =
		useGetOrganizationAnalyticsQuery();

	// Add campaign data query to get real campaign counts
	const { user } = useSelector((state: RootState) => state.auth);
	const { data: campaignsData } = useGetOrganizationCampaignsQuery({
		organizationId: user?.id || "",
	});

	const [dateRange, setDateRange] = useState<string>("last12Months");

	// Calculate real campaign stats (must be active status AND currently running)
	const campaigns = campaignsData?.campaigns || [];
	const now = new Date();

	// Debug logging
	console.log("Analytics Page - Debug Info:");
	console.log("user?.id:", user?.id);
	console.log("campaignsData:", campaignsData);
	console.log("campaigns:", campaigns);
	console.log("campaigns.length:", campaigns.length);

	const activeCampaigns = campaigns.filter((campaign) => {
		const isActiveStatus = campaign.status?.toLowerCase() === "active";
		const startDate = new Date(campaign.startDate);
		const endDate = new Date(campaign.endDate);
		const isCurrentlyRunning = startDate <= now && endDate >= now;

		console.log(`Analytics - Campaign "${campaign.title}":`, {
			status: campaign.status,
			isActiveStatus,
			startDate: campaign.startDate,
			endDate: campaign.endDate,
			isCurrentlyRunning,
			willBeIncluded: isActiveStatus && isCurrentlyRunning,
		});

		return isActiveStatus && isCurrentlyRunning;
	}).length;
	const totalCampaigns = campaigns.length;

	console.log("Analytics - Final counts:", { activeCampaigns, totalCampaigns });

	// Override analytics data with real campaign counts
	const enhancedStats = {
		donations: {
			totalAmount: data?.data?.stats?.donations?.totalAmount || 0,
			totalDonations: data?.data?.stats?.donations?.totalDonations || 0,
			averageDonation: data?.data?.stats?.donations?.averageDonation || 0,
		},
		campaigns: {
			activeCampaigns: activeCampaigns,
			totalCampaigns: totalCampaigns,
		},
	};

	// Memoize formatted chart data with correct types
	const formatMonthlyTrendsData = useMemo((): LineChartData => {
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

	const formatDonationTypesData = useMemo((): DoughnutChartData => {
		if (
			!data?.data?.charts?.donationsByType ||
			data.data.charts.donationsByType.length === 0
		) {
			return { labels: [], datasets: [] };
		}

		// Separate money and item donations
		const processedData: ProcessedDonationData[] = [];

		// Group donations by type (MONEY vs ITEM types)
		const donationsByCategory: {
			[key: string]: { amount: number; count: number };
		} = {};

		data.data.charts.donationsByType.forEach((type: DonationType) => {
			const typeUpper = type.type.toUpperCase();

			if (typeUpper === "MONEY") {
				// Money donations
				if (!donationsByCategory["MONEY"]) {
					donationsByCategory["MONEY"] = { amount: 0, count: 0 };
				}
				donationsByCategory["MONEY"].amount += type.amount || 0;
				donationsByCategory["MONEY"].count += type.count || 0;
			} else {
				// Item donations (group all non-money types as items)
				if (!donationsByCategory["ITEMS"]) {
					donationsByCategory["ITEMS"] = { amount: 0, count: 0 };
				}
				donationsByCategory["ITEMS"].amount += type.amount || 0;
				donationsByCategory["ITEMS"].count += type.count || 0;
			}
		});

		// Convert to array format for chart
		Object.keys(donationsByCategory).forEach((category) => {
			processedData.push({
				type: category,
				amount: donationsByCategory[category].amount,
				count: donationsByCategory[category].count,
			});
		});

		// Enhanced color palette for money vs items
		const donationTypeColors: { [key: string]: string } = {
			MONEY: "#287068", // Teal for money donations
			ITEMS: "#f59e0b", // Orange for item donations
		};

		const colors = processedData.map(
			(type) => donationTypeColors[type.type] || "#6b7280"
		);

		return {
			labels: processedData.map((type) => {
				if (type.type === "MONEY") return "Money Donations";
				if (type.type === "ITEMS") return "Item Donations";
				return type.type;
			}),
			datasets: [
				{
					data: processedData.map((type) => (type.count > 0 ? type.count : 0)),
					backgroundColor: colors,
					borderColor: colors,
					borderWidth: 3,
					hoverBorderWidth: 5,
					hoverOffset: 15,
					hoverBackgroundColor: colors.map((color) => color + "E6"),
				},
			],
		};
	}, [data]);

	// Add this new memo for item donations data
	const formatItemDonationsData = useMemo((): BarChartData => {
		if (!data?.data?.charts?.donationsByType) {
			return { labels: [], datasets: [] };
		}

		// Filter out only item donations (non-money types)
		const itemDonations = data.data.charts.donationsByType.filter(
			(type: DonationType) => type.type.toUpperCase() !== "MONEY"
		);

		if (itemDonations.length === 0) {
			return { labels: [], datasets: [] };
		}

		// Define colors for different item types
		const itemTypeColors: { [key: string]: string } = {
			CLOTHES: "#f59e0b",
			FOOD: "#10b981",
			BOOKS: "#8b5cf6",
			ELECTRONICS: "#3b82f6",
			TOYS: "#f97316",
			FURNITURE: "#84cc16",
			MEDICAL: "#ef4444",
			BLOOD: "#dc2626",
			DEFAULT: "#6b7280",
		};

		// Get item type labels and format them
		const getItemTypeLabel = (type: string): string => {
			switch (type.toUpperCase()) {
				case "CLOTHES":
					return "Clothes";
				case "FOOD":
					return "Food";
				case "BOOKS":
					return "Books";
				case "ELECTRONICS":
					return "Electronics";
				case "TOYS":
					return "Toys";
				case "FURNITURE":
					return "Furniture";
				case "MEDICAL":
					return "Medical Supplies";
				case "BLOOD":
					return "Blood Donations";
				default:
					return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
			}
		};

		return {
			labels: itemDonations.map((item) => getItemTypeLabel(item.type)),
			datasets: [
				{
					label: "Number of Donations",
					data: itemDonations.map((item) => item.count || 0),
					backgroundColor: itemDonations.map(
						(item) =>
							itemTypeColors[item.type.toUpperCase()] || itemTypeColors.DEFAULT
					),
					borderColor: itemDonations.map(
						(item) =>
							itemTypeColors[item.type.toUpperCase()] || itemTypeColors.DEFAULT
					),
					borderWidth: 2,
					borderRadius: 8,
					borderSkipped: false,
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
				<CircularProgress size={60} sx={{ color: "#14b8a6" }} />
				<Typography variant="h6" color="text.secondary">
					Loading analytics...
				</Typography>
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
	const { charts } = analyticsData;

	// Update the stats cards to use enhancedStats instead of the API data
	const statsCards: StatsCardType[] = [
		{
			title: "Total Raised",
			value: enhancedStats.donations.totalAmount,
			prefix: "₹",
			subtitle: `${enhancedStats.donations.totalDonations} donations`,
			icon: <DollarSign size={24} />,
			color: "#2f8077",
		},
		{
			title: "Average Donation",
			value: enhancedStats.donations.averageDonation,
			prefix: "₹",
			subtitle: "Average",
			icon: <TrendingUp size={24} />,
			color: "#14b8a6",
		},
		{
			title: "Active Campaigns",
			value: enhancedStats.campaigns.activeCampaigns,
			subtitle: `${enhancedStats.campaigns.totalCampaigns} total`,
			icon: <Megaphone size={24} />,
			color: "#0d9488",
		},
		{
			title: "Total Donors",
			value: charts?.topDonors?.length || 0,
			subtitle: "Unique donors",
			icon: <Users size={24} />,
			color: "#047857",
		},
	];

	const formatCurrency = (amount: number): string => {
		if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
		if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
		if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
		return `₹${amount.toLocaleString()}`;
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
			}}
		>
			<Container maxWidth="xl" sx={{ py: 4 }}>
				{/* Header */}
				<Fade in timeout={600}>
					<Box sx={{ mb: 6 }}>
						<Typography
							variant="h3"
							sx={{
								fontWeight: 800,
								color: "#0f766e",
								mb: 2,
								background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
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
					{statsCards.map((stat, index) => (
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
								/>
							</Box>
						</Grow>
					))}
				</Box>

				{/* Charts Section */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
						gap: 4,
					}}
				>
					{/* Monthly Trends - Full Width */}
					{formatMonthlyTrendsData.labels.length > 0 && (
						<Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
							<Grow in timeout={1400}>
								<Box
									sx={{
										p: 3,
										borderRadius: 3,
										backgroundColor: "white",
										boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
									}}
								>
									<LineChart
										title="📈 Donation Trends Over Time"
										data={formatMonthlyTrendsData}
										height={400}
										currency={true}
										showGrid={true}
										aria-label="Donation trends over time chart"
									/>
								</Box>
							</Grow>
						</Box>
					)}

					{/* Donation Types Distribution */}
					{formatDonationTypesData.labels.length > 0 && (
						<Box>
							<Grow in timeout={1600}>
								<Box
									sx={{
										p: 3,
										borderRadius: 3,
										backgroundColor: "white",
										boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
									}}
								>
									<DoughnutChart
										title="🎯 Donation Types Distribution"
										data={formatDonationTypesData}
										height={400}
										currency={false}
										cutout="65%"
										centerText={(() => {
											// Calculate total from chart data to ensure consistency
											const chartTotal =
												data?.data?.charts?.donationsByType?.reduce(
													(sum, d) => sum + (d.count || 0),
													0
												) || 0;
											return `${chartTotal} Total`;
										})()}
										aria-label="Donation types distribution chart"
									/>

									{/* Summary below doughnut chart */}
									<Box
										sx={{
											mt: 3,
											display: "flex",
											justifyContent: "space-around",
											textAlign: "center",
										}}
									>
										<Box>
											<Typography
												variant="h6"
												sx={{ color: "#287068", fontWeight: 600 }}
											>
												💰 Money Donations
											</Typography>
											<Typography variant="body2" color="text.secondary">
												{(() => {
													const moneyDonation =
														data?.data?.charts?.donationsByType?.find(
															(d) => d.type.toUpperCase() === "MONEY"
														);
													return `${moneyDonation?.count || 0} donations`;
												})()}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{formatCurrency(
													data?.data?.charts?.donationsByType?.find(
														(d) => d.type.toUpperCase() === "MONEY"
													)?.amount || 0
												)}
											</Typography>
										</Box>
										<Box>
											<Typography
												variant="h6"
												sx={{ color: "#f59e0b", fontWeight: 600 }}
											>
												📦 Item Donations
											</Typography>
											<Typography variant="body2" color="text.secondary">
												{(() => {
													const itemDonationsCount =
														data?.data?.charts?.donationsByType
															?.filter((d) => d.type.toUpperCase() !== "MONEY")
															?.reduce((sum, d) => sum + (d.count || 0), 0) ||
														0;
													return `${itemDonationsCount} donations`;
												})()}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{(
													data?.data?.charts?.donationsByType
														?.filter((d) => d.type.toUpperCase() !== "MONEY")
														?.reduce((sum, d) => sum + (d.count || 0), 0) || 0
												).toLocaleString()}{" "}
												items
											</Typography>
										</Box>
									</Box>

									{/* Label for center text */}
									<Box
										sx={{
											mt: 2,
											textAlign: "center",
											p: 1,
											backgroundColor: "#f8fafc",
											borderRadius: 2,
										}}
									></Box>
								</Box>
							</Grow>
						</Box>
					)}

					{/* Item Donations Bar Chart */}
					{formatItemDonationsData.labels.length > 0 && (
						<Box>
							<Grow in timeout={1800}>
								<Box
									sx={{
										p: 3,
										borderRadius: 3,
										backgroundColor: "white",
										boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
									}}
								>
									<BarChart
										title="📊 Item Donations by Category"
										data={formatItemDonationsData}
										height={400}
										currency={false}
										horizontal={false}
										showGrid={true}
										aria-label="Item donations by category bar chart"
									/>

									{/* Add summary below chart */}
									<Box
										sx={{
											mt: 3,
											p: 2,
											backgroundColor: "#f8fafc",
											borderRadius: 2,
										}}
									>
										<Typography
											variant="subtitle2"
											sx={{ fontWeight: 600, mb: 1, color: "#374151" }}
										>
											📋 Item Donation Summary
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Total Item Categories:{" "}
											{formatItemDonationsData.labels.length}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Total Items Donated:{" "}
											{formatItemDonationsData.datasets[0]?.data.reduce(
												(sum: number, val: number) => sum + val,
												0
											) || 0}
										</Typography>
									</Box>
								</Box>
							</Grow>
						</Box>
					)}
				</Box>
			</Container>
		</Box>
	);
};

export default OrganizationAnalyticsPage;
