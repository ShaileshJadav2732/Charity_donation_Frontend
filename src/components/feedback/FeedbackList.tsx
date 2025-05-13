import React, { useState } from "react";
import {
	useGetOrganizationFeedbackQuery,
	useGetFeedbackStatsQuery,
	useUpdateFeedbackStatusMutation,
} from "@/store/api/feedbackApi";
import {
	Box,
	Card,
	CardContent,
	Typography,
	Rating,
	Chip,
	LinearProgress,
	Grid,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Pagination,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";

interface FeedbackListProps {
	organizationId: string;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ organizationId }) => {
	const [page, setPage] = useState(1);
	const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
	const [statusDialogOpen, setStatusDialogOpen] = useState(false);

	const { data: feedbackData, isLoading } = useGetOrganizationFeedbackQuery({
		organizationId,
		page,
		limit: 5,
	});

	const { data: statsData } = useGetFeedbackStatsQuery({ organizationId });
	const [updateStatus] = useUpdateFeedbackStatusMutation();

	const handleStatusUpdate = async (status: "approved" | "rejected") => {
		if (selectedFeedback) {
			await updateStatus({ feedbackId: selectedFeedback, status });
			setStatusDialogOpen(false);
			setSelectedFeedback(null);
		}
	};

	const handlePageChange = (event: unknown, value: number) => {
		setPage(value);
	};

	if (isLoading) {
		return <LinearProgress />;
	}

	const stats = statsData?.data;
	const distribution = stats?.ratingDistribution || {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
	};

	const totalFeedback = Object.values(distribution).reduce((a, b) => a + b, 0);

	return (
		<Box>
			{/* Stats Section */}
			<Card sx={{ mb: 4 }}>
				<CardContent>
					<Grid container spacing={3}>
						<Grid item xs={12} md={4}>
							<Box textAlign="center">
								<Typography variant="h4" gutterBottom>
									{stats?.averageRating.toFixed(1) || 0}
								</Typography>
								<Rating
									value={stats?.averageRating || 0}
									precision={0.1}
									readOnly
								/>
								<Typography variant="subtitle2" color="text.secondary">
									Average Rating ({stats?.totalFeedback || 0} reviews)
								</Typography>
							</Box>
						</Grid>
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
											(distribution[rating as keyof typeof distribution] /
												(totalFeedback || 1)) *
											100
										}
										sx={{ flexGrow: 1, mx: 1 }}
									/>
									<Typography variant="body2" sx={{ minWidth: 30 }}>
										{distribution[rating as keyof typeof distribution]}
									</Typography>
								</Box>
							))}
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Feedback List */}
			<Box>
				{feedbackData?.data.map((feedback) => (
					<Card key={feedback._id} sx={{ mb: 2 }}>
						<CardContent>
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
								mb={1}
							>
								<Rating value={feedback.rating} readOnly />
								<Chip
									label={feedback.status}
									color={
										feedback.status === "approved"
											? "success"
											: feedback.status === "rejected"
											? "error"
											: "default"
									}
									size="small"
								/>
							</Box>
							<Typography variant="body1" gutterBottom>
								{feedback.comment}
							</Typography>
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
								mt={2}
							>
								<Typography variant="caption" color="text.secondary">
									{formatDistanceToNow(new Date(feedback.createdAt), {
										addSuffix: true,
									})}
								</Typography>
								{feedback.status === "pending" && (
									<Box>
										<Button
											size="small"
											onClick={() => {
												setSelectedFeedback(feedback._id);
												setStatusDialogOpen(true);
											}}
										>
											Moderate
										</Button>
									</Box>
								)}
							</Box>
						</CardContent>
					</Card>
				))}
			</Box>

			{/* Pagination */}
			{feedbackData?.pagination.pages > 1 && (
				<Box display="flex" justifyContent="center" mt={2}>
					<Pagination
						count={feedbackData.pagination.pages}
						page={page}
						onChange={handlePageChange}
					/>
				</Box>
			)}

			{/* Status Update Dialog */}
			<Dialog
				open={statusDialogOpen}
				onClose={() => setStatusDialogOpen(false)}
			>
				<DialogTitle>Update Feedback Status</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to update the status of this feedback?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={() => handleStatusUpdate("rejected")}
						color="error"
						variant="contained"
					>
						Reject
					</Button>
					<Button
						onClick={() => handleStatusUpdate("approved")}
						color="primary"
						variant="contained"
					>
						Approve
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default FeedbackList;
