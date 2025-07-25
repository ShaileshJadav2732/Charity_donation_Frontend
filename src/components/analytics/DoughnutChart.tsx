"use client";

import React from "react";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	TooltipItem,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Paper, Typography, Box } from "@mui/material";
import { DoughnutChartData, DoughnutChartProps } from "../../types/analytics";
ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart: React.FC<DoughnutChartProps> = ({
	title,
	data,
	height = 1000,
	showLegend = true,
	showPercentage = true,
	cutout = "100%",
	centerText,
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
						size: 10,
					},
					generateLabels: function (chart: ChartJS) {
						const data = chart.data;
						if (data.labels && data.labels.length && data.datasets.length) {
							const dataset = data.datasets[0];
							const dataValues = dataset.data as number[];
							const total = dataValues.reduce(
								(sum: number, value: number) => sum + value,
								0
							);

							return (data.labels as string[]).map(
								(label: string, index: number) => {
									const value = dataValues[index];
									const percentage =
										total > 0 ? ((value / total) * 100).toFixed(1) : "0";
									const formattedValue = value.toLocaleString();

									const backgroundColors = dataset.backgroundColor as string[];
									const borderColors = dataset.borderColor as string[];

									return {
										text: showPercentage
											? `${label}: ${percentage}% (${formattedValue} donations)`
											: `${label}: ${formattedValue} donations`,
										fillStyle: backgroundColors?.[index] || "#000",
										strokeStyle:
											borderColors?.[index] ||
											backgroundColors?.[index] ||
											"#000",
										lineWidth: (dataset.borderWidth as number) || 0,
										hidden: false,
										index: index,
									};
								}
							);
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
					label: function (context: TooltipItem<"doughnut">) {
						const label = context.label || "";
						const value = context.parsed;
						const dataValues = context.dataset.data as number[];
						const total = dataValues.reduce(
							(sum: number, val: number) => sum + val,
							0
						);
						const percentage =
							total > 0 ? ((value / total) * 100).toFixed(1) : "0";

						return `${label}: ${value.toLocaleString()} donations (${percentage}%)`;
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
		cutout: cutout,
	};

	// Plugin to draw center text
	const centerTextPlugin = {
		id: "centerText",
		beforeDraw: function (chart: ChartJS) {
			if (centerText) {
				const { width, height, ctx } = chart;
				ctx.restore();
				const fontSize = (height / 114).toFixed(2);
				ctx.font = `bold ${fontSize}em sans-serif`;
				ctx.textBaseline = "middle";
				ctx.fillStyle = "#1f2937";

				const textX = Math.round(
					(width - ctx.measureText(centerText).width) / 2
				);
				const textY = height / 2;

				ctx.fillText(centerText, textX, textY);
				ctx.save();
			}
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
					textAlign: "center",
				}}
			>
				{title}
			</Typography>
			<Box sx={{ height: height }}>
				<Doughnut
					data={data}
					options={options}
					plugins={centerText ? [centerTextPlugin] : []}
				/>
			</Box>
		</Paper>
	);
};

export default DoughnutChart;
