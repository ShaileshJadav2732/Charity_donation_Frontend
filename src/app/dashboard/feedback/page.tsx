"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import FeedbackList from "@/components/feedback/FeedbackList";

const FeedbackPage = () => {
	return (
		<Box>
			<Typography variant="h4" gutterBottom>
				Feedback
			</Typography>
			<FeedbackList />
		</Box>
	);
};

export default FeedbackPage;
