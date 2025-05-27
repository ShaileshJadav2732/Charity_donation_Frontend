"use client";

import React from "react";
import {
	Grid,
	Typography,
	Box,
	CircularProgress,
	Alert,
	Paper,
	List,
	ListItem,
	ListItemText,
	Chip,
} from "@mui/material";
import {
	DollarSign,
	TrendingUp,
	Heart,
	Target,
	Award,
	Building2,
} from "lucide-react";
import { useGetDonorAnalyticsQuery } from "@/store/api/analyticsApi";
import StatsCard from "./StatsCard";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import DonationTypeChart from "./DonationTypeChart";

const DonorAnalytics: React.FC = () => {
	const { data, isLoading, error } = useGetDonorAnalyticsQuery();

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "400px",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert severity="error" sx={{ m: 2 }}>
				Failed to load analytics data. Please try again later.
			</Alert>
		);
	}

	if (!data?.data) {
		return (
			<Alert severity="info" sx={{ m: 2 }}>
				No analytics data available yet. Start making donations to see your
				impact!
			</Alert>
		);
	}

	const { stats, charts, recentActivity } = data.data;

	// Provide default values if data is undefined
	const safeStats = stats || {
		totalDonations: 0,
		donationGrowth: 0,
		causesSupported: 0,
		activeCategories: 0,
		impactScore: 0,
		impactPercentile: 0,
		organizationsCount: 0,
		supportingOrganizations: 0,
		totalDonationCount: 0,
	};

	const safeCharts = {
		monthlyTrends: charts?.monthlyTrends || [],
		donationsByType: charts?.donationsByType || [],
		topCauses: charts?.topCauses || [],
	};

	const safeRecentActivity = recentActivity || [];

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: "bold" }}>
				Your Donation Analytics
			</Typography>

			{/* Quick Donation Type Summary */}
			{safeCharts.donationsByType && safeCharts.donationsByType.length > 0 && (
				<Box sx={{ mb: 4, p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }}>
					<Typography
						variant="subtitle1"
						gutterBottom
						sx={{ fontWeight: 600, mb: 2 }}
					>
						Donation Types Summary
					</Typography>
					<DonationTypeChart
						title=""
						data={safeCharts.donationsByType}
						showAmount={false}
						variant="chart"
					/>
				</Box>
			)}

			{/* Stats Cards */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={6} md={4}>
					<StatsCard
						title="Total Donations"
						value={safeStats.totalDonations}
						prefix="$"
						trend={{
							value: safeStats.donationGrowth,
							isPositive: safeStats.donationGrowth >= 0,
						}}
						icon={<DollarSign size={24} />}
						color="#287068"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={4}>
					<StatsCard
						title="Causes Supported"
						value={safeStats.causesSupported}
						subtitle={`${safeStats.totalDonationCount} total donations`}
						icon={<Heart size={24} />}
						color="#2f8077"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={4}>
					<StatsCard
						title="Impact Score"
						value={safeStats.impactScore}
						subtitle={`Top ${safeStats.impactPercentile}% of donors`}
						icon={<Award size={24} />}
						color="#4a9b8e"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={4}>
					<StatsCard
						title="Organizations Supported"
						value={safeStats.organizationsCount}
						icon={<Building2 size={24} />}
						color="#65b6a5"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={4}>
					<StatsCard
						title="Active Categories"
						value={safeStats.activeCategories}
						subtitle="Different donation types"
						icon={<Target size={24} />}
						color="#80d1bc"
					/>
				</Grid>
			</Grid>

			{/* Charts */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} lg={8}>
					<LineChart
						title="Donation Trends (Last 6 Months)"
						data={safeCharts.monthlyTrends}
						showAmount={true}
						showCount={false}
					/>
				</Grid>
				<Grid item xs={12} lg={4}>
					<DonationTypeChart
						title="Donations by Type"
						data={safeCharts.donationsByType}
						showAmount={false}
						variant="list"
					/>
				</Grid>
			</Grid>

			{/* Additional Donation Type Breakdown */}
			{safeCharts.donationsByType && safeCharts.donationsByType.length > 0 && (
				<Grid container spacing={3} sx={{ mb: 4 }}>
					<Grid item xs={12}>
						<DonationTypeChart
							title="Donation Types Overview"
							data={safeCharts.donationsByType}
							showAmount={true}
							variant="grid"
						/>
					</Grid>
				</Grid>
			)}

			<Grid container spacing={3} sx={{ mb: 4 }}>
				{safeCharts.topCauses && safeCharts.topCauses.length > 0 && (
					<Grid item xs={12} lg={8}>
						<BarChart
							title="Top Supported Causes"
							data={safeCharts.topCauses}
							showAmount={true}
							horizontal={true}
							useTypeColors={false}
						/>
					</Grid>
				)}
				<Grid item xs={12} lg={4}>
					<Paper sx={{ p: 3, height: "400px" }}>
						<Typography variant="h6" gutterBottom>
							Recent Activity
						</Typography>
						<List sx={{ maxHeight: "320px", overflow: "auto" }}>
							{safeRecentActivity.slice(0, 5).map((activity, index) => (
								<ListItem key={activity.id} divider={index < 4}>
									<ListItemText
										primary={
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 1 }}
											>
												<Typography variant="body2">
													{activity.campaignName}
												</Typography>
												{activity.amount && (
													<Chip
														label={`$${activity.amount}`}
														size="small"
														sx={{
															backgroundColor: "#287068",
															color: "white",
															fontWeight: 500,
														}}
													/>
												)}
												{activity.type && (
													<Chip
														label={activity.type}
														size="small"
														sx={{
															backgroundColor: (() => {
																switch (activity.type?.toUpperCase()) {
																	case "MONEY":
																		return "#287068";
																	case "CLOTHES":
																		return "#3b82f6";
																	case "FOOD":
																		return "#10b981";
																	case "BLOOD":
																		return "#ef4444";
																	case "BOOKS":
																		return "#f59e0b";
																	case "FURNITURE":
																		return "#8b5cf6";
																	case "HOUSEHOLD":
																		return "#06b6d4";
																	case "TOYS":
																		return "#f97316";
																	case "ELECTRONICS":
																		return "#6366f1";
																	default:
																		return "#6b7280";
																}
															})(),
															color: "white",
															fontWeight: 500,
															fontSize: "0.75rem",
														}}
													/>
												)}
											</Box>
										}
										secondary={
											<Box>
												<Typography variant="caption" color="text.secondary">
													{activity.organizationName}
												</Typography>
												<br />
												<Typography variant="caption" color="text.secondary">
													{new Date(activity.timestamp).toLocaleDateString()}
												</Typography>
											</Box>
										}
									/>
								</ListItem>
							))}
						</List>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default DonorAnalytics;
