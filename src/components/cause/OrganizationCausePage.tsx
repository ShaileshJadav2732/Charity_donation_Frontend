"use client";

import {
	useDeleteCauseMutation,
	useGetCausesQuery,
} from "@/store/api/causeApi";
import { RootState } from "@/store/store";
import { Cause } from "@/types/cause";
import { DonationType } from "@/types";
import {
	Plus,
	Search,
	Target,
	Trash2,
	DollarSign,
	Shirt,
	Droplet,
	UtensilsCrossed,
	Gamepad2,
	BookOpen,
	Armchair,
	Home,
	Package,
} from "lucide-react";
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	LinearProgress,
	TextField,
	Typography,
	InputAdornment,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import PageHeader from "@/components/ui/PageHeader";
import StandardCard from "@/components/ui/StandardCard";
import CauseCard from "@/components/ui/CauseCard";
import { colors, spacing } from "@/styles/theme";

const DonationTypeIcons = {
	[DonationType.MONEY]: DollarSign,
	[DonationType.CLOTHES]: Shirt,
	[DonationType.BLOOD]: Droplet,
	[DonationType.FOOD]: UtensilsCrossed,
	[DonationType.TOYS]: Gamepad2,
	[DonationType.BOOKS]: BookOpen,
	[DonationType.FURNITURE]: Armchair,
	[DonationType.HOUSEHOLD]: Home,
	[DonationType.OTHER]: Package,
};

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

	const filteredCauses = causesData?.causes?.filter(
		(cause: Cause) =>
			cause.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cause.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cause.tags?.some((tag) =>
				tag?.toLowerCase().includes(searchTerm.toLowerCase())
			)
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
		<Box sx={{ maxWidth: "1200px", mx: "auto" }}>
			<PageHeader
				title="Your Causes"
				subtitle="Create and manage causes to organize your fundraising efforts effectively."
				variant="minimal"
				actions={
					<Button
						variant="contained"
						startIcon={<Plus size={20} />}
						onClick={() => setCreateCauseDialogOpen(true)}
						sx={{
							backgroundColor: colors.primary.main,
							"&:hover": {
								backgroundColor: colors.primary.dark,
							},
						}}
					>
						Create Cause
					</Button>
				}
			/>

			{/* Search Section */}
			<Box mb={spacing.xl / 8}>
				<TextField
					fullWidth
					placeholder="Search causes..."
					value={searchTerm}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setSearchTerm(e.target.value)
					}
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position="start">
									<Search size={20} color={colors.primary.main} />
								</InputAdornment>
							),
						},
					}}
					sx={{
						maxWidth: 600,
						"& .MuiOutlinedInput-root": {
							backgroundColor: "white",
							"& fieldset": {
								borderColor: colors.grey[300],
							},
							"&:hover fieldset": {
								borderColor: colors.primary.main,
							},
							"&.Mui-focused fieldset": {
								borderColor: colors.primary.main,
							},
						},
					}}
				/>
			</Box>

			{/* Campaign Reminder */}
			{!isLoading && !error && filteredCauses && filteredCauses.length > 0 && (
				<StandardCard
					variant="outlined"
					sx={{
						backgroundColor: colors.info.light + "20",
						borderColor: colors.info.main,
						mb: spacing.xl / 8,
					}}
				>
					<Typography
						variant="subtitle2"
						fontWeight="600"
						sx={{ mb: spacing.xs / 8, color: colors.info.main }}
					>
						Important: Causes must be added to active campaigns to be visible to
						donors
					</Typography>
					<Typography variant="body2" color={colors.text.secondary}>
						After creating a cause, make sure to add it to an active campaign
						from the cause detail page. Donors can only see causes that are part
						of active campaigns.
					</Typography>
				</StandardCard>
			)}

			{/* Causes List */}
			{isLoading ? (
				<StandardCard variant="outlined">
					<Box display="flex" justifyContent="center" py={spacing.xxl / 8}>
						<CircularProgress sx={{ color: colors.primary.main }} />
					</Box>
				</StandardCard>
			) : error ? (
				<StandardCard
					variant="outlined"
					sx={{
						backgroundColor: colors.error.light + "20",
						borderColor: colors.error.main,
					}}
				>
					<Typography color={colors.error.main}>
						Failed to load causes
					</Typography>
				</StandardCard>
			) : filteredCauses?.length === 0 ? (
				<StandardCard
					variant="outlined"
					sx={{
						textAlign: "center",
						py: spacing.xxl / 8,
						backgroundColor: colors.background.section,
					}}
				>
					<Target
						size={48}
						color={colors.grey[400]}
						style={{ marginBottom: spacing.md }}
					/>
					<Typography variant="h6" color={colors.text.secondary} gutterBottom>
						No causes found
					</Typography>
					<Typography
						variant="body2"
						color={colors.text.secondary}
						sx={{ mb: spacing.lg / 8 }}
					>
						{searchTerm
							? "Try adjusting your search terms"
							: "Create your first cause to get started!"}
					</Typography>
					{!searchTerm && (
						<Button
							variant="contained"
							startIcon={<Plus size={20} />}
							onClick={() => setCreateCauseDialogOpen(true)}
							sx={{
								backgroundColor: colors.primary.main,
								"&:hover": { backgroundColor: colors.primary.dark },
							}}
						>
							Create Your First Cause
						</Button>
					)}
				</StandardCard>
			) : (
				<Box
					display="grid"
					gridTemplateColumns={{
						xs: "1fr",
						sm: "repeat(2, 1fr)",
						md: "repeat(3, 1fr)",
					}}
					gap={spacing.lg / 8}
				>
					{filteredCauses?.map((cause: Cause) => {
						// Transform cause data to match CauseCard interface
						const causeData = {
							id: cause.id,
							title: cause.title,
							description: cause.description,
							targetAmount: cause.targetAmount,
							raisedAmount: cause.raisedAmount,
							imageUrl: cause.imageUrl,
							organizationName: cause.organizationName,
							location: cause.location || undefined,
							tags: cause.tags,
							acceptanceType: cause.acceptanceType as
								| "money"
								| "items"
								| "both",
							acceptedDonationTypes: cause.acceptedDonationTypes,
							donationItems: cause.donationItems,
							status: "active" as const,
						};

						return (
							<CauseCard
								key={cause.id}
								cause={causeData}
								variant="default"
								showProgress={true}
								showOrganization={false} // Organization page, so don't show org name
								showTags={true}
								showLocation={false}
								actions={
									<Box
										display="flex"
										justifyContent="space-between"
										width="100%"
									>
										<Button
											variant="outlined"
											size="small"
											onClick={(e) => {
												e.stopPropagation();
												handleEditCause(cause.id);
											}}
											sx={{
												borderColor: colors.primary.main,
												color: colors.primary.main,
												"&:hover": {
													backgroundColor: colors.primary.main,
													color: "white",
												},
											}}
										>
											Edit
										</Button>
										<IconButton
											size="small"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteCause(cause.id);
											}}
											disabled={isDeleting}
											sx={{
												color: colors.error.main,
												"&:hover": {
													backgroundColor: colors.error.light + "20",
												},
											}}
										>
											<Trash2 size={18} />
										</IconButton>
									</Box>
								}
							/>
						);
					})}
				</Box>
			)}

			{/* Create Cause Dialog */}
			<Dialog
				open={createCauseDialogOpen}
				onClose={handleCloseCreateCauseDialog}
				maxWidth="sm"
				fullWidth
				slotProps={{
					paper: {
						sx: {
							borderRadius: spacing.md / 8,
							p: spacing.sm / 8,
						},
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 600, color: colors.text.primary }}>
					Create New Cause
				</DialogTitle>
				<DialogContent>
					<DialogContentText
						sx={{ color: colors.text.secondary, lineHeight: 1.6 }}
					>
						Creating a cause helps you organize your campaigns by theme or area
						of focus. Would you like to create a new cause now?
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: spacing.lg / 8, pt: spacing.xs / 8 }}>
					<Button
						onClick={handleCloseCreateCauseDialog}
						sx={{ color: colors.text.secondary }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirmCreateCause}
						variant="contained"
						sx={{
							backgroundColor: colors.primary.main,
							"&:hover": { backgroundColor: colors.primary.dark },
						}}
					>
						Create Cause
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default CausesPage;
