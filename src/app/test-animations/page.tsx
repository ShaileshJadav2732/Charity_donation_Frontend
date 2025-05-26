"use client";

import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function TestAnimationsPage() {
	const [showTest, setShowTest] = useState(false);

	return (
		<Box sx={{ p: 4, textAlign: "center" }}>
			<Typography variant="h4" gutterBottom>
				Animation Test Page
			</Typography>

			<Button
				variant="contained"
				onClick={() => setShowTest(!showTest)}
				sx={{ mb: 2 }}
			>
				Toggle Test
			</Button>

			{showTest && (
				<Box
					sx={{
						p: 3,
						backgroundColor: "#f0f0f0",
						borderRadius: 2,
						animation: "fadeIn 0.5s ease-in",
					}}
				>
					<Typography variant="h6">Basic animation test working! ✅</Typography>
				</Box>
			)}

			<style jsx>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</Box>
	);
}
