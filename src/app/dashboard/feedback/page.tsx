"use client";

import React, { useState } from "react";
import {
	Box,
	Container,
	Typography,
	Paper,
	Tabs,
	Tab,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	CircularProgress,
	Alert,
	Chip,
	Card,
	CardContent,
	Rating,
	Stack,
	Pagination,
	Divider,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useGetFeedbacksQuery, Feedback } from "@/store/api/feedbackApi";
import { formatDistanceToNow } from "date-fns";
import FeedbackStats from "@/components/feedback/FeedbackStats";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`feedback-tabpanel-${index}`}
			aria-labelledby={`feedback-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

const FeedbackPage = () => {
	const { user } = useSelector((state: RootState) => state.auth);
	const [tabValue, setTabValue] = useState(0);
	const [page, setPage] = useState(1);
	const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
		null
	);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogAction, setDialogAction] = useState<
		"approve" | "reject" | "delete"
	>("approve");
	const limit = 10;

	// Get organization ID from user
	const organizationId = user?.id;

	// Prepare query params based on current tab
	const queryParams = {
		page,
		limit,
		organization: organizationId,
		status:
			tabValue === 0 ? "pending" : tabValue === 1 ? "approved" : "rejected",
	};

	// Fetch feedbacks
	const { data, isLoading, error } = useGetFeedbacksQuery(
		organizationId ? queryParams : { page: 1, limit: 1 }, // Skip if no organizationId
		{ skip: !organizationId }
	);

	// Note: Update and delete mutations are not implemented yet
	// const [updateFeedback, { isLoading: isUpdating }] = useUpdateFeedbackMutation();
	// const [deleteFeedback, { isLoading: isDeleting }] = useDeleteFeedbackMutation();

	// Handle tab change
	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
		setPage(1); // Reset to first page when changing tabs
	};

	// Handle page change
	const handlePageChange = (
		event: React.ChangeEvent<unknown>,
		value: number
	) => {
		setPage(value);
	};

	// Open dialog for action
	const openActionDialog = (
		feedback: Feedback,
		action: "approve" | "reject" | "delete"
	) => {
		setSelectedFeedback(feedback);
		setDialogAction(action);
		setDialogOpen(true);
	};

	// Handle action confirmation
	const handleActionConfirm = async () => {
		if (!selectedFeedback) return;

		// TODO: Implement update and delete mutations
		console.log(`${dialogAction} feedback:`, selectedFeedback.id);
		alert(`${dialogAction} functionality not implemented yet`);

		setDialogOpen(false);
		setSelectedFeedback(null);
	};

	// Access control
	if (!user || user.role !== "organization") {
		return (
			<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
				<Alert severity="error">
					Access Denied. Only organizations can manage feedback.
				</Alert>
			</Container>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			<Paper sx={{ p: 3, mb: 4 }}>
				<Typography variant="h5" gutterBottom>
					Feedback Management
				</Typography>
				<Typography variant="body2" color="text.secondary" paragraph>
					View and manage feedback from your donors and supporters.
				</Typography>

				{/* Statistics Section */}
				<Box sx={{ mb: 4 }}>
					<Typography variant="h6" gutterBottom>
						Feedback Statistics
					</Typography>
					<FeedbackStats organizationId={organizationId} />
				</Box>

				<Divider sx={{ my: 3 }} />

				{/* Tabs for different feedback statuses */}
				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						aria-label="feedback tabs"
					>
						<Tab label="Pending" />
						<Tab label="Approved" />
						<Tab label="Rejected" />
					</Tabs>
				</Box>

				{/* Tab Panels */}
				<TabPanel value={tabValue} index={0}>
					{renderFeedbackList("pending")}
				</TabPanel>
				<TabPanel value={tabValue} index={1}>
					{renderFeedbackList("approved")}
				</TabPanel>
				<TabPanel value={tabValue} index={2}>
					{renderFeedbackList("rejected")}
				</TabPanel>
			</Paper>

			{/* Action Confirmation Dialog */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
				<DialogTitle>
					{dialogAction === "approve"
						? "Approve Feedback"
						: dialogAction === "reject"
						? "Reject Feedback"
						: "Delete Feedback"}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{dialogAction === "delete"
							? "Are you sure you want to delete this feedback? This action cannot be undone."
							: `Are you sure you want to ${dialogAction} this feedback?`}
					</Typography>
					{selectedFeedback && (
						<Card variant="outlined" sx={{ mt: 2 }}>
							<CardContent>
								<Rating value={selectedFeedback.rating} readOnly size="small" />
								<Typography variant="body2" sx={{ mt: 1 }}>
									{selectedFeedback.comment}
								</Typography>
							</CardContent>
						</Card>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleActionConfirm}
						color={dialogAction === "delete" ? "error" : "primary"}
						variant="contained"
					>
						{dialogAction === "approve"
							? "Approve"
							: dialogAction === "reject"
							? "Reject"
							: "Delete"}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);

	// Helper function to render feedback list based on status
	function renderFeedbackList(status: string) {
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
			return <Alert severity="info">No {status} feedback available.</Alert>;
		}

		// Calculate total pages
		const totalPages = Math.ceil(data.total / limit);

		return (
			<>
				<Stack spacing={2}>
					{data.feedbacks.map((feedback) => (
						<Card key={feedback.id} variant="outlined">
							<CardContent>
								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="flex-start"
								>
									<Box>
										<Box display="flex" alignItems="center" mb={1}>
											<Rating value={feedback.rating} readOnly size="small" />
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ ml: 1 }}
											>
												{formatDistanceToNow(new Date(feedback.createdAt), {
													addSuffix: true,
												})}
											</Typography>
										</Box>
										<Typography variant="body1" paragraph>
											{feedback.comment}
										</Typography>
										<Box display="flex" alignItems="center" gap={1}>
											<Chip
												label={feedback.isPublic ? "Public" : "Private"}
												size="small"
												color={feedback.isPublic ? "info" : "default"}
											/>
											{feedback.campaign && (
												<Chip
													label="Campaign Feedback"
													size="small"
													color="primary"
												/>
											)}
											{feedback.cause && (
												<Chip
													label="Cause Feedback"
													size="small"
													color="secondary"
												/>
											)}
										</Box>
									</Box>
									<Box>
										{status === "pending" && (
											<>
												<Button
													size="small"
													color="primary"
													onClick={() => openActionDialog(feedback, "approve")}
													sx={{ mr: 1 }}
												>
													Approve
												</Button>
												<Button
													size="small"
													color="error"
													onClick={() => openActionDialog(feedback, "reject")}
												>
													Reject
												</Button>
											</>
										)}
										<Button
											size="small"
											color="error"
											onClick={() => openActionDialog(feedback, "delete")}
											sx={{ mt: status === "pending" ? 1 : 0 }}
										>
											Delete
										</Button>
									</Box>
								</Box>
							</CardContent>
						</Card>
					))}
				</Stack>

				{totalPages > 1 && (
					<Box display="flex" justifyContent="center" mt={3}>
						<Pagination
							count={totalPages}
							page={page}
							onChange={handlePageChange}
							color="primary"
						/>
					</Box>
				)}
			</>
		);
	}
};

export default FeedbackPage;
