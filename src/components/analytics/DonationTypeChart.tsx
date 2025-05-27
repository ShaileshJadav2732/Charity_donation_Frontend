"use client";

import React from "react";
import { Paper, Typography, Box, Grid, Chip } from "@mui/material";
import {
	FaTshirt,
	FaUtensils,
	FaBook,
	FaCouch,
	FaHome,
	FaQuestion,
	FaBoxOpen,
	FaDollarSign,
	FaGamepad,
	FaLaptop,
} from "react-icons/fa";
import { GiBlood } from "react-icons/gi";

interface DonationTypeData {
	type: string;
	count: number;
	amount?: number;
	percentage?: number;
}

interface DonationTypeChartProps {
	title: string;
	data: DonationTypeData[];
	showAmount?: boolean;
	variant?: "grid" | "list" | "chart";
}

const DonationTypeChart: React.FC<DonationTypeChartProps> = ({
	title,
	data,
	showAmount = false,
	variant = "grid",
}) => {
	// Define colors and icons for different donation types
	const getDonationTypeConfig = (type: string) => {
		switch (type.toUpperCase()) {
			case "MONEY":
				return {
					color: "#287068",
					bgColor: "#287068",
					lightBg: "rgba(40, 112, 104, 0.1)",
					icon: <FaDollarSign className="h-5 w-5" />,
					label: "Money",
				};
			case "CLOTHES":
				return {
					color: "#3b82f6",
					bgColor: "#3b82f6",
					lightBg: "rgba(59, 130, 246, 0.1)",
					icon: <FaTshirt className="h-5 w-5" />,
					label: "Clothes",
				};
			case "FOOD":
				return {
					color: "#10b981",
					bgColor: "#10b981",
					lightBg: "rgba(16, 185, 129, 0.1)",
					icon: <FaUtensils className="h-5 w-5" />,
					label: "Food",
				};
			case "BLOOD":
				return {
					color: "#ef4444",
					bgColor: "#ef4444",
					lightBg: "rgba(239, 68, 68, 0.1)",
					icon: <GiBlood className="h-5 w-5" />,
					label: "Blood",
				};
			case "BOOKS":
				return {
					color: "#f59e0b",
					bgColor: "#f59e0b",
					lightBg: "rgba(245, 158, 11, 0.1)",
					icon: <FaBook className="h-5 w-5" />,
					label: "Books",
				};
			case "FURNITURE":
				return {
					color: "#8b5cf6",
					bgColor: "#8b5cf6",
					lightBg: "rgba(139, 92, 246, 0.1)",
					icon: <FaCouch className="h-5 w-5" />,
					label: "Furniture",
				};
			case "HOUSEHOLD":
				return {
					color: "#06b6d4",
					bgColor: "#06b6d4",
					lightBg: "rgba(6, 182, 212, 0.1)",
					icon: <FaHome className="h-5 w-5" />,
					label: "Household",
				};
			case "TOYS":
				return {
					color: "#f97316",
					bgColor: "#f97316",
					lightBg: "rgba(249, 115, 22, 0.1)",
					icon: <FaGamepad className="h-5 w-5" />,
					label: "Toys",
				};
			case "ELECTRONICS":
				return {
					color: "#6366f1",
					bgColor: "#6366f1",
					lightBg: "rgba(99, 102, 241, 0.1)",
					icon: <FaLaptop className="h-5 w-5" />,
					label: "Electronics",
				};
			case "OTHER":
			default:
				return {
					color: "#6b7280",
					bgColor: "#6b7280",
					lightBg: "rgba(107, 114, 128, 0.1)",
					icon: <FaQuestion className="h-5 w-5" />,
					label: "Other",
				};
		}
	};

	// Calculate total for percentages
	const total = data.reduce((sum, item) => sum + (showAmount ? (item.amount || 0) : item.count), 0);

	// Grid variant - shows cards for each donation type
	const renderGridVariant = () => (
		<Grid container spacing={2}>
			{data.map((item, index) => {
				const config = getDonationTypeConfig(item.type);
				const value = showAmount ? (item.amount || 0) : item.count;
				const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";

				return (
					<Grid item xs={12} sm={6} md={4} key={index}>
						<Box
							sx={{
								p: 2,
								borderRadius: 2,
								backgroundColor: config.lightBg,
								border: `1px solid ${config.color}20`,
								transition: "all 0.2s ease-in-out",
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: `0 4px 12px ${config.color}30`,
								},
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
								<Box
									sx={{
										p: 1,
										borderRadius: 1,
										backgroundColor: config.color,
										color: "white",
										mr: 2,
									}}
								>
									{config.icon}
								</Box>
								<Typography variant="subtitle2" fontWeight="600">
									{config.label}
								</Typography>
							</Box>
							<Typography variant="h6" fontWeight="bold" color={config.color}>
								{showAmount ? `$${value.toLocaleString()}` : value}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{percentage}% of total
							</Typography>
						</Box>
					</Grid>
				);
			})}
		</Grid>
	);

	// List variant - shows horizontal bars
	const renderListVariant = () => (
		<Box sx={{ space: 2 }}>
			{data.map((item, index) => {
				const config = getDonationTypeConfig(item.type);
				const value = showAmount ? (item.amount || 0) : item.count;
				const percentage = total > 0 ? ((value / total) * 100) : 0;

				return (
					<Box key={index} sx={{ mb: 2 }}>
						<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box
									sx={{
										p: 0.5,
										borderRadius: 1,
										backgroundColor: config.color,
										color: "white",
										mr: 1,
									}}
								>
									{config.icon}
								</Box>
								<Typography variant="body2" fontWeight="500">
									{config.label}
								</Typography>
							</Box>
							<Typography variant="body2" fontWeight="600" color={config.color}>
								{showAmount ? `$${value.toLocaleString()}` : value}
							</Typography>
						</Box>
						<Box
							sx={{
								width: "100%",
								height: 8,
								backgroundColor: "#f3f4f6",
								borderRadius: 1,
								overflow: "hidden",
							}}
						>
							<Box
								sx={{
									width: `${percentage}%`,
									height: "100%",
									backgroundColor: config.color,
									transition: "width 0.3s ease-in-out",
								}}
							/>
						</Box>
						<Typography variant="caption" color="text.secondary">
							{percentage.toFixed(1)}%
						</Typography>
					</Box>
				);
			})}
		</Box>
	);

	// Chart variant - shows as chips with colors
	const renderChartVariant = () => (
		<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
			{data.map((item, index) => {
				const config = getDonationTypeConfig(item.type);
				const value = showAmount ? (item.amount || 0) : item.count;

				return (
					<Chip
						key={index}
						icon={config.icon}
						label={`${config.label}: ${showAmount ? `$${value.toLocaleString()}` : value}`}
						sx={{
							backgroundColor: config.lightBg,
							color: config.color,
							border: `1px solid ${config.color}`,
							fontWeight: 500,
							"& .MuiChip-icon": {
								color: config.color,
							},
						}}
					/>
				);
			})}
		</Box>
	);

	const renderContent = () => {
		switch (variant) {
			case "grid":
				return renderGridVariant();
			case "list":
				return renderListVariant();
			case "chart":
				return renderChartVariant();
			default:
				return renderGridVariant();
		}
	};

	return (
		<Paper sx={{ p: 3, height: variant === "grid" ? "auto" : "400px" }}>
			<Typography variant="h6" gutterBottom>
				{title}
			</Typography>
			{data.length > 0 ? (
				renderContent()
			) : (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "200px",
						color: "text.secondary",
					}}
				>
					<Typography variant="body2">No donation data available</Typography>
				</Box>
			)}
		</Paper>
	);
};

export default DonationTypeChart;
