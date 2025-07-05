"use client";
import React, { useState } from "react";
import {
	Box,
	Typography,
	Chip,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	List,
	ListItem,
	ListItemText,
	IconButton,
	CircularProgress,
	Alert,
	Tooltip,
} from "@mui/material";
import {
	Campaign as CampaignIcon,
	RemoveCircle as RemoveIcon,
	Visibility as ViewIcon,
	Info as InfoIcon,
} from "@mui/icons-material";
import { useGetCampaignsForCauseQuery } from "@/store/api/causeApi";
import { useRemoveCauseFromCampaignMutation } from "@/store/api/campaignApi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CauseCampaignAssociationsProps {
	causeId: string;
	onCampaignRemoved?: () => void;
}

const CauseCampaignAssociations: React.FC<CauseCampaignAssociationsProps> = ({
	causeId,
	onCampaignRemoved,
}) => {
	const [open, setOpen] = useState(false);
	const [removingCampaignId, setRemovingCampaignId] = useState<string | null>(
		null
	);
	const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
	const [campaignToRemove, setCampaignToRemove] = useState<{
		id: string;
		title: string;
	} | null>(null);
	const router = useRouter();

	const {
		data: campaignsData,
		isLoading,
		error,
		refetch,
	} = useGetCampaignsForCauseQuery(causeId);

	const [removeCauseFromCampaign] = useRemoveCauseFromCampaignMutation();

	const campaigns = campaignsData?.data?.campaigns || [];

	const handleOpen = React.useCallback(() => {
		setOpen(true);
	}, []);

	const handleClose = React.useCallback(() => {
		setOpen(false);
	}, []);

	const handleRemoveFromCampaign = (
		campaignId: string,
		campaignTitle: string
	) => {
		setCampaignToRemove({ id: campaignId, title: campaignTitle });
		setRemoveDialogOpen(true);
	};

	const handleConfirmRemove = async () => {
		if (!campaignToRemove) return;

		try {
			setRemovingCampaignId(campaignToRemove.id);
			await removeCauseFromCampaign({
				campaignId: campaignToRemove.id,
				causeId,
			}).unwrap();
			toast.success(
				`Cause removed from "${campaignToRemove.title}" successfully!`
			);
			refetch();
			if (onCampaignRemoved) {
				onCampaignRemoved();
			}
			handleCloseRemoveDialog();
		} catch (error: any) {
			const errorMessage =
				error?.data?.message || "Failed to remove cause from campaign";
			toast.error(errorMessage);
		} finally {
			setRemovingCampaignId(null);
		}
	};

	const handleCloseRemoveDialog = () => {
		setRemoveDialogOpen(false);
		setCampaignToRemove(null);
	};

	const handleViewCampaign = (campaignId: string) => {
		router.push(`/dashboard/campaigns/${campaignId}`);
		handleClose();
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "success";
			case "draft":
				return "warning";
			case "completed":
				return "info";
			case "cancelled":
				return "error";
			default:
				return "default";
		}
	};

	const getStatusLabel = (status: string) => {
		return status.charAt(0).toUpperCase() + status.slice(1);
	};

	if (isLoading) {
		return (
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<CircularProgress size={16} />
				<Typography variant="body2" color="text.secondary">
					Loading campaigns...
				</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Typography variant="body2" color="error">
				Failed to load campaign associations
			</Typography>
		);
	}

	return (
		<>
			<Box
				sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
			>
				{campaigns.length === 0 ? (
					<Chip
						icon={<InfoIcon />}
						label="Not in any campaigns"
						size="small"
						color="warning"
						variant="outlined"
					/>
				) : (
					<>
						<Chip
							icon={<CampaignIcon />}
							label={`In ${campaigns.length} campaign${
								campaigns.length > 1 ? "s" : ""
							}`}
							size="small"
							color="primary"
							onClick={
								typeof handleOpen === "function" ? handleOpen : undefined
							}
							clickable={typeof handleOpen === "function"}
						/>
						{campaigns.slice(0, 2).map((campaign) => (
							<Chip
								key={campaign.id}
								label={campaign.title}
								size="small"
								color={getStatusColor(campaign.status) as any}
								variant="outlined"
								onClick={
									typeof handleOpen === "function" ? handleOpen : undefined
								}
								clickable={typeof handleOpen === "function"}
							/>
						))}
						{campaigns.length > 2 && (
							<Chip
								label={`+${campaigns.length - 2} more`}
								size="small"
								variant="outlined"
								onClick={
									typeof handleOpen === "function" ? handleOpen : undefined
								}
								clickable={typeof handleOpen === "function"}
							/>
						)}
					</>
				)}
			</Box>

			<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
				<DialogTitle>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<CampaignIcon />
						Campaign Associations
					</Box>
				</DialogTitle>
				<DialogContent>
					{campaigns.length === 0 ? (
						<Alert severity="info" sx={{ mt: 2 }}>
							This cause is not associated with any campaigns. Add it to an
							active campaign to make it visible to donors.
						</Alert>
					) : (
						<>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								This cause is associated with {campaigns.length} campaign
								{campaigns.length > 1 ? "s" : ""}. You can remove it from
								campaigns or view campaign details.
							</Typography>
							<List>
								{campaigns.map((campaign) => (
									<ListItem
										key={campaign.id}
										divider
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											py: 2,
										}}
									>
										<ListItemText
											primary={
												<Box
													sx={{ display: "flex", alignItems: "center", gap: 1 }}
												>
													<Typography variant="subtitle1">
														{campaign.title}
													</Typography>
													<Chip
														label={getStatusLabel(campaign.status)}
														size="small"
														color={getStatusColor(campaign.status) as any}
													/>
												</Box>
											}
											secondary={
												<Typography variant="body2" color="text.secondary">
													{new Date(campaign.startDate).toLocaleDateString()} -{" "}
													{new Date(campaign.endDate).toLocaleDateString()}
												</Typography>
											}
										/>
										<Box sx={{ display: "flex", gap: 1, ml: 2 }}>
											<Tooltip title="View Campaign">
												<IconButton
													size="small"
													onClick={() => handleViewCampaign(campaign.id)}
												>
													<ViewIcon />
												</IconButton>
											</Tooltip>
											<Tooltip title="Remove from Campaign">
												<IconButton
													size="small"
													color="error"
													onClick={() =>
														handleRemoveFromCampaign(
															campaign.id,
															campaign.title
														)
													}
													disabled={removingCampaignId === campaign.id}
												>
													{removingCampaignId === campaign.id ? (
														<CircularProgress size={16} />
													) : (
														<RemoveIcon />
													)}
												</IconButton>
											</Tooltip>
										</Box>
									</ListItem>
								))}
							</List>
						</>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Close</Button>
				</DialogActions>
			</Dialog>

			{/* Remove Confirmation Dialog */}
			<Dialog
				open={removeDialogOpen}
				onClose={handleCloseRemoveDialog}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle
					sx={{
						fontWeight: 600,
						color: "#ef4444",
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<RemoveIcon />
					Remove from Campaign
				</DialogTitle>
				<DialogContent>
					<Typography
						variant="body1"
						sx={{ color: "#666", lineHeight: 1.6, mb: 2 }}
					>
						Are you sure you want to remove this cause from{" "}
						<strong>"{campaignToRemove?.title}"</strong>?
					</Typography>
					<Typography
						variant="body2"
						sx={{ color: "#ef4444", lineHeight: 1.6 }}
					>
						⚠️ This will make the cause invisible to donors for this campaign.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Button
						onClick={handleCloseRemoveDialog}
						sx={{ color: "#666" }}
						disabled={removingCampaignId === campaignToRemove?.id}
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirmRemove}
						variant="contained"
						color="error"
						disabled={removingCampaignId === campaignToRemove?.id}
						sx={{
							backgroundColor: "#ef4444",
							"&:hover": { backgroundColor: "#dc2626" },
							minWidth: 120,
						}}
					>
						{removingCampaignId === campaignToRemove?.id ? (
							<>
								<CircularProgress size={16} sx={{ mr: 1, color: "white" }} />
								Removing...
							</>
						) : (
							"Remove"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default CauseCampaignAssociations;
