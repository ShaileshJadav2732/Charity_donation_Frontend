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
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Box, Typography, Paper } from "@mui/material";

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

interface LineChartProps {
	title: string;
	data: {
		month: string;
		amount: number;
		count: number;
	}[];
	color?: string;
	showAmount?: boolean;
	showCount?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
	title,
	data,
	color = "#287068",
	showAmount = true,
	showCount = false,
}) => {
	const chartData = {
		labels: data.map((item) => {
			const [year, month] = item.month.split("-");
			const date = new Date(parseInt(year), parseInt(month) - 1);
			return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
		}),
		datasets: [
			...(showAmount
				? [
						{
							label: "Amount ($)",
							data: data.map((item) => item.amount),
							borderColor: color,
							backgroundColor: `${color}20`,
							fill: true,
							tension: 0.4,
							yAxisID: "y",
						},
				  ]
				: []),
			...(showCount
				? [
						{
							label: "Count",
							data: data.map((item) => item.count),
							borderColor: "#ff6b6b",
							backgroundColor: "#ff6b6b20",
							fill: false,
							tension: 0.4,
							yAxisID: "y1",
						},
				  ]
				: []),
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: false,
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
			},
			y: {
				type: "linear" as const,
				display: showAmount,
				position: "left" as const,
				grid: {
					color: "#f0f0f0",
				},
				ticks: {
					callback: function (value: any) {
						return "$" + value.toLocaleString();
					},
				},
			},
			...(showCount
				? {
						y1: {
							type: "linear" as const,
							display: true,
							position: "right" as const,
							grid: {
								drawOnChartArea: false,
							},
							ticks: {
								callback: function (value: any) {
									return value.toString();
								},
							},
						},
				  }
				: {}),
		},
	};

	return (
		<Paper sx={{ p: 3, height: "400px" }}>
			<Typography variant="h6" gutterBottom>
				{title}
			</Typography>
			<Box sx={{ height: "320px" }}>
				<Line data={chartData} options={options} />
			</Box>
		</Paper>
	);
};

export default LineChart;
