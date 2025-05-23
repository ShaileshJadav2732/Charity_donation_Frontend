"use client";
import React, { useState } from "react";
import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	Box,
	CircularProgress,
	Alert,
} from "@mui/material";
import {
	useGetOrganizationCampaignsQuery,
	useAddCauseToCampaignMutation,
} from "@/store/api/campaignApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "react-hot-toast";

interface AddCauseToCampaignButtonProps {
	causeId: string;
	onSuccess?: () => void;
}

const AddCauseToCampaignButton: React.FC<AddCauseToCampaignButtonProps> = ({
	causeId,
	onSuccess,
}) => {
	const [open, setOpen] = useState(false);
	const [selectedCampaignId, setSelectedCampaignId] = useState("");

	const { user } = useSelector((state: RootState) => state.auth);

	// Fetch active campaigns for the organization
	const { data: campaignsData, isLoading: isLoadingCampaigns } =
		useGetOrganizationCampaignsQuery({
			organizationId: user?.id || "",
			status: "active",
		});

	// Add cause to campaign mutation
	const [addCauseToCampaign, { isLoading: isAdding }] =
		useAddCauseToCampaignMutation();

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setSelectedCampaignId("");
	};

	const handleCampaignChange = (event: any) => {
		setSelectedCampaignId(event.target.value);
	};

	const handleAddToCampaign = async () => {
		if (!selectedCampaignId) {
			toast.error("Please select a campaign");
			return;
		}

		try {
			await addCauseToCampaign({
				campaignId: selectedCampaignId,
				causeId,
			}).unwrap();

			toast.success("Cause added to campaign successfully!");
			handleClose();

			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			console.error("Failed to add cause to campaign:", error);
			toast.error("Failed to add cause to campaign. Please try again.");
		}
	};

	return (
		<>
			<Button
				variant="contained"
				color="primary"
				onClick={handleOpen}
				sx={{ mt: 2 }}
			>
				Add to Campaign
			</Button>

			<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
				<DialogTitle>Add Cause to Campaign</DialogTitle>
				<DialogContent>
					<Box sx={{ my: 2 }}>
						<Typography variant="body1" gutterBottom>
							Add this cause to an active campaign to make it visible to donors.
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Causes must be part of an active campaign to be visible to donors.
						</Typography>

						{isLoadingCampaigns ? (
							<Box display="flex" justifyContent="center" my={3}>
								<CircularProgress />
							</Box>
						) : !campaignsData?.campaigns ||
						  campaignsData.campaigns.length === 0 ? (
							<Alert severity="warning" sx={{ my: 2 }}>
								You don't have any active campaigns. Please create an active
								campaign first.
							</Alert>
						) : (
							<FormControl fullWidth sx={{ mt: 2 }}>
								<InputLabel id="campaign-select-label">
									Select Campaign
								</InputLabel>
								<Select
									labelId="campaign-select-label"
									id="campaign-select"
									value={selectedCampaignId}
									label="Select Campaign"
									onChange={handleCampaignChange}
								>
									<MenuItem value="">
										<em>Select a campaign</em>
									</MenuItem>
									{campaignsData.campaigns
										.filter((campaign) => campaign.status === "active")
										.map((campaign) => (
											<MenuItem key={campaign._id} value={campaign._id}>
												{campaign.title}
											</MenuItem>
										))}
								</Select>
							</FormControl>
						)}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={handleAddToCampaign}
						color="primary"
						variant="contained"
						disabled={isAdding || !selectedCampaignId}
					>
						{isAdding ? <CircularProgress size={24} /> : "Add to Campaign"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default AddCauseToCampaignButton;
