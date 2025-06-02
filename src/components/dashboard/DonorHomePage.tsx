"use client";

import React from "react";
import {
	Box,
	Typography,
	Button,
	Card,
	CardContent,
	Avatar,
	Chip,
	Divider,
	Paper,
} from "@mui/material";
import {
	Heart,
	TrendingUp,
	Plus,
	ArrowRight,
	Gift,
	IndianRupee,
	Users,
	Target,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useGetDonorDonationsQuery } from "@/store/api/donationApi";
import { useGetActiveCampaignCausesQuery } from "@/store/api/causeApi";
import { useRouter } from "next/navigation";
import { Cause } from "@/types/cause";
import PageHeader from "@/components/ui/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import CauseCard from "@/components/ui/CauseCard";
import StandardCard from "@/components/ui/StandardCard";
import { colors, spacing } from "@/styles/theme";

interface DonationData {
	_id: string;
	amount?: number;
	status: string;
	createdAt: string;
	type: string;
	description: string;
	quantity?: number;
	unit?: string;
	cause?: {
		title: string;
		_id?: string;
	};
	organization?: {
		name: string;
		_id?: string;
	};
}

const DonorHomePage: React.FC = () => {
	const { user } = useSelector((state: RootState) => state.auth);
	const { data: donationsData } = useGetDonorDonationsQuery({
		page: 1,
		limit: 100, // Get more donations to calculate stats
	});
	const {
		data: causesData,
		isLoading: causesLoading,
		error: causesError,
	} = useGetActiveCampaignCausesQuery({
		limit: 6,
		page: 1,
	});

	// Debug API call status
	console.log("🔍 Causes API Status:", {
		causesLoading,
		causesError,
		causesData,
	});
	const router = useRouter();

	// Use real donations data - handle the actual API response structure
	const donations = donationsData?.data || [];
	const stats = {
		totalDonations: donations.length || 0,
		totalAmount: Array.isArray(donations)
			? donations.reduce(
					(sum: number, donation: any) => sum + (donation.amount || 0),
					0
			  )
			: 0,
		causesSupported: Array.isArray(donations)
			? new Set(donations.map((d: any) => d.cause?._id).filter(Boolean)).size
			: 0,
		organizationsSupported: Array.isArray(donations)
			? new Set(donations.map((d: any) => d.organization?._id).filter(Boolean))
					.size
			: 0,
		recentDonations: Array.isArray(donations) ? donations.slice(0, 5) : [],
	};

	// Use real causes data
	const realCauses = causesData?.causes || [];

	// Debug logging to check the data
	console.log("🔍 Causes data:", causesData);
	console.log("🔍 Real causes:", realCauses);

	// Check if we have any causes at all
	if (realCauses.length === 0) {
		console.log("⚠️ No causes found in the data");
	}

	// Transform real causes into featured causes with urgency calculation
	const featuredCauses = realCauses.slice(0, 3).map((cause: Cause) => {
		// Ensure we have valid numbers for calculation
		const raised =
			typeof cause.raisedAmount === "number" ? cause.raisedAmount : 0;
		const goal =
			typeof cause.targetAmount === "number" && cause.targetAmount > 0
				? cause.targetAmount
				: 1;
		const progressPercentage = (raised / goal) * 100;

		console.log(`🔍 Cause: ${cause.title}`, {
			raised,
			goal,
			progressPercentage,
			raisedAmount: cause.raisedAmount,
			targetAmount: cause.targetAmount,
			raisedAmountType: typeof cause.raisedAmount,
			targetAmountType: typeof cause.targetAmount,
		});

		// Determine urgency based on progress and time factors
		let urgency = "Low";
		if (progressPercentage < 30) {
			urgency = "High";
		} else if (progressPercentage < 70) {
			urgency = "Medium";
		}

		return {
			id: cause.id, // Use the id field from Cause type
			title: cause.title,
			organization: cause.organizationName || "Organization",
			description: cause.description,
			raised: raised,
			goal: goal,
			urgency: urgency,
			image: cause.imageUrl || "/api/placeholder/300/200",
			tags: cause.tags || [],
			acceptanceType: cause.acceptanceType,
		};
	});

	const getUrgencyColor = (urgency: string) => {
		switch (urgency) {
			case "High":
				return "#ef4444";
			case "Medium":
				return "#f59e0b";
			case "Low":
				return "#10b981";
			default:
				return "#6b7280";
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	};

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	return (
		<Box sx={{ maxWidth: "1200px", mx: "auto" }}>
			{/* Page Header */}
			<PageHeader
				title={`${getGreeting()}, ${
					(user as { firstName?: string; email?: string })?.firstName ||
					user?.email?.split("@")[0]
				}!`}
				subtitle="Thank you for making a difference. Your generosity is changing lives."
				variant="minimal"
			/>

			{/* Impact Stats */}
			<Box
				display="grid"
				gridTemplateColumns={{
					xs: "1fr",
					sm: "repeat(2, 1fr)",
					lg: "repeat(4, 1fr)",
				}}
				gap={spacing.lg / 8}
				mb={spacing.xl / 8}
			>
				<StatsCard
					title="Total Donated"
					value={stats.totalAmount}
					format="currency"
					icon={IndianRupee}
					iconColor={colors.success.main}
					variant="default"
				/>
				<StatsCard
					title="Causes Supported"
					value={stats.causesSupported}
					format="number"
					icon={Target}
					iconColor={colors.primary.main}
					variant="default"
				/>
				<StatsCard
					title="Organizations"
					value={stats.organizationsSupported}
					format="number"
					icon={Users}
					iconColor={colors.secondary.main}
					variant="default"
				/>
				<StatsCard
					title="Total Donations"
					value={stats.totalDonations}
					format="number"
					icon={Gift}
					iconColor={colors.accent.main}
					variant="default"
				/>
			</Box>

			{/* Call to Action */}
			<StandardCard
				variant="elevated"
				sx={{
					background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
					color: "white",
					mb: spacing.xl / 8,
				}}
			>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					flexDirection={{ xs: "column", md: "row" }}
					gap={spacing.lg / 8}
				>
					<Box>
						<Typography
							variant="h6"
							sx={{ mb: spacing.xs / 8, fontWeight: 600 }}
						>
							Ready to Make Another Impact?
						</Typography>
						<Typography variant="body2" sx={{ opacity: 0.9 }}>
							Discover urgent causes that need your support today.
						</Typography>
					</Box>
					<Button
						variant="contained"
						size="large"
						startIcon={<Plus />}
						onClick={() => router.push("/dashboard/causes")}
						sx={{
							backgroundColor: "white",
							color: colors.primary.main,
							fontWeight: 600,
							px: spacing.xl / 8,
							py: spacing.md / 8,
							"&:hover": {
								backgroundColor: colors.grey[50],
							},
						}}
					>
						Make a Donation
					</Button>
				</Box>
			</StandardCard>

			{/* Quick Actions */}
			<Box
				display="grid"
				gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }}
				gap={spacing.lg / 8}
				mb={spacing.xl / 8}
			>
				<StandardCard
					variant="outlined"
					hover
					onClick={() => router.push("/dashboard/causes")}
					sx={{ textAlign: "center" }}
				>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						gap={spacing.md / 8}
					>
						<Box
							sx={{
								backgroundColor: colors.primary.main + "20",
								color: colors.primary.main,
								width: 64,
								height: 64,
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Heart size={28} />
						</Box>
						<Typography variant="h6" fontWeight={600}>
							Browse Causes
						</Typography>
						<Typography
							variant="body2"
							color={colors.text.secondary}
							textAlign="center"
						>
							Discover causes that need your support
						</Typography>
					</Box>
				</StandardCard>

				<StandardCard
					variant="outlined"
					hover
					onClick={() => router.push("/dashboard/donations")}
					sx={{ textAlign: "center" }}
				>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						gap={spacing.md / 8}
					>
						<Box
							sx={{
								backgroundColor: colors.secondary.main + "20",
								color: colors.secondary.main,
								width: 64,
								height: 64,
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Gift size={28} />
						</Box>
						<Typography variant="h6" fontWeight={600}>
							My Donations
						</Typography>
						<Typography
							variant="body2"
							color={colors.text.secondary}
							textAlign="center"
						>
							Track your donation history and status
						</Typography>
					</Box>
				</StandardCard>

				<StandardCard
					variant="outlined"
					hover
					onClick={() => router.push("/dashboard/analytics")}
					sx={{ textAlign: "center" }}
				>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						gap={spacing.md / 8}
					>
						<Box
							sx={{
								backgroundColor: colors.accent.main + "20",
								color: colors.accent.main,
								width: 64,
								height: 64,
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<TrendingUp size={28} />
						</Box>
						<Typography variant="h6" fontWeight={600}>
							View Analytics
						</Typography>
						<Typography
							variant="body2"
							color={colors.text.secondary}
							textAlign="center"
						>
							See detailed insights about your impact
						</Typography>
					</Box>
				</StandardCard>
			</Box>

			{/* Featured Urgent Causes */}
			<Box mb={spacing.xl / 8}>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					mb={spacing.lg / 8}
				>
					<Typography variant="h5" fontWeight={700} color={colors.text.primary}>
						Urgent Causes {causesLoading && "(Loading...)"}
					</Typography>
					<Button
						endIcon={<ArrowRight size={16} />}
						onClick={() => router.push("/dashboard/causes")}
						sx={{
							color: colors.primary.main,
							fontWeight: 600,
							"&:hover": {
								backgroundColor: colors.primary.main + "10",
							},
						}}
					>
						View All
					</Button>
				</Box>

				{/* Error state */}
				{causesError && (
					<StandardCard
						variant="outlined"
						sx={{
							backgroundColor: colors.error.light + "20",
							borderColor: colors.error.main,
						}}
					>
						<Typography color={colors.error.main}>
							Error loading causes: {JSON.stringify(causesError)}
						</Typography>
					</StandardCard>
				)}

				{/* No data state */}
				{!causesLoading && !causesError && featuredCauses.length === 0 && (
					<StandardCard
						variant="outlined"
						sx={{
							backgroundColor: colors.warning.light + "20",
							borderColor: colors.warning.main,
						}}
					>
						<Typography color={colors.warning.main}>
							No causes available at the moment.
						</Typography>
					</StandardCard>
				)}
				<Box
					display="grid"
					gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
					gap={spacing.lg / 8}
				>
					{featuredCauses.map((cause) => {
						// Transform cause data to match CauseCard interface
						const causeData = {
							id: cause.id,
							title: cause.title,
							description: cause.description,
							targetAmount: cause.goal,
							raisedAmount: cause.raised,
							organizationName: cause.organization,
							acceptanceType: cause.acceptanceType as
								| "money"
								| "items"
								| "both",
							tags: cause.tags,
							status: "active" as const,
						};

						return (
							<CauseCard
								key={cause.id}
								cause={causeData}
								variant="default"
								showProgress={true}
								showOrganization={true}
								showTags={true}
								onClick={() => router.push(`/dashboard/donate/${cause.id}`)}
								actions={
									<Button
										variant="contained"
										size="small"
										onClick={(e) => {
											e.stopPropagation();
											router.push(`/dashboard/donate/${cause.id}`);
										}}
										sx={{
											backgroundColor: colors.primary.main,
											"&:hover": {
												backgroundColor: colors.primary.dark,
											},
										}}
									>
										Donate Now
									</Button>
								}
							/>
						);
					})}
				</Box>
			</Box>

			{/* Recent Activity */}
			{stats.recentDonations && stats.recentDonations.length > 0 && (
				<Box sx={{ mb: 4 }}>
					<Typography
						variant="h5"
						sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 3 }}
					>
						Recent Activity
					</Typography>
					<Card>
						<CardContent sx={{ p: 0 }}>
							{stats.recentDonations
								.slice(0, 5)
								.map((donation: any, index: number) => (
									<Box key={donation._id || index}>
										<Box
											sx={{
												p: 3,
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
											}}
										>
											<Box
												sx={{ display: "flex", alignItems: "center", flex: 1 }}
											>
												<Avatar
													sx={{
														backgroundColor: "#287068",
														width: 40,
														height: 40,
														mr: 2,
													}}
												>
													<Heart size={20} />
												</Avatar>
												<Box>
													<Typography
														variant="subtitle1"
														sx={{ fontWeight: 600 }}
													>
														{donation.cause?.title || "Donation"}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{donation.organization?.name || "Organization"}
													</Typography>
													<Typography variant="caption" color="text.secondary">
														{new Date(donation.createdAt).toLocaleDateString()}
													</Typography>
												</Box>
											</Box>
											<Box sx={{ textAlign: "right" }}>
												<Chip
													label={donation.status}
													size="small"
													color={
														donation.status === "CONFIRMED"
															? "success"
															: donation.status === "PENDING"
															? "warning"
															: "info"
													}
													sx={{ mb: 1 }}
												/>
												{donation.amount && (
													<Typography
														variant="subtitle2"
														sx={{ fontWeight: 600 }}
													>
														{formatCurrency(donation.amount)}
													</Typography>
												)}
											</Box>
										</Box>
										{index < Math.min(stats.recentDonations.length - 1, 4) && (
											<Divider />
										)}
									</Box>
								))}
							<Box
								sx={{ p: 2, textAlign: "center", backgroundColor: "#f8f9fa" }}
							>
								<Button
									onClick={() => router.push("/dashboard/donations")}
									sx={{ color: "#287068", fontWeight: 600 }}
								>
									View All Donations
								</Button>
							</Box>
						</CardContent>
					</Card>
				</Box>
			)}

			{/* Motivational Message */}
			<Paper
				sx={{
					p: 3,
					textAlign: "center",
					background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
					border: "1px solid #dee2e6",
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontWeight: 600, mb: 1, color: "#287068" }}
				>
					&ldquo;The best way to find yourself is to lose yourself in the
					service of others.&rdquo;
				</Typography>
				<Typography variant="body2" color="text.secondary">
					- Mahatma Gandhi
				</Typography>
			</Paper>
		</Box>
	);
};

export default DonorHomePage;
