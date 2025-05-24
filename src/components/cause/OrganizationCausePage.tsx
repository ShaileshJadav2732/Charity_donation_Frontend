"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardActions,
	Typography,
<<<<<<< Updated upstream
	Grid,
=======
>>>>>>> Stashed changes
	Chip,
	TextField,
	Alert,
	CircularProgress,
	Paper,
	Stack,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from "@mui/material";
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Search as SearchIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	useGetCausesQuery,
	useDeleteCauseMutation,
} from "@/store/api/causeApi";
<<<<<<< Updated upstream
import { Cause } from "@/types/campaigns";
=======
import { Cause } from "@/types/cause";
>>>>>>> Stashed changes
import { toast } from "react-hot-toast";

const CausesPage = () => {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [searchTerm, setSearchTerm] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [createCauseDialogOpen, setCreateCauseDialogOpen] = useState(false);

	const {
		data: causesData,
		isLoading,
		error,
		refetch,
	} = useGetCausesQuery({ organizationId: user?.id });

	const [deleteCause] = useDeleteCauseMutation();

	const filteredCauses = causesData?.causes?.filter((cause: Cause) =>
		cause.title.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleCreateCause = () => {
		router.push("/dashboard/causes/create");
	};

	const handleEditCause = (id: string) => {
		router.push(`/dashboard/causes/${id}/edit`);
	};

	const handleDeleteCause = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this cause?")) {
			try {
				setIsDeleting(true);
				await deleteCause(id).unwrap();
				toast.success("Cause deleted successfully!");
				refetch();
			} catch (err) {
				console.error("Failed to delete cause:", err);
				toast.error("Failed to delete cause. Please try again.");
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const handleCloseCreateCauseDialog = () => {
		setCreateCauseDialogOpen(false);
	};

	const handleConfirmCreateCause = () => {
		setCreateCauseDialogOpen(false);
		handleCreateCause();
	};

	if (!user || user.role !== "organization") {
		return (
			<Box p={2}>
				<Alert severity="error">
					Access Denied. Only organizations can view causes.
				</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
			{/* Header */}
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 2,
					borderRadius: 0,
					backgroundImage: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
					color: "white",
				}}
			>
				<Typography variant="h5" fontWeight="bold" gutterBottom>
					Your Causes
				</Typography>
				<Typography variant="subtitle2">Manage all your causes</Typography>
			</Paper>

			{/* Content */}
			<Box sx={{ p: 2 }}>
				{/* Search and Create Bar */}
				<Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "stretch", sm: "center" }}
						spacing={1}
					>
						<TextField
							placeholder="Search causes..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							size="small"
							InputProps={{
								startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
							}}
							sx={{ flexGrow: 1 }}
						/>
						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							onClick={() => setCreateCauseDialogOpen(true)}
							size="small"
						>
							Create Cause
						</Button>
					</Stack>
				</Paper>

				{/* Campaign Reminder */}
<<<<<<< Updated upstream
				{!isLoading && !error && filteredCauses?.length > 0 && (
					<Alert severity="info" sx={{ mb: 3 }}>
						<Typography variant="subtitle2" fontWeight="medium">
							Important: Causes must be added to active campaigns to be visible
							to donors
						</Typography>
						<Typography variant="body2">
							After creating a cause, make sure to add it to an active campaign
							from the cause detail page. Donors can only see causes that are
							part of active campaigns.
						</Typography>
					</Alert>
				)}
=======
				{!isLoading &&
					!error &&
					filteredCauses &&
					filteredCauses.length > 0 && (
						<Alert severity="info" sx={{ mb: 3 }}>
							<Typography variant="subtitle2" fontWeight="medium">
								Important: Causes must be added to active campaigns to be
								visible to donors
							</Typography>
							<Typography variant="body2">
								After creating a cause, make sure to add it to an active
								campaign from the cause detail page. Donors can only see causes
								that are part of active campaigns.
							</Typography>
						</Alert>
					)}
>>>>>>> Stashed changes

				{/* Causes List */}
				{isLoading ? (
					<Box display="flex" justifyContent="center" p={4}>
						<CircularProgress />
					</Box>
				) : error ? (
					<Alert severity="error">Failed to load causes</Alert>
				) : filteredCauses?.length === 0 ? (
					<Alert severity="info">
						No causes found. Create your first cause!
					</Alert>
				) : (
<<<<<<< Updated upstream
					<Grid container spacing={3}>
						{filteredCauses?.map((cause: Cause) => (
							<Grid item xs={12} sm={6} md={4} key={cause.id}>
=======
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, 1fr)",
								md: "repeat(3, 1fr)",
							},
							gap: 3,
						}}
					>
						{filteredCauses?.map((cause: Cause) => (
							<Box key={cause.id}>
>>>>>>> Stashed changes
								<Card>
									<CardContent>
										<Box
											display="flex"
											justifyContent="space-between"
											alignItems="flex-start"
											mb={2}
										>
											<Typography variant="h6" gutterBottom>
												{cause.title}
											</Typography>
										</Box>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{
												overflow: "hidden",
												textOverflow: "ellipsis",
												display: "-webkit-box",
												WebkitLineClamp: 3,
												WebkitBoxOrient: "vertical",
												mb: 2,
											}}
										>
											{cause.description}
										</Typography>
										<Box display="flex" justifyContent="space-between" mb={1}>
											<Typography variant="body2" color="text.secondary">
												Target:
											</Typography>
											<Typography variant="body2" fontWeight="bold">
												${cause.targetAmount.toLocaleString()}
											</Typography>
										</Box>
										<Box display="flex" justifyContent="space-between">
											<Typography variant="body2" color="text.secondary">
												Raised:
											</Typography>
											<Typography
												variant="body2"
												fontWeight="bold"
												color="success.main"
											>
												${cause.raisedAmount.toLocaleString()}
											</Typography>
										</Box>
										{cause.tags && cause.tags.length > 0 && (
											<Box display="flex" gap={0.5} mt={2} flexWrap="wrap">
												{cause.tags.map((tag) => (
													<Chip
														key={tag}
														label={tag}
														size="small"
														variant="outlined"
													/>
												))}
											</Box>
										)}
									</CardContent>
									<CardActions sx={{ justifyContent: "flex-end" }}>
										<IconButton
											size="small"
											onClick={() => handleEditCause(cause.id)}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											onClick={() => handleDeleteCause(cause.id)}
											disabled={isDeleting}
										>
											<DeleteIcon />
										</IconButton>
									</CardActions>
								</Card>
<<<<<<< Updated upstream
							</Grid>
						))}
					</Grid>
=======
							</Box>
						))}
					</Box>
>>>>>>> Stashed changes
				)}
			</Box>

			{/* Create Cause Dialog */}
			<Dialog
				open={createCauseDialogOpen}
				onClose={handleCloseCreateCauseDialog}
			>
				<DialogTitle>Create New Cause</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Creating a cause helps you organize your campaigns by theme or area
						of focus. Would you like to create a new cause now?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseCreateCauseDialog}>Cancel</Button>
					<Button
						onClick={handleConfirmCreateCause}
						color="primary"
						variant="contained"
					>
						Create Cause
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default CausesPage;
