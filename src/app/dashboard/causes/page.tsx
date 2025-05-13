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
	Grid,
	Chip,
	IconButton,
	TextField,
	Alert,
	CircularProgress,
} from "@mui/material";
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Search as SearchIcon,
} from "@mui/icons-material";
import {
	useGetCausesQuery,
	useDeleteCauseMutation,
} from "@/store/api/causeApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Cause } from "@/types/cause";

const CausesPage = () => {
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);
	const [searchTerm, setSearchTerm] = useState("");

	const {
		data: causesData,
		isLoading,
		error,
	} = useGetCausesQuery({
		organizationId: user?._id,
	});

	const [deleteCause, { isLoading: isDeleting }] = useDeleteCauseMutation();

	const handleCreateCause = () => {
		router.push("/dashboard/causes/create");
	};

	const handleEditCause = (id: string) => {
		router.push(`/dashboard/causes/${id}/edit`);
	};

	const handleDeleteCause = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this cause?")) {
			try {
				await deleteCause(id).unwrap();
			} catch (err) {
				console.error("Failed to delete cause:", err);
			}
		}
	};

	const filteredCauses = causesData?.causes?.filter((cause: Cause) => {
		return cause.title.toLowerCase().includes(searchTerm.toLowerCase());
	});

	if (!user || user.role !== "organization") {
		return (
			<Box p={4}>
				<Alert severity="error">
					Access Denied. Only organizations can view causes.
				</Alert>
			</Box>
		);
	}

	return (
		<Box p={4}>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				mb={4}
			>
				<Typography variant="h4">Causes</Typography>
				<Button
					variant="contained"
					color="primary"
					startIcon={<AddIcon />}
					onClick={handleCreateCause}
				>
					Create Cause
				</Button>
			</Box>

			<Box display="flex" gap={2} mb={4}>
				<TextField
					placeholder="Search causes..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					size="small"
					InputProps={{
						startAdornment: <SearchIcon color="action" />,
					}}
					sx={{ flexGrow: 1 }}
				/>
			</Box>

			{isLoading ? (
				<Box display="flex" justifyContent="center" p={4}>
					<CircularProgress />
				</Box>
			) : error ? (
				<Alert severity="error">Failed to load causes</Alert>
			) : filteredCauses?.length === 0 ? (
				<Alert severity="info">No causes found. Create your first cause!</Alert>
			) : (
				<Grid container spacing={3}>
					{filteredCauses?.map((cause: Cause) => (
						<Grid item xs={12} sm={6} md={4} key={cause.id}>
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
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	);
};

export default CausesPage;
