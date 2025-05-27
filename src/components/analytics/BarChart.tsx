"use client";

import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Box, Typography, Paper } from "@mui/material";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

interface BarChartProps {
	title: string;
	data: {
		name: string;
		amount: number;
		count?: number;
		type?: string; // Add type field for donation type colors
	}[];
	color?: string;
	horizontal?: boolean;
	showAmount?: boolean;
	useTypeColors?: boolean; // Flag to enable type-based colors
}

const BarChart: React.FC<BarChartProps> = ({
	title,
	data,
	color = "#287068",
	horizontal = false,
	showAmount = true,
	useTypeColors = false,
}) => {
	// Define colors for different donation types
	const getDonationTypeColor = (type: string) => {
		switch (type?.toUpperCase()) {
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

	// Get colors based on whether we're using type colors or single color
	const getColors = () => {
		if (useTypeColors && data.some((item) => item.type)) {
			return data.map((item) => getDonationTypeColor(item.type || ""));
		}
		return Array(data.length).fill(color);
	};

	const colors = getColors();
	const chartData = {
		labels: data.map((item) => {
			// Truncate long names
			return item.name.length > 20
				? item.name.substring(0, 20) + "..."
				: item.name;
		}),
		datasets: [
			{
				label: showAmount ? "Amount ($)" : "Count",
				data: showAmount
					? data.map((item) => item.amount)
					: data.map((item) => item.count || 0),
				backgroundColor: colors.map((c) => c + "80"),
				borderColor: colors,
				borderWidth: 2,
				borderRadius: 4,
				hoverBackgroundColor: colors.map((c) => c + "CC"),
				hoverBorderColor: colors,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: horizontal ? ("y" as const) : ("x" as const),
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				callbacks: {
					label: function (context: any) {
						const value = context.parsed[horizontal ? "x" : "y"];
						if (showAmount) {
							return `Amount: $${value.toLocaleString()}`;
						} else {
							return `Count: ${value}`;
						}
					},
				},
			},
		},
		scales: {
			x: {
				grid: {
					display: !horizontal,
					color: "#f0f0f0",
				},
				ticks: {
					callback: function (value: any, index: number) {
						if (horizontal) {
							return showAmount
								? "$" + value.toLocaleString()
								: value.toString();
						}
						return this.getLabelForValue(value);
					},
				},
			},
			y: {
				grid: {
					display: horizontal,
					color: "#f0f0f0",
				},
				ticks: {
					callback: function (value: any, index: number) {
						if (!horizontal) {
							return showAmount
								? "$" + value.toLocaleString()
								: value.toString();
						}
						return this.getLabelForValue(value);
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
				<Bar data={chartData} options={options} />
			</Box>
		</Paper>
	);
};

export default BarChart;
