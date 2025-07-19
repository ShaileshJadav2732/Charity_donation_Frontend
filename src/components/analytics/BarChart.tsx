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
import { Paper, Typography, Box } from "@mui/material";
import { BarChartProps } from "../../types/analytics";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const BarChart: React.FC<BarChartProps> = ({
	title,
	data,
	height = 300,
	showLegend = true,
	showGrid = true,
	currency = false,
	horizontal = false,
}) => {
	const options = {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: horizontal ? ("y" as const) : ("x" as const),
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
					label: function (context: {
						dataset: { label?: string };
						parsed: { x: number; y: number };
					}) {
						const label = context.dataset.label || "";
						const value = context.parsed[horizontal ? "x" : "y"];
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
					callback: function (value: string | number) {
						const numValue =
							typeof value === "string" ? parseFloat(value) : value;
						if (horizontal && currency) {
							return `₹${numValue.toLocaleString()}`;
						}
						return numValue.toLocaleString();
					},
				},
				beginAtZero: horizontal,
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
						if (!horizontal && currency) {
							return `₹${numValue.toLocaleString()}`;
						}
						return numValue.toLocaleString();
					},
				},
				beginAtZero: !horizontal,
			},
		},
		elements: {
			bar: {
				borderRadius: 6,
				borderSkipped: false,
			},
		},
	};

	const ChartComponent = Bar;

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
				<ChartComponent data={data} options={options} />
			</Box>
		</Paper>
	);
};

export default BarChart;
