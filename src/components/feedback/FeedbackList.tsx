"use client";

import { useGetFeedbacksQuery } from "@/store/api/feedbackApi";
import {
	Alert,
	Avatar,
	Box,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Pagination,
	Rating,
	Stack,
	Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React from "react";

interface FeedbackListProps {
	organizationId?: string;
	campaignId?: string;
	causeId?: string;
	limit?: number;
}

const FeedbackList: React.FC<FeedbackListProps> = ({
	organizationId,
	campaignId,
	causeId,
	limit = 5,
}) => {
	const [page, setPage] = React.useState(1);

	// Prepare query params
	const queryParams = {
		page,
		limit,
		...(organizationId && { organization: organizationId }),
		...(campaignId && { campaign: campaignId }),
		...(causeId && { cause: causeId }),
		isPublic: true,
		status: "approved",
	};

	// Fetch feedbacks
	const { data, isLoading, error } = useGetFeedbacksQuery(queryParams);

	// Handle page change
	const handlePageChange = (
		event: React.ChangeEvent<unknown>,
		value: number
	) => {
		setPage(value);
	};

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" p={3}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert severity="error">
				Failed to load feedback. Please try again later.
			</Alert>
		);
	}

	if (!data || !data.feedbacks || data.feedbacks.length === 0) {
		return (
			<Alert severity="info">
				No feedback available yet. Be the first to share your experience!
			</Alert>
		);
	}

	// Calculate total pages
	const totalPages = Math.ceil(data.total / limit);

	return (
		<Box>
			<Typography variant="h6" gutterBottom>
				User Feedback ({data.total})
			</Typography>

			<Stack spacing={2} mb={3}>
				{data.feedbacks.map((feedback) => (
					<Card key={feedback.id} variant="outlined">
						<CardContent>
							<Box display="flex" justifyContent="space-between" mb={1}>
								<Box display="flex" alignItems="center">
									<Avatar
										sx={{
											width: 32,
											height: 32,
											mr: 1,
											bgcolor: "primary.main",
										}}
									>
										{typeof feedback.donor === "string"
											? feedback.donor.charAt(0).toUpperCase()
											: (feedback.donor.firstName || feedback.donor.name || "")
													?.charAt(0)
													.toUpperCase()}
									</Avatar>
									<Typography variant="subtitle2">
										{typeof feedback.donor === "string"
											? feedback.donor.length > 20
												? `${feedback.donor.substring(0, 20)}...`
												: feedback.donor
											: feedback.donor.name ||
											  `${feedback.donor.firstName || ""} ${
													feedback.donor.lastName || ""
											  }`.trim()}
									</Typography>
								</Box>
								<Chip
									label={`Rating: ${feedback.rating}/5`}
									size="small"
									color={
										feedback.rating >= 4
											? "success"
											: feedback.rating >= 3
											? "info"
											: "warning"
									}
								/>
							</Box>

							<Rating value={feedback.rating} readOnly size="small" />

							<Typography variant="body2" color="text.secondary" mt={1}>
								{feedback.comment}
							</Typography>

							<Box display="flex" justifyContent="flex-end" mt={2}>
								<Typography variant="caption" color="text.secondary">
									{formatDistanceToNow(new Date(feedback.createdAt), {
										addSuffix: true,
									})}
								</Typography>
							</Box>
						</CardContent>
					</Card>
				))}
			</Stack>

			{totalPages > 1 && (
				<Box display="flex" justifyContent="center" mt={2}>
					<Pagination
						count={totalPages}
						page={page}
						onChange={handlePageChange}
						color="primary"
					/>
				</Box>
			)}
		</Box>
	);
};
export default FeedbackList;
