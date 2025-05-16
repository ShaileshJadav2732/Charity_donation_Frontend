"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  Paper,
  Stack,
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
  CalendarMonth as CalendarIcon,
  Groups as GroupsIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  useGetCampaignsQuery,
  useDeleteCampaignMutation,
} from "@/store/api/campaignApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Campaign, CampaignStatus } from "@/types/campaings";

// Reusable StatusChip component
const StatusChip = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case CampaignStatus.ACTIVE: return "success";
      case CampaignStatus.DRAFT: return "default";
      case CampaignStatus.PAUSED: return "warning";
      case CampaignStatus.COMPLETED: return "info";
      case CampaignStatus.CANCELLED: return "error";
      default: return "default";
    }
  };

  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size="small"
      sx={{ textTransform: "capitalize" }}
    />
  );
};

// Utility functions
const getDaysLeft = (endDate: string): number => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const getProgressPercentage = (raised: number, target: number): number => {
  if (target === 0) return 0;
  const percentage = (raised / target) * 100;
  return Math.min(percentage, 100);
};

const CampaignsPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteErrorDialogOpen, setDeleteErrorDialogOpen] = useState(false);

  // Fetch campaigns
  const { data, isLoading, error, refetch } = useGetCampaignsQuery({
    organizations: user?.id
  });

  // Enhance the debug output 
  useEffect(() => {
    if (data) {
      console.log("Campaign data structure:", data);
      console.log("Current user ID:", user?.id);
    }
  }, [data, user?.id]);

  // Improve campaigns extraction
  let campaigns: Campaign[] = [];
  if (data) {
    console.log("Raw campaign data:", data);

    // Check if data has a data property that contains our campaigns
    if (data.data) {
      // Handle response.data format
      const responseData = data.data;

      if (Array.isArray(responseData)) {
        campaigns = responseData.filter(item => item && Object.keys(item).length > 0);
      } else if (responseData.campaigns && Array.isArray(responseData.campaigns)) {
        campaigns = responseData.campaigns.filter(item => item && Object.keys(item).length > 0);
      }
    }
    // Handle direct campaigns array in data
    else if (Array.isArray(data)) {
      campaigns = data.filter(item => item && Object.keys(item).length > 0);
    }
    // Handle campaigns property in data
    else if (data.campaigns && Array.isArray(data.campaigns)) {
      campaigns = data.campaigns.filter(item => item && Object.keys(item).length > 0);
    }
    // Try to extract from another structure
    else if (typeof data === "object") {
      // Look for possible arrays in the response
      const possibleArrays = Object.entries(data)
        .filter(([_, value]) => Array.isArray(value))
        .map(([key, value]) => ({ key, value }));

      console.log("Possible campaign arrays:", possibleArrays);

      if (possibleArrays.length > 0) {
        // Use the first array found (prioritize 'campaigns' if it exists)
        const campaignsArray = possibleArrays.find(item => item.key === 'campaigns') || possibleArrays[0];
        if (campaignsArray) {
          campaigns = (campaignsArray.value as any[])
            .filter(item => item && Object.keys(item).length > 0);
        }
      }
    }

    // Ensure each campaign has a valid ID
    campaigns = campaigns.map(campaign => ({
      ...campaign,
      id: campaign.id || campaign._id
    }));

    console.log("Processed campaigns:", campaigns);
  }

  // Additional filter to remove campaigns without titles or other required fields
  campaigns = campaigns.filter(campaign =>
    campaign &&
    campaign.id &&
    campaign.title &&
    typeof campaign.title === 'string'
  );

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    // Make sure the campaign has an id
    if (!campaign || !campaign.id) {
      console.error("Campaign without ID detected:", campaign);
      return false;
    }

    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Delete mutation
  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();

  // Handlers
  const handleCreateCampaign = () => router.push("/dashboard/campaigns/create");
  const handleEditCampaign = (id: string) => {
    if (!id || id === 'undefined') {
      console.error('Invalid campaign ID');
      // Show error toast or alert
      return;
    }
    router.push(`/dashboard/campaigns/${id}/edit`);
  };
  const handleViewCampaign = (id: string) => {
    if (!id || id === 'undefined') {
      console.error('Invalid campaign ID');
      return;
    }
    router.push(`/dashboard/campaigns/${id}`);
  };
  const handleDeleteClick = (id: string) => {
    setSelectedCampaignId(id);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (selectedCampaignId) {
      try {
        setDeleteError(null);
        console.log("Attempting to delete campaign with ID:", selectedCampaignId);
        await deleteCampaign(selectedCampaignId).unwrap();
        console.log("Successfully deleted campaign");
        // Refetch after successful deletion
        refetch();
        setDeleteDialogOpen(false);
        setSelectedCampaignId(null);
      } catch (err: any) {
        console.error("Failed to delete campaign:", err);
        // Store the error message for display
        setDeleteError(err.message || "Unknown error occurred");
        setDeleteErrorDialogOpen(true);
        // Keep the delete dialog open
      }
    }
  };

  const handleCloseErrorDialog = () => {
    setDeleteErrorDialogOpen(false);
  };

  // Access control
  if (!user || user.role !== "organization") {
    return (
      <Box p={2}>
        <Alert severity="error">Access Denied. Only organizations can view campaigns.</Alert>
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
          Your Campaigns
        </Typography>
        <Typography variant="subtitle2">
          Manage all your fundraising campaigns
        </Typography>
      </Paper>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Search and Filter Bar */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1}
          >
            <TextField
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ flexGrow: 1 }}
            />
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateCampaign}
                size="small"
              >
                Create
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Campaign List */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Failed to load campaigns: {JSON.stringify(error)}</Alert>
        ) : filteredCampaigns.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Box sx={{ mb: 2 }}>
              <img
                src="https://st2.depositphotos.com/1591133/8812/i/450/depositphotos_88120646-stock-photo-idyllic-summer-landscape-with-clear.jpg"
                alt="No campaigns"
                width={150}
                height={100}
              />
            </Box>
            <Typography variant="h6" gutterBottom>
              No campaigns found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Create your first campaign to start raising funds
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateCampaign}
              size="small"
            >
              Create Campaign
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2} sx={{ display: "flex", flexWrap: "wrap" }}>
            {filteredCampaigns.map((campaign: Campaign, index: number) => {
              try {
                const progress = getProgressPercentage(
                  campaign.totalRaisedAmount,
                  campaign.totalTargetAmount
                );
                const daysLeft = getDaysLeft(campaign.endDate);

                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={campaign.id || index}
                    sx={{ display: "flex" }}
                  >
                    <Card
                      sx={{
                        width: "100%",
                        maxHeight: "450px",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2,
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 3,
                        },
                        overflow: "hidden",
                      }}
                    >
                      {/* Campaign Image */}
                      <CardMedia

                        image={
                          campaign.imageUrl && campaign.imageUrl !== ""
                            ? campaign.imageUrl
                            : "/campaign-placeholder.jpg"
                        }
                        alt={campaign.title}
                        sx={{
                          height: 140,
                          width: "100%",
                          objectFit: "cover",
                          aspectRatio: "16/9",
                        }}
                      />
                      {/* Status Chip */}
                      <Box sx={{ position: "relative", mt: -2, mx: 1.5 }}>
                        <StatusChip status={campaign.status} />
                      </Box>
                      {/* Campaign Content */}
                      <CardContent sx={{ flexGrow: 1, p: 1.5, pt: 1 }}>
                        <Typography variant="h6" gutterBottom noWrap sx={{ fontSize: "1rem" }}>
                          {campaign.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mb: 1,
                            height: "36px",
                            fontSize: "0.85rem",
                          }}
                        >
                          {campaign.description}
                        </Typography>
                        {/* Progress Bar */}
                        <Box sx={{ mt: 1, mb: 0.5 }}>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                              Progress
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" fontSize="0.8rem">
                              {progress.toFixed(0)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 6, borderRadius: 3, mb: 1 }}
                          />
                        </Box>
                        {/* Raised vs Goal */}
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                              Raised
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary" fontSize="0.9rem">
                              ${campaign.totalRaisedAmount.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              align="right"
                              fontSize="0.8rem"
                            >
                              Goal
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              align="right"
                              fontSize="0.9rem"
                            >
                              ${campaign.totalTargetAmount.toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Divider sx={{ my: 1 }} />
                        {/* Metadata */}
                        <Box display="flex" justifyContent="space-between">
                          <Box display="flex" alignItems="center">
                            <CalendarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                              {daysLeft} days
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <GroupsIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                              {campaign.donorCount || 0} donors
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      {/* Actions */}
                      <CardActions sx={{ p: 1, pt: 0, justifyContent: "space-between" }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => campaign && campaign.id ? handleViewCampaign(campaign.id) : console.error("Missing campaign ID for view")}
                          sx={{ fontSize: "0.8rem", minWidth: "auto" }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => campaign && campaign.id ? handleEditCampaign(campaign.id) : console.error("Missing campaign ID for edit")}
                          sx={{ fontSize: "0.8rem", minWidth: "auto" }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => campaign && campaign.id ? handleDeleteClick(campaign.id) : console.error("Missing campaign ID for delete")}
                          disabled={isDeleting}
                          sx={{ fontSize: "0.8rem", minWidth: "auto" }}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              } catch (err) {
                console.error(`Error rendering campaign ${index}:`, err, campaign);
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ p: 2, height: "100%" }}>
                      <Typography color="error" fontSize="0.9rem">
                        Error rendering campaign
                      </Typography>
                      <pre style={{ fontSize: "8px", overflow: "auto" }}>
                        {JSON.stringify(campaign, null, 2)}
                      </pre>
                    </Card>
                  </Grid>
                );
              }
            })}
          </Grid>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this campaign? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={deleteErrorDialogOpen} onClose={handleCloseErrorDialog}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            {deleteError}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignsPage;