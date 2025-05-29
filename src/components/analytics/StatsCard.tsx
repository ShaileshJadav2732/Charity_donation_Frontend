"use client";

import React from "react";
import { Paper, Typography, Box, Chip } from "@mui/material";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	icon?: React.ReactNode;
	color?: string;
	prefix?: string;
	suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
	title,
	value,
	subtitle,
	trend,
	icon,
	color = "#287068",
	prefix = "",
	suffix = "",
}) => {
	const formatValue = (val: string | number) => {
		if (typeof val === "number") {
			if (val >= 1000000) {
				return (val / 1000000).toFixed(1) + "M";
			} else if (val >= 1000) {
				return (val / 1000).toFixed(1) + "K";
			}
			return val.toLocaleString();
		}
		return val;
	};

	const getTrendIcon = () => {
		if (!trend) return undefined;

		if (trend.value === 0) {
			return <Minus size={16} />;
		}

		return trend.isPositive ? (
			<TrendingUp size={16} />
		) : (
			<TrendingDown size={16} />
		);
	};

	const getTrendColor = () => {
		if (!trend) return "default";

		if (trend.value === 0) return "default";

		return trend.isPositive ? "success" : "error";
	};

	return (
		<Paper
			sx={{
				p: 3,
				height: "160px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				position: "relative",
				overflow: "hidden",
				borderRadius: 3,
				transition: "all 0.3s ease",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
				},
				"&::before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: "4px",
					backgroundColor: color,
				},
				"&::after": {
					content: '""',
					position: "absolute",
					top: -50,
					right: -50,
					width: 100,
					height: 100,
					borderRadius: "50%",
					backgroundColor: color,
					opacity: 0.05,
					zIndex: 0,
				},
			}}
		>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					position: "relative",
					zIndex: 1,
				}}
			>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ fontWeight: 500 }}
				>
					{title}
				</Typography>
				{icon && <Box sx={{ color: color, opacity: 0.8 }}>{icon}</Box>}
			</Box>

			<Box sx={{ position: "relative", zIndex: 1 }}>
				<Typography
					variant="h4"
					sx={{
						fontWeight: "bold",
						color: "text.primary",
						mb: 0.5,
					}}
				>
					{prefix}
					{formatValue(value)}
					{suffix}
				</Typography>

				{subtitle && (
					<Typography variant="body2" color="text.secondary">
						{subtitle}
					</Typography>
				)}
			</Box>

			{trend && (
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Chip
						icon={getTrendIcon()}
						label={`${trend.isPositive ? "+" : ""}${trend.value}%`}
						size="small"
						color={getTrendColor()}
						variant="outlined"
						sx={{ fontSize: "0.75rem" }}
					/>
					<Typography variant="caption" color="text.secondary">
						vs last period
					</Typography>
				</Box>
			)}
		</Paper>
	);
};

export default StatsCard;
