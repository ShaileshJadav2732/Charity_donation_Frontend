"use client";

import {
	useGetActiveCampaignCausesQuery,
	useGetCausesQuery,
} from "@/store/api/causeApi";
import { RootState } from "@/store/store";
import { Cause } from "@/types/cause";
import { DonationType } from "@/types";
import StartConversationButton from "@/components/messaging/StartConversationButton";
import { Search, Heart, MessageCircle } from "lucide-react";
import {
	Alert,
	Box,
	Button,
	InputAdornment,
	Skeleton,
	TextField,
	Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import PageHeader from "@/components/ui/PageHeader";
import CauseCard from "@/components/ui/CauseCard";
import StandardCard from "@/components/ui/StandardCard";
import { colors, spacing } from "@/styles/theme";

const CausesPage = () => {
	const router = useRouter();

	const { user } = useSelector((state: RootState) => state.auth);
	const [searchTerm, setSearchTerm] = useState("");

	const [page, setPage] = useState(1);

	const {
		data: organizationCausesData,
		isLoading: isLoadingOrgCauses,
		error: orgCausesError,
	} = useGetCausesQuery(
		{ organizationId: user?.id },
		{ skip: user?.role !== "organization" }
	);

	// For donor users - get causes from active campaigns only
	const {
		data: activeCampaignCausesData,
		isLoading: isLoadingActiveCauses,
		error: activeCausesError,
	} = useGetActiveCampaignCausesQuery({});

	// Determine which data to use based on user role
	const causesData =
		user?.role === "organization"
			? organizationCausesData
			: activeCampaignCausesData;
	const isLoading =
		user?.role === "organization" ? isLoadingOrgCauses : isLoadingActiveCauses;
	const error =
		user?.role === "organization" ? orgCausesError : activeCausesError;

	// Client-side filtering for search (similar to organization page)
	const filteredCauses = causesData?.causes?.filter(
		(cause: Cause) =>
			cause.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cause.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cause.tags?.some((tag) =>
				tag?.toLowerCase().includes(searchTerm.toLowerCase())
			)
	);

	const handleViewCause = (id: string) => {
		router.push(`/dashboard/causes/${id}`);
	};

	// Collect all unique tags for filtering
	const allTags = new Set<string>();
	causesData?.causes?.forEach((cause: Cause) => {
		cause.tags?.forEach((tag) => allTags.add(tag));
	});

	return (
		<Box sx={{ maxWidth: "1200px", mx: "auto" }}>
			<PageHeader
				title="Browse Active Causes"
				subtitle="Discover causes from active campaigns that need your support. Every donation makes a difference."
				variant="minimal"
			/>

			{/* Search and Filters */}
			<Box mb={spacing.xl / 8}>
				<TextField
					fullWidth
					placeholder="Search causes by title, description, or tags..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
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

			{/* Causes Grid */}
			{isLoading ? (
				<Box
					display="grid"
					gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))"
					gap={spacing.lg / 8}
				>
					{[...Array(8)].map((_, index) => (
						<StandardCard key={index} variant="outlined">
							<Skeleton
								variant="rectangular"
								height={200}
								sx={{ mb: spacing.md / 8 }}
							/>
							<Skeleton
								variant="text"
								width="80%"
								sx={{ mb: spacing.xs / 8 }}
							/>
							<Skeleton
								variant="text"
								width="60%"
								sx={{ mb: spacing.xs / 8 }}
							/>
							<Skeleton
								variant="rectangular"
								height={8}
								sx={{ mb: spacing.md / 8 }}
							/>
							<Skeleton variant="rectangular" height={40} />
						</StandardCard>
					))}
				</Box>
			) : error ? (
				<StandardCard
					variant="outlined"
					sx={{
						backgroundColor: colors.error.light + "20",
						borderColor: colors.error.main,
					}}
				>
					<Typography color={colors.error.main}>
						Failed to load causes. Please try again later.
					</Typography>
				</StandardCard>
			) : filteredCauses?.length === 0 ? (
				<StandardCard
					variant="outlined"
					sx={{
						backgroundColor: colors.info.light + "20",
						borderColor: colors.info.main,
					}}
				>
					<Typography color={colors.info.main}>
						{searchTerm
							? "No causes match your search criteria. Try adjusting your filters."
							: "No active causes available at the moment. Check back soon!"}
					</Typography>
				</StandardCard>
			) : (
				<Box
					display="grid"
					gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))"
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
							location: cause.location || undefined, // Handle optional location
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
								showOrganization={true}
								showTags={true}
								onClick={() => handleViewCause(cause.id)}
								actions={
									<Box display="flex" gap={spacing.xs / 8}>
										<StartConversationButton
											recipientId={
												cause.organizationUserId ||
												(typeof cause.organizationId === "object"
													? cause.organizationId?.userId
													: cause.organizationId) ||
												cause.organizationId
											}
											recipientType="user"
											recipientName={cause.organizationName || "Organization"}
											recipientRole="organization"
											relatedCause={cause.id}
											variant="icon"
											size="medium"
										/>
										<Button
											variant="contained"
											size="small"
											startIcon={<Heart size={16} />}
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
									</Box>
								}
							/>
						);
					})}
				</Box>
			)}

			{/* Pagination */}
			{causesData && causesData.totalPages > 1 && !searchTerm && (
				<Box
					display="flex"
					justifyContent="center"
					mt={spacing.xl / 8}
					gap={spacing.lg / 8}
				>
					<Button
						disabled={page === 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						variant="outlined"
						sx={{
							borderColor: colors.primary.main,
							color: colors.primary.main,
							fontWeight: 600,
							px: spacing.lg / 8,
							py: spacing.md / 8,
							"&:hover": {
								backgroundColor: colors.primary.main,
								color: "white",
							},
							"&:disabled": {
								borderColor: colors.grey[300],
								color: colors.grey[500],
							},
						}}
					>
						Previous
					</Button>
					<Typography
						variant="body1"
						sx={{
							alignSelf: "center",
							fontWeight: 500,
							color: colors.primary.main,
							px: spacing.md / 8,
						}}
					>
						Page {page} of {causesData.totalPages}
					</Typography>
					<Button
						disabled={page === causesData.totalPages}
						onClick={() =>
							setPage((p) => Math.min(causesData.totalPages, p + 1))
						}
						variant="outlined"
						sx={{
							borderColor: colors.primary.main,
							color: colors.primary.main,
							fontWeight: 600,
							px: spacing.lg / 8,
							py: spacing.md / 8,
							"&:hover": {
								backgroundColor: colors.primary.main,
								color: "white",
							},
							"&:disabled": {
								borderColor: colors.grey[300],
								color: colors.grey[500],
							},
						}}
					>
						Next
					</Button>
				</Box>
			)}
		</Box>
	);
};

export default CausesPage;
