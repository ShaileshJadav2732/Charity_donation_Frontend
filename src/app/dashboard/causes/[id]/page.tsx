"use client";

import StartConversationButton from "@/components/messaging/StartConversationButton";
import {
	useGetCauseByIdQuery,
	useGetOrganizationUserIdByCauseIdQuery,
} from "@/store/api/causeApi";
import { useGetOrganizationByCauseIdQuery } from "@/store/api/organizationApi";
import { RootState } from "@/store/store";
import { DonationType } from "@/types/donation";

import {
	ArrowBack,
	Category,
	Email,
	LocationOn,
	MonetizationOn,
	Phone,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	LinearProgress,
	Paper,
	Typography,
} from "@mui/material";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useSelector } from "react-redux";

const donationTypeIcons = {
	[DonationType.MONEY]: MonetizationOn,
	[DonationType.BLOOD]: Category,
	[DonationType.FOOD]: Category,
	[DonationType.TOYS]: Category,
	[DonationType.BOOKS]: Category,
	[DonationType.FURNITURE]: Category,
	[DonationType.HOUSEHOLD]: Category,
	CLOTHES: Category,
	OTHER: Category,
};

export default function CauseDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();
	const { user } = useSelector((state: RootState) => state.auth);

	const { data, isLoading, error } = useGetCauseByIdQuery(id);
	const { data: organizationData } = useGetOrganizationByCauseIdQuery(id, {
		skip: !id,
	});
	const { data: orgUserIdData } = useGetOrganizationUserIdByCauseIdQuery(id, {
		skip: !id || user?.role !== "donor",
	});

	const handleDonate = () => router.push(`/dashboard/donate/${id}`);
	const handleBack = () => router.push("/dashboard/causes");

	if (isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
				<CircularProgress size={40} />
			</Box>
		);
	}

	if (error || !data) {
		let errorMessage = "Unable to load cause details.";
		if (error && "status" in error) {
			const fetchError = error as FetchBaseQueryError;
			errorMessage =
				fetchError.status === 404
					? "Cause not found."
					: fetchError.status === 403
					? "Access denied."
					: fetchError.status === 401
					? "Please log in."
					: "An error occurred.";
		}

		return (
			<Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
				<Alert severity="error" sx={{ mb: 2 }}>
					{errorMessage}
				</Alert>
				<Button
					startIcon={<ArrowBack />}
					onClick={handleBack}
					variant="outlined"
					sx={{ textTransform: "none", width: "100%", py: 1 }}
				>
					Back to Causes
				</Button>
			</Box>
		);
	}

	const { cause } = data;
	const organization = organizationData?.organization;
	const acceptanceType = cause.acceptanceType || "money";
	const donationItems = cause.donationItems || [];
	// Handle type conversion from strings to DonationType enum
	const acceptedDonationTypes = [
		...new Set(
			(cause.acceptedDonationTypes || [DonationType.MONEY]).map(
				(type: string | DonationType) => {
					// Convert string to DonationType enum if needed
					if (typeof type === "string") {
						return type as DonationType;
					}
					return type;
				}
			)
		),
	];

	const progress =
		acceptanceType !== "items" && cause.raisedAmount && cause.targetAmount
			? Math.min(
					100,
					Math.round((cause.raisedAmount / cause.targetAmount) * 100)
			  )
			: 0;

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);

	const urgency =
		acceptanceType !== "items" && cause.targetAmount > 0
			? progress < 30
				? "High"
				: progress < 70
				? "Medium"
				: "Low"
			: "N/A";

	return (
		<Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
			{/* Back Button */}
			<Button
				startIcon={<ArrowBack />}
				onClick={handleBack}
				sx={{
					mb: 3,
					color: "#2f8077",
					fontWeight: 600,
					"&:hover": {
						backgroundColor: "rgba(47, 128, 119, 0.1)",
					},
				}}
				variant="text"
			>
				Back to Causes
			</Button>

			{/* Welcome Section */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 1 }}
				>
					{cause.title || "Untitled Cause"}
				</Typography>
				<Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
					{cause.description || "No description available."}
				</Typography>
				<Chip
					label={`${urgency} Priority`}
					sx={{
						backgroundColor:
							urgency === "High"
								? "#ef4444"
								: urgency === "Medium"
								? "#f59e0b"
								: "#2a746d",
						color: "white",
						fontWeight: 600,
					}}
				/>
			</Box>

			{/* Image Section */}
			{cause.imageUrl && (
				<Box sx={{ mb: 4 }}>
					<Box
						component="img"
						src={cause.imageUrl}
						alt={cause.title}
						sx={{
							width: "100%",
							height: 300,
							objectFit: "cover",
							borderRadius: 3,
							boxShadow: "0 8px 25px rgba(40, 112, 104, 0.15)",
						}}
					/>
				</Box>
			)}

			{/* Progress Section - matching your project's pattern */}
			{acceptanceType !== "items" && cause.targetAmount > 0 ? (
				<Paper
					sx={{
						p: 3,
						background: "linear-gradient(135deg, #287068 0%, #2f8077 100%)",
						color: "white",
						borderRadius: 3,
						mb: 4,
					}}
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", md: "row" },
							gap: 3,
							alignItems: "center",
						}}
					>
						<Box sx={{ flex: 1 }}>
							<Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
								Amount Raised
							</Typography>
							<Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
								{formatCurrency(cause.raisedAmount || 0)}
							</Typography>
							<Typography variant="body2" sx={{ opacity: 0.9 }}>
								of {formatCurrency(cause.targetAmount || 0)} goal
							</Typography>
						</Box>
						<Box sx={{ flex: 1, width: "100%" }}>
							<Box
								sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
							>
								<Typography variant="body2">Progress</Typography>
								<Typography variant="body2">{progress}%</Typography>
							</Box>
							<LinearProgress
								variant="determinate"
								value={progress}
								sx={{
									height: 8,
									borderRadius: 4,
									backgroundColor: "rgba(255, 255, 255, 0.2)",
									"& .MuiLinearProgress-bar": {
										backgroundColor: "#10b981",
										borderRadius: 4,
										boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
									},
								}}
							/>
						</Box>
					</Box>
				</Paper>
			) : (
				<Paper
					sx={{
						p: 3,
						background: "linear-gradient(135deg, #6bb6a3 0%, #7cc7b8 100%)",
						color: "white",
						borderRadius: 3,
						mb: 4,
					}}
				>
					<Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
						Items-Only Cause
					</Typography>
					<Typography variant="body1" sx={{ opacity: 0.9 }}>
						This cause accepts item donations only. Check the items needed
						below.
					</Typography>
				</Paper>
			)}

			{/* Organization Details - matching your project's card pattern */}
			{organization && (
				<Box sx={{ mb: 4 }}>
					<Paper
						sx={{
							p: 3,
							borderRadius: 3,
							boxShadow: "0 8px 25px rgba(40, 112, 104, 0.15)",
							transition: "all 0.2s",
							"&:hover": {
								transform: "translateY(-4px)",
								boxShadow: "0 12px 35px rgba(40, 112, 104, 0.2)",
							},
						}}
					>
						<Typography
							variant="h6"
							sx={{ fontWeight: "bold", mb: 2, color: "#1a1a1a" }}
						>
							Organization Details
						</Typography>
						<Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
							{cause.organizationName || "Organization"}
						</Typography>
						{organization.description && (
							<Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
								{organization.description}
							</Typography>
						)}
						{organization.email && (
							<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
								<Email sx={{ mr: 1, color: "#2f8077", fontSize: 20 }} />
								<Typography variant="body2" color="#666">
									{organization.email}
								</Typography>
							</Box>
						)}
						{organization.phoneNumber && (
							<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
								<Phone sx={{ mr: 1, color: "#2f8077", fontSize: 20 }} />
								<Typography variant="body2" color="#666">
									{organization.phoneNumber}
								</Typography>
							</Box>
						)}
						{organization.address && (
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<LocationOn sx={{ mr: 1, color: "#2f8077", fontSize: 20 }} />
								<Typography variant="body2" color="#666">
									{`${organization.address}${
										organization.city ? `, ${organization.city}` : ""
									}${organization.state ? `, ${organization.state}` : ""}${
										organization.country ? `, ${organization.country}` : ""
									}`}
								</Typography>
							</Box>
						)}
					</Paper>
				</Box>
			)}

			{/* How You Can Help - matching your project's card pattern */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h5"
					sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 3 }}
				>
					How You Can Help
				</Typography>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
						gap: 3,
						mb: 3,
					}}
				>
					{acceptedDonationTypes.map((type: DonationType) => {
						const TypeIcon = donationTypeIcons[type] || Category;
						const title =
							type === DonationType.MONEY
								? "Money Donations"
								: "Item Donations";

						return (
							<Paper
								key={type}
								sx={{
									p: 3,
									borderRadius: 3,
									boxShadow: "0 8px 25px rgba(40, 112, 104, 0.15)",
									transition: "all 0.2s",
									"&:hover": {
										transform: "translateY(-4px)",
										boxShadow: "0 12px 35px rgba(40, 112, 104, 0.2)",
									},
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
									<Box
										sx={{
											p: 2,
											borderRadius: 2,
											backgroundColor: "#2f8077",
											color: "white",
											mr: 2,
										}}
									>
										<TypeIcon sx={{ fontSize: 24 }} />
									</Box>
									<Typography variant="h6" sx={{ fontWeight: 600 }}>
										{title}
									</Typography>
								</Box>
								<Typography variant="body2" sx={{ color: "#666" }}>
									Support this cause with {title.toLowerCase()}. Your
									contribution will make a direct impact.
								</Typography>
							</Paper>
						);
					})}
				</Box>
			</Box>

			{/* Items Needed Section */}
			{(acceptanceType === "items" || acceptanceType === "both") &&
				donationItems.length > 0 && (
					<Box sx={{ mb: 4 }}>
						<Typography
							variant="h5"
							sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 3 }}
						>
							Items Needed
						</Typography>
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
							{donationItems.map((item: string, index: number) => (
								<Chip
									key={index}
									label={item}
									sx={{
										backgroundColor: "#2f8077",
										color: "white",
										fontWeight: 500,
										"&:hover": {
											backgroundColor: "#287068",
										},
									}}
								/>
							))}
						</Box>
					</Box>
				)}

			{/* Action Buttons */}
			{user?.role === "donor" && (
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					{(acceptanceType === "money" || acceptanceType === "both") && (
						<Button
							variant="contained"
							startIcon={<MonetizationOn />}
							onClick={handleDonate}
							sx={{
								textTransform: "none",
								px: 3,
								py: 1,
								backgroundColor: "#2f8077",
								"&:hover": {
									backgroundColor: "#287068",
								},
								fontWeight: 500,
								borderRadius: 2,
								flex: 1,
								minWidth: "140px",
							}}
						>
							Donate Money
						</Button>
					)}
					{(acceptanceType === "items" || acceptanceType === "both") && (
						<Button
							variant="outlined"
							startIcon={<Category />}
							onClick={handleDonate}
							sx={{
								textTransform: "none",
								px: 3,
								py: 1,
								borderColor: "#2f8077",
								color: "#2f8077",
								"&:hover": {
									borderColor: "#287068",
									backgroundColor: "rgba(47, 128, 119, 0.1)",
								},
								fontWeight: 500,
								borderRadius: 2,
								flex: 1,
								minWidth: "140px",
							}}
						>
							Donate Items
						</Button>
					)}
					{orgUserIdData?.data?.organizationUserId && (
						<StartConversationButton
							recipientId={orgUserIdData.data.organizationUserId}
							recipientType="user"
							recipientName={
								orgUserIdData.data.organizationName ||
								cause.organizationName ||
								"Organization"
							}
							recipientRole="organization"
							relatedCause={cause.id}
							size="large"
							fullWidth
						/>
					)}
				</Box>
			)}
		</Box>
	);
}
