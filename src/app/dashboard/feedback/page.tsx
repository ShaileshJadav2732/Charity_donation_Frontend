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
	Avatar,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	useGetOrganizationFeedbackQuery,
	useUpdateFeedbackStatusMutation,
	Feedback,
} from "@/store/api/feedbackApi";
import { formatDistanceToNow } from "date-fns";
import FeedbackStats from "@/components/feedback/FeedbackStats";
import { toast } from "react-hot-toast";
import {
	FaUser,
	FaEye,
	FaEyeSlash,
	FaCheck,
	FaTimes,
	FaTrash,
} from "react-icons/fa";

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

	// Get status based on current tab
	const getStatusForTab = (tabIndex: number) => {
		switch (tabIndex) {
			case 0:
				return "pending";
			case 1:
				return "approved";
			case 2:
				return "rejected";
			default:
				return "pending";
		}
	};

	// Fetch organization feedback using "me" to let backend determine the organization
	const { data, isLoading, error } = useGetOrganizationFeedbackQuery(
		{
			organizationId: "me", // Backend will resolve this to the actual organization ID
			status: getStatusForTab(tabValue),
			page,
			limit,
		},
		{ skip: !user || user.role !== "organization" }
	);

	// Update feedback status mutation
	const [updateFeedbackStatus, { isLoading: isUpdating }] =
		useUpdateFeedbackStatusMutation();

	// Handle tab change
	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
		setPage(1); // Reset to first page when changing tabs
	};

	// Handle page change
	const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
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

		try {
			if (dialogAction === "approve" || dialogAction === "reject") {
				await updateFeedbackStatus({
					feedbackId: selectedFeedback._id || selectedFeedback.id!,
					status: dialogAction === "approve" ? "approved" : "rejected",
				}).unwrap();

				toast.success(`Feedback ${dialogAction}d successfully!`);
			} else if (dialogAction === "delete") {
				// TODO: Implement delete functionality when backend supports it
				toast.error("Delete functionality not yet implemented");
			}
		} catch (error) {
			console.error(`Failed to ${dialogAction} feedback:`, error);
			toast.error(`Failed to ${dialogAction} feedback. Please try again.`);
		}

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
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					View and manage feedback from your donors and supporters.
				</Typography>

				{/* Statistics Section */}
				<Box sx={{ mb: 4 }}>
					<Typography variant="h6" gutterBottom>
						Feedback Statistics
					</Typography>
					<FeedbackStats organizationId="me" />
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
								<Box display="flex" alignItems="center" mb={1}>
									<Avatar
										sx={{ bgcolor: "#2f8077", width: 32, height: 32, mr: 2 }}
									>
										<FaUser />
									</Avatar>
									<Typography variant="subtitle2">
										{typeof selectedFeedback.donor === "string"
											? "Anonymous Donor"
											: selectedFeedback.donor.name ||
											  `${selectedFeedback.donor.firstName || ""} ${
													selectedFeedback.donor.lastName || ""
											  }`.trim() ||
											  "Anonymous Donor"}
									</Typography>
								</Box>
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

		if (!data || !data.data || data.data.length === 0) {
			return <Alert severity="info">No {status} feedback available.</Alert>;
		}

		// Calculate total pages
		const totalPages = Math.ceil((data.pagination?.total || 0) / limit);

		// Helper function to get donor name
		const getDonorName = (donor: Feedback["donor"]) => {
			if (typeof donor === "string") return "Anonymous Donor";
			return (
				donor.name ||
				`${donor.firstName || ""} ${donor.lastName || ""}`.trim() ||
				"Anonymous Donor"
			);
		};

		// Helper function to get cause/campaign title
		const getTitle = (item: string | { title: string } | undefined) => {
			if (typeof item === "string") return item;
			return item?.title || "N/A";
		};

		return (
			<>
				<Stack spacing={3}>
					{data.data.map((feedback) => (
						<Card
							key={feedback._id || feedback.id}
							variant="outlined"
							sx={{
								border: "1px solid #e0e0e0",
								borderRadius: 2,
								"&:hover": {
									boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
									transform: "translateY(-2px)",
									transition: "all 0.2s ease-in-out",
								},
							}}
						>
							<CardContent sx={{ p: 3 }}>
								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="flex-start"
								>
									<Box sx={{ flex: 1 }}>
										{/* Header with donor info and rating */}
										<Box display="flex" alignItems="center" mb={2}>
											<Avatar
												sx={{
													bgcolor: "#2f8077",
													width: 40,
													height: 40,
													mr: 2,
													fontSize: "1rem",
												}}
											>
												<FaUser />
											</Avatar>
											<Box>
												<Typography variant="subtitle1" fontWeight={600}>
													{getDonorName(feedback.donor)}
												</Typography>
												<Box display="flex" alignItems="center" gap={1}>
													<Rating
														value={feedback.rating}
														readOnly
														size="small"
													/>
													<Typography variant="body2" color="text.secondary">
														{formatDistanceToNow(new Date(feedback.createdAt), {
															addSuffix: true,
														})}
													</Typography>
												</Box>
											</Box>
										</Box>

										{/* Feedback comment */}
										<Typography
											variant="body1"
											sx={{
												mb: 2,
												lineHeight: 1.6,
												color: "#333",
											}}
										>
											{feedback.comment}
										</Typography>

										{/* Tags and metadata */}
										<Box
											display="flex"
											alignItems="center"
											gap={1}
											flexWrap="wrap"
										>
											<Chip
												icon={feedback.isPublic ? <FaEye /> : <FaEyeSlash />}
												label={feedback.isPublic ? "Public" : "Private"}
												size="small"
												color={feedback.isPublic ? "success" : "default"}
												variant="outlined"
											/>
											{feedback.campaign && (
												<Chip
													label={`Campaign: ${getTitle(feedback.campaign)}`}
													size="small"
													color="primary"
													variant="outlined"
												/>
											)}
											{feedback.cause && (
												<Chip
													label={`Cause: ${getTitle(feedback.cause)}`}
													size="small"
													color="secondary"
													variant="outlined"
												/>
											)}
										</Box>
									</Box>
									{/* Action buttons */}
									<Box display="flex" flexDirection="column" gap={1}>
										{status === "pending" && (
											<Box display="flex" gap={1}>
												<Button
													size="small"
													variant="contained"
													color="success"
													startIcon={<FaCheck />}
													onClick={() => openActionDialog(feedback, "approve")}
													disabled={isUpdating}
													sx={{
														minWidth: 100,
														fontSize: "0.75rem",
													}}
												>
													Approve
												</Button>
												<Button
													size="small"
													variant="contained"
													color="error"
													startIcon={<FaTimes />}
													onClick={() => openActionDialog(feedback, "reject")}
													disabled={isUpdating}
													sx={{
														minWidth: 100,
														fontSize: "0.75rem",
													}}
												>
													Reject
												</Button>
											</Box>
										)}
										<Button
											size="small"
											variant="outlined"
											color="error"
											startIcon={<FaTrash />}
											onClick={() => openActionDialog(feedback, "delete")}
											disabled={isUpdating}
											sx={{
												fontSize: "0.75rem",
												borderColor: "#f44336",
												color: "#f44336",
												"&:hover": {
													borderColor: "#d32f2f",
													backgroundColor: "rgba(244, 67, 54, 0.04)",
												},
											}}
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
