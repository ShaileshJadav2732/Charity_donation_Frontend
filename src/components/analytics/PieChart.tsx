"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { Box, Typography, Paper } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
	title: string;
	data: {
		type: string;
		count: number;
		amount?: number;
	}[];
	showAmount?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
	title,
	data,
	showAmount = false,
}) => {
	// Define colors for different donation types based on your analytics page
	const getDonationTypeColor = (type: string) => {
		switch (type.toUpperCase()) {
			case "MONEY":
				return "#287068"; // Teal (primary)
			case "CLOTHES":
				return "#3b82f6"; // Blue
			case "FOOD":
				return "#10b981"; // Green
			case "BLOOD":
				return "#ef4444"; // Red
			case "BOOKS":
				return "#f59e0b"; // Yellow/Amber
			case "FURNITURE":
				return "#8b5cf6"; // Purple
			case "HOUSEHOLD":
				return "#06b6d4"; // Cyan
			case "TOYS":
				return "#f97316"; // Orange
			case "ELECTRONICS":
				return "#6366f1"; // Indigo
			case "OTHER":
			default:
				return "#6b7280"; // Gray
		}
	};

	// Get colors for each data item based on donation type
	const colors = data.map((item) => getDonationTypeColor(item.type));

	const chartData = {
		labels: data.map((item) => {
			const typeLabels: { [key: string]: string } = {
				MONEY: "Money",
				CLOTHES: "Clothes",
				FOOD: "Food",
				BOOKS: "Books",
				TOYS: "Toys",
				ELECTRONICS: "Electronics",
				OTHER: "Other",
			};
			return typeLabels[item.type] || item.type;
		}),
		datasets: [
			{
				data: showAmount
					? data.map((item) => item.amount || 0)
					: data.map((item) => item.count),
				backgroundColor: colors,
				borderColor: colors.map((color) => color + "80"),
				borderWidth: 2,
				hoverBackgroundColor: colors.map((color) => color + "CC"),
				hoverBorderColor: colors,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "bottom" as const,
				labels: {
					padding: 20,
					usePointStyle: true,
				},
			},
			tooltip: {
				callbacks: {
					label: function (context: any) {
						const label = context.label || "";
						const value = context.parsed;
						const total = context.dataset.data.reduce(
							(a: number, b: number) => a + b,
							0
						);
						const percentage = ((value / total) * 100).toFixed(1);

						if (showAmount) {
							return `${label}: $${value.toLocaleString()} (${percentage}%)`;
						} else {
							return `${label}: ${value} donations (${percentage}%)`;
						}
					},
				},
			},
		},
	};

	return (
		<Paper sx={{ p: 3, height: "400px" }}>
			<Typography variant="h6" gutterBottom>
				{title}
			</Typography>
			<Box sx={{ height: "320px" }}>
				<Pie data={chartData} options={options} />
			</Box>
		</Paper>
	);
};

export default PieChart;
