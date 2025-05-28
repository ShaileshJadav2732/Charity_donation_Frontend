import React, { useState } from "react";
import {
	useGetPlatformStatsQuery,
	useGetVerificationRequestsQuery,
	useUpdateVerificationStatusMutation,
} from "@/store/api/adminApi";
import {
	Box,
	Card,
	CardContent,
	Typography,
	LinearProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Rating,
	Pagination,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
	TrendingUp,
	People,
	Campaign,
	Favorite,
	Star,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

const AdminDashboard: React.FC = () => {
	const [page, setPage] = useState(1);
	const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
	const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);

	const { data: statsData, isLoading: statsLoading } =
		useGetPlatformStatsQuery();
	const { data: verificationData, isLoading: verificationLoading } =
		useGetVerificationRequestsQuery({
			page,
			limit: 10,
		});

	const [updateVerification] = useUpdateVerificationStatusMutation();

	const handleVerificationUpdate = async (verified: boolean) => {
		if (selectedOrg) {
			await updateVerification({ organizationId: selectedOrg, verified });
			setVerifyDialogOpen(false);
			setSelectedOrg(null);
		}
	};

	const handlePageChange = (event: unknown, value: number) => {
		setPage(value);
	};

	if (statsLoading || verificationLoading) {
		return <LinearProgress />;
	}

	const stats = statsData?.data;

	const StatCard = ({
		title,
		value,
		icon,
		color,
	}: {
		title: string;
		value: string | number;
		icon: React.ReactNode;
		color: string;
	}) => (
		<Card>
			<CardContent>
				<Box display="flex" alignItems="center" mb={2}>
					<Box
						sx={{
							bgcolor: `${color}.light`,
							color: `${color}.main`,
							p: 1,
							borderRadius: 1,
							mr: 2,
						}}
					>
						{icon}
					</Box>
					<Typography variant="h6">{title}</Typography>
				</Box>
				<Typography variant="h4">{value}</Typography>
			</CardContent>
		</Card>
	);

	return (
		<Box>
			<Typography variant="h4" gutterBottom>
				Platform Overview
			</Typography>

			{/* Statistics Grid */}
			<Grid container spacing={3} mb={4}>
				<Grid Griitem xs={12} sm={6} md={3}>
					<StatCard
						title="Total Users"
						value={stats?.users.totalUsers || 0}
						icon={<People />}
						color="primary"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="Total Donations"
						value={`$${stats?.donations.totalAmount.toLocaleString() || 0}`}
						icon={<TrendingUp />}
						color="success"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="Active Campaigns"
						value={stats?.campaigns.activeCampaigns || 0}
						icon={<Campaign />}
						color="warning"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="Total Causes"
						value={stats?.causes.totalCauses || 0}
						icon={<Favorite />}
						color="error"
					/>
				</Grid>
			</Grid>

			{/* Feedback Overview */}
			<Card sx={{ mb: 4 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Platform Feedback Overview
					</Typography>
					<Grid container spacing={3}>
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
											((stats?.feedback.ratingDistribution[
												rating as keyof typeof stats.feedback.ratingDistribution
											] || 0) /
												(stats?.feedback.totalFeedback || 1)) *
											100
										}
										sx={{ flexGrow: 1, mx: 1 }}
									/>
									<Typography variant="body2" sx={{ minWidth: 30 }}>
										{stats?.feedback.ratingDistribution[
											rating as keyof typeof stats.feedback.ratingDistribution
										] || 0}
									</Typography>
								</Box>
							))}
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Recent Activities */}
			<Card sx={{ mb: 4 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Recent Activities
					</Typography>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Type</TableCell>
									<TableCell>Details</TableCell>
									<TableCell>Time</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{stats?.recentActivities.donations.map((donation) => (
									<TableRow key={donation._id}>
										<TableCell>
											<Chip label="Donation" color="success" size="small" />
										</TableCell>
										<TableCell>
											{`${donation.donor.firstName} ${
												donation.donor.lastName
											} donated $${donation.amount.toLocaleString()} to ${
												donation.organization.name
											}`}
										</TableCell>
										<TableCell>
											{formatDistanceToNow(new Date(donation.createdAt), {
												addSuffix: true,
											})}
										</TableCell>
									</TableRow>
								))}
								{stats?.recentActivities.campaigns.map((campaign) => (
									<TableRow key={campaign._id}>
										<TableCell>
											<Chip label="Campaign" color="primary" size="small" />
										</TableCell>
										<TableCell>
											{`New campaign "${campaign.title}" created by ${campaign.organizations[0].name}`}
										</TableCell>
										<TableCell>
											{formatDistanceToNow(new Date(campaign.createdAt), {
												addSuffix: true,
											})}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</CardContent>
			</Card>

			{/* Organization Verification */}
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Organization Verification Requests
					</Typography>
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Organization</TableCell>
									<TableCell>Email</TableCell>
									<TableCell>Description</TableCell>
									<TableCell>Requested</TableCell>
									<TableCell>Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{verificationData?.data.map((org) => (
									<TableRow key={org._id}>
										<TableCell>{org.name}</TableCell>
										<TableCell>{org.userId.email}</TableCell>
										<TableCell>{org.description}</TableCell>
										<TableCell>
											{formatDistanceToNow(new Date(org.createdAt), {
												addSuffix: true,
											})}
										</TableCell>
										<TableCell>
											<Button
												size="small"
												variant="contained"
												onClick={() => {
													setSelectedOrg(org._id);
													setVerifyDialogOpen(true);
												}}
											>
												Verify
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					{verificationData?.pagination.pages > 1 && (
						<Box display="flex" justifyContent="center" mt={2}>
							<Pagination
								count={verificationData.pagination.pages}
								page={page}
								onChange={handlePageChange}
							/>
						</Box>
					)}
				</CardContent>
			</Card>

			{/* Verification Dialog */}
			<Dialog
				open={verifyDialogOpen}
				onClose={() => setVerifyDialogOpen(false)}
			>
				<DialogTitle>Verify Organization</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to verify this organization?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={() => handleVerificationUpdate(false)}
						color="error"
						variant="contained"
					>
						Reject
					</Button>
					<Button
						onClick={() => handleVerificationUpdate(true)}
						color="primary"
						variant="contained"
					>
						Verify
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AdminDashboard;
