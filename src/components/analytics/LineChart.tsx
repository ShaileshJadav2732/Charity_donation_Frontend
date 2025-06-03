"use client";

import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
	TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Paper, Typography, Box } from "@mui/material";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler
);

interface LineChartData {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		borderColor?: string;
		backgroundColor?: string;
		fill?: boolean;
		tension?: number;
	}[];
}

interface LineChartProps {
	title: string;
	data: LineChartData;
	height?: number;
	showLegend?: boolean;
	showGrid?: boolean;
	currency?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
	title,
	data,
	height = 300,
	showLegend = true,
	showGrid = true,
	currency = false,
}) => {
	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: showLegend,
				position: "top" as const,
				labels: {
					usePointStyle: true,
					padding: 20,
					font: {
						size: 12,
					},
				},
			},
			tooltip: {
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				titleColor: "#fff",
				bodyColor: "#fff",
				borderColor: "#2f8077",
				borderWidth: 1,
				cornerRadius: 8,
				displayColors: true,
				callbacks: {
					label: function (context: TooltipItem<"line">) {
						const label = context.dataset.label || "";
						const value = context.parsed.y;
						const formattedValue = currency
							? `₹${value.toLocaleString()}`
							: value.toLocaleString();
						return `${label}: ${formattedValue}`;
					},
				},
			},
		},
		scales: {
			x: {
				display: true,
				grid: {
					display: showGrid,
					color: "rgba(0, 0, 0, 0.05)",
				},
				ticks: {
					color: "#6b7280",
					font: {
						size: 11,
					},
				},
			},
			y: {
				display: true,
				grid: {
					display: showGrid,
					color: "rgba(0, 0, 0, 0.05)",
				},
				ticks: {
					color: "#6b7280",
					font: {
						size: 11,
					},
					callback: function (value: string | number) {
						const numValue =
							typeof value === "string" ? parseFloat(value) : value;
						if (currency) {
							return `₹${numValue.toLocaleString()}`;
						}
						return numValue.toLocaleString();
					},
				},
				beginAtZero: true,
			},
		},
		interaction: {
			intersect: false,
			mode: "index" as const,
		},
		elements: {
			point: {
				radius: 4,
				hoverRadius: 6,
				borderWidth: 2,
			},
			line: {
				borderWidth: 3,
			},
		},
	};

	return (
		<Paper
			sx={{
				p: 3,
				borderRadius: 3,
				boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
				border: "1px solid rgba(0,0,0,0.05)",
			}}
		>
			<Typography
				variant="h6"
				sx={{
					mb: 3,
					fontWeight: 600,
					color: "#1f2937",
				}}
			>
				{title}
			</Typography>
			<Box sx={{ height: height }}>
				<Line data={data} options={options} />
			</Box>
		</Paper>
	);
};

export default LineChart;
