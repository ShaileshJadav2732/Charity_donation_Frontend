"use client";

import { useGetFeedbacksQuery } from "@/store/api/feedbackApi";
import {
	Box,
	Card,
	CardContent,
	CircularProgress,
	Grid,
	LinearProgress,
	Rating,
	Typography,
} from "@mui/material";
import React, { useMemo } from "react";

interface FeedbackStatsProps {
	organizationId?: string;
	campaignId?: string;
	causeId?: string;
}

const FeedbackStats: React.FC<FeedbackStatsProps> = ({
	organizationId,
	campaignId,
	causeId,
}) => {
	// Prepare query params - get all approved feedbacks
	const queryParams = {
		limit: 100, // Get a large number to calculate stats
		...(organizationId && { organization: organizationId }),
		...(campaignId && { campaign: campaignId }),
		...(causeId && { cause: causeId }),
		isPublic: true,
		status: "approved",
	};

	// Fetch feedbacks
	const { data, isLoading, error } = useGetFeedbacksQuery(queryParams);

	// Calculate statistics
	const stats = useMemo(() => {
		if (!data?.feedbacks || data.feedbacks.length === 0) {
			return {
				averageRating: 0,
				totalFeedback: 0,
				distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
			};
		}

		// Calculate rating distribution
		const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		let totalRating = 0;

		data.feedbacks.forEach((feedback) => {
			const rating = Math.round(feedback.rating);
			if (rating >= 1 && rating <= 5) {
				distribution[rating as keyof typeof distribution]++;
				totalRating += feedback.rating;
			}
		});

		return {
			averageRating: totalRating / data.feedbacks.length,
			totalFeedback: data.feedbacks.length,
			distribution,
		};
	}, [data]);

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" p={3}>
				<CircularProgress />
			</Box>
		);
	}

	//  if (error) {
	//     return (
	//        <Alert severity="error">
	//           Failed to load feedback statistics. Please try again later.
	//        </Alert>
	//     );
	//  }

	//  if (stats.totalFeedback === 0) {
	//     return (
	//        <Alert severity="info">
	//           No feedback available yet. Statistics will appear once users provide feedback.
	//        </Alert>
	//     );
	//  }

	return (
		<Card>
			<CardContent>
				<Grid container spacing={3}>
					{/* Average rating display */}
					<Grid item xs={12} md={4}>
						<Box textAlign="center">
							<Typography variant="h4" gutterBottom>
								{stats.averageRating.toFixed(1)}
							</Typography>
							<Rating
								value={stats.averageRating}
								precision={0.1}
								readOnly
								size="large"
							/>
							<Typography variant="subtitle2" color="text.secondary" mt={1}>
								Average Rating ({stats.totalFeedback} reviews)
							</Typography>
						</Box>
					</Grid>

					{/* Rating distribution */}
					<Grid item xs={12} md={8}>
						{[5, 4, 3, 2, 1].map((rating) => (
							<Box
								key={rating}
								sx={{ display: "flex", alignItems: "center", mb: 1 }}
							>
								<Typography variant="body2" sx={{ minWidth: 30 }}>
									{rating}★
								</Typography>
								<LinearProgress
									variant="determinate"
									value={
										(stats.distribution[
											rating as keyof typeof stats.distribution
										] /
											stats.totalFeedback) *
										100
									}
									sx={{
										flexGrow: 1,
										mx: 1,
										height: 8,
										borderRadius: 4,
									}}
									color={
										rating >= 4
											? "success"
											: rating >= 3
											? "info"
											: rating >= 2
											? "warning"
											: "error"
									}
								/>
								<Typography variant="body2" sx={{ minWidth: 30 }}>
									{
										stats.distribution[
											rating as keyof typeof stats.distribution
										]
									}
								</Typography>
							</Box>
						))}
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

export default FeedbackStats;
