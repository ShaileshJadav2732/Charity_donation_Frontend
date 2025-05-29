"use client";

import React from "react";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { Paper, Typography, Box } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartData {
	labels: string[];
	datasets: {
		data: number[];
		backgroundColor: string[];
		borderColor?: string[];
		borderWidth?: number;
		hoverBorderWidth?: number;
	}[];
}

interface PieChartProps {
	title: string;
	data: PieChartData;
	height?: number;
	showLegend?: boolean;
	currency?: boolean;
	showPercentage?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
	title,
	data,
	height = 300,
	showLegend = true,
	currency = false,
	showPercentage = true,
}) => {
	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: showLegend,
				position: "bottom" as const,
				labels: {
					usePointStyle: true,
					padding: 20,
					font: {
						size: 12,
					},
					generateLabels: function (chart: any) {
						const data = chart.data;
						if (data.labels.length && data.datasets.length) {
							const dataset = data.datasets[0];
							const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0);
							
							return data.labels.map((label: string, index: number) => {
								const value = dataset.data[index];
								const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
								const formattedValue = currency ? `₹${value.toLocaleString()}` : value.toLocaleString();
								
								return {
									text: showPercentage ? `${label}: ${percentage}%` : `${label}: ${formattedValue}`,
									fillStyle: dataset.backgroundColor[index],
									strokeStyle: dataset.borderColor?.[index] || dataset.backgroundColor[index],
									lineWidth: dataset.borderWidth || 0,
									hidden: false,
									index: index,
								};
							});
						}
						return [];
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
					label: function (context: any) {
						const label = context.label || "";
						const value = context.parsed;
						const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
						const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
						const formattedValue = currency ? `₹${value.toLocaleString()}` : value.toLocaleString();
						
						return `${label}: ${formattedValue} (${percentage}%)`;
					},
				},
			},
		},
		elements: {
			arc: {
				borderWidth: 2,
				hoverBorderWidth: 4,
			},
		},
		cutout: 0, // Set to 0 for pie chart, use percentage for doughnut
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
					textAlign: "center",
				}}
			>
				{title}
			</Typography>
			<Box sx={{ height: height }}>
				<Pie data={data} options={options} />
			</Box>
		</Paper>
	);
};

export default PieChart;
