"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCauseByIdQuery } from "@/store/api/causeApi";
import { DonationType } from "@/types/cause";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Typography,
	Grid,
	Chip,
	LinearProgress,
	Tab,
	Tabs,
	Divider,
	Alert,
	Avatar,
	List,
	ListItem,
	ListItemText,
	ListItemAvatar,
} from "@mui/material";
import {
	FavoriteOutlined as HeartIcon,
	MonetizationOn as MoneyIcon,
	Redeem as GiftIcon,
	People as PeopleIcon,
	AccessTime as ClockIcon,
	Category as CategoryIcon,
	ArrowBack as ArrowBackIcon,
	CalendarToday as CalendarIcon,
	Public as PublicIcon,
} from "@mui/icons-material";

const donationTypeIcons: Record<DonationType, React.ComponentType> = {
	[DonationType.MONETARY]: MoneyIcon,
	[DonationType.IN_KIND]: GiftIcon,
	[DonationType.VOLUNTEER]: PeopleIcon,
};

export default function CauseDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const router = useRouter();
	const { id } = params;
	const [activeTab, setActiveTab] = useState("about");
	const { user } = useSelector((state: RootState) => state.auth);

	const { data, isLoading, error } = useGetCauseByIdQuery(id);

	const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
		setActiveTab(newValue);
	};

	const handleDonate = () => {
		router.push(`/dashboard/donate/${id}`);
	};

	const handleBack = () => {
		router.push("/dashboard/causes");
	};

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" p={8}>
				<CircularProgress />
			</Box>
		);
	}

	if (error || !data?.cause) {
		return (
			<Box p={4}>
				<Alert severity="error">
					This cause doesn&apos;t exist or has been removed.
				</Alert>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={handleBack}
					sx={{ mt: 2 }}
				>
					Back to causes
				</Button>
			</Box>
		);
	}

	const cause = data.cause;
	const progress = Math.min(
		100,
		Math.round((cause.raisedAmount / cause.targetAmount) * 100)
	);

	return (
		<Box p={4}>
			{/* Back button */}
			<Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 4 }}>
				Back to causes
			</Button>

			{/* Cause Header */}
			<Card sx={{ mb: 4, overflow: "hidden" }}>
				<Box
					sx={{
						height: { xs: 200, md: 300 },
						position: "relative",
						bgcolor: "grey.100",
					}}
				>
					{cause.imageUrl ? (
						<Box
							component="img"
							src={cause.imageUrl}
							alt={cause.title}
							sx={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
						/>
					) : (
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
							height="100%"
						>
							<PublicIcon sx={{ fontSize: 80, color: "grey.300" }} />
						</Box>
					)}
				</Box>

				<CardContent sx={{ p: 4 }}>
					<Typography variant="h4" fontWeight="bold" gutterBottom>
						{cause.title}
					</Typography>

					<Box display="flex" alignItems="center" mb={3}>
						<PeopleIcon sx={{ mr: 1, color: "grey.500" }} />
						<Typography variant="body2" color="text.secondary">
							{cause.organizationName || "Organization"}
						</Typography>
					</Box>

					{/* Cause Stats */}
					<Grid container spacing={3} mb={4}>
						<Grid item xs={12} md={4}>
							<Card variant="outlined">
								<CardContent>
									<Box
										display="flex"
										alignItems="center"
										justifyContent="space-between"
										mb={1}
									>
										<Typography variant="body2" color="text.secondary">
											Raised
										</Typography>
										<MoneyIcon color="primary" />
									</Box>
									<Typography variant="h5" fontWeight="bold">
										${cause.raisedAmount.toLocaleString()}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										of ${cause.targetAmount.toLocaleString()} goal
									</Typography>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12} md={4}>
							<Card variant="outlined">
								<CardContent>
									<Box
										display="flex"
										alignItems="center"
										justifyContent="space-between"
										mb={1}
									>
										<Typography variant="body2" color="text.secondary">
											Contributors
										</Typography>
										<HeartIcon color="error" />
									</Box>
									<Typography variant="h5" fontWeight="bold">
										{cause.donorCount || 0}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										people have donated
									</Typography>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12} md={4}>
							<Card variant="outlined">
								<CardContent>
									<Box
										display="flex"
										alignItems="center"
										justifyContent="space-between"
										mb={1}
									>
										<Typography variant="body2" color="text.secondary">
											Created
										</Typography>
										<CalendarIcon color="info" />
									</Box>
									<Typography variant="h5" fontWeight="bold">
										{new Date(cause.createdAt).toLocaleDateString(undefined, {
											month: "short",
											day: "numeric",
											year: "numeric",
										})}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										start date
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					{/* Progress Bar */}
					<Box mb={4}>
						<LinearProgress
							variant="determinate"
							value={progress}
							sx={{ height: 10, borderRadius: 5, mb: 1 }}
						/>
						<Box display="flex" justifyContent="space-between">
							<Typography variant="body2" color="text.secondary">
								{progress}% funded
							</Typography>
							<Typography variant="body2" color="text.secondary">
								${cause.targetAmount.toLocaleString()} goal
							</Typography>
						</Box>
					</Box>

					{/* Action Buttons */}
					<Grid container spacing={2} mb={4}>
						<Grid item xs={12} sm={6}>
							<Button
								fullWidth
								variant="contained"
								color="primary"
								size="large"
								startIcon={<HeartIcon />}
								onClick={handleDonate}
								disabled={user?.role !== "donor"}
							>
								Donate Now
							</Button>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Button
								fullWidth
								variant="outlined"
								color="primary"
								size="large"
								startIcon={<PeopleIcon />}
								disabled={
									user?.role !== "donor" ||
									!cause.acceptedDonationTypes?.includes(DonationType.VOLUNTEER)
								}
							>
								Volunteer
							</Button>
						</Grid>
					</Grid>

					{user?.role !== "donor" && (
						<Alert severity="info" sx={{ mb: 4 }}>
							You are logged in as an organization. Donation features are only
							available to donors.
						</Alert>
					)}

					{/* Tags */}
					{cause.tags && cause.tags.length > 0 && (
						<Box mb={4}>
							<Typography variant="subtitle2" gutterBottom>
								Categories
							</Typography>
							<Box display="flex" flexWrap="wrap" gap={1}>
								{cause.tags.map((tag) => (
									<Chip
										key={tag}
										label={tag}
										icon={<CategoryIcon />}
										variant="outlined"
									/>
								))}
							</Box>
						</Box>
					)}
				</CardContent>
			</Card>

			{/* Tabs */}
			<Card>
				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						aria-label="cause details tabs"
					>
						<Tab label="About" value="about" />
						<Tab label="Details" value="details" />
						<Tab label="Donors" value="donors" />
					</Tabs>
				</Box>

				<CardContent>
					{activeTab === "about" && (
						<Box>
							<Typography variant="h6" gutterBottom>
								About This Cause
							</Typography>
							<Typography
								variant="body1"
								sx={{ whiteSpace: "pre-wrap", mb: 4 }}
							>
								{cause.description}
							</Typography>

							{cause.acceptedDonationTypes &&
								cause.acceptedDonationTypes.length > 0 && (
									<Box mt={4}>
										<Typography variant="h6" gutterBottom>
											Ways You Can Help
										</Typography>
										<Grid container spacing={2}>
											{cause.acceptedDonationTypes.map((type, index) => {
												const TypeIcon = donationTypeIcons[type];
												let title, description;

												switch (type) {
													case DonationType.MONETARY:
														title = "Monetary Donations";
														description =
															"Support this cause with financial contributions.";
														break;
													case DonationType.IN_KIND:
														title = "In-Kind Donations";
														description =
															"Donate goods, supplies, or services.";
														break;
													case DonationType.VOLUNTEER:
														title = "Volunteer Work";
														description = "Contribute your time and skills.";
														break;
												}

												return (
													<Grid item xs={12} sm={4} key={index}>
														<Card variant="outlined" sx={{ height: "100%" }}>
															<CardContent>
																<Box display="flex" alignItems="center" mb={2}>
																	<Box
																		sx={{
																			bgcolor: "primary.50",
																			borderRadius: "50%",
																			p: 1,
																			mr: 2,
																		}}
																	>
																		<TypeIcon color="primary" />
																	</Box>
																	<Typography variant="h6">{title}</Typography>
																</Box>
																<Typography variant="body2">
																	{description}
																</Typography>
															</CardContent>
														</Card>
													</Grid>
												);
											})}
										</Grid>
									</Box>
								)}
						</Box>
					)}

					{activeTab === "details" && (
						<Box>
							<Typography variant="h6" gutterBottom>
								Cause Details
							</Typography>
							<List>
								<ListItem>
									<ListItemAvatar>
										<Avatar sx={{ bgcolor: "primary.light" }}>
											<MoneyIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary="Funding Goal"
										secondary={`$${cause.targetAmount.toLocaleString()}`}
									/>
								</ListItem>
								<Divider variant="inset" component="li" />
								<ListItem>
									<ListItemAvatar>
										<Avatar sx={{ bgcolor: "primary.light" }}>
											<ClockIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary="Created On"
										secondary={new Date(cause.createdAt).toLocaleDateString()}
									/>
								</ListItem>
								<Divider variant="inset" component="li" />
								<ListItem>
									<ListItemAvatar>
										<Avatar sx={{ bgcolor: "primary.light" }}>
											<PeopleIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary="Organization"
										secondary={cause.organizationName || "Organization"}
									/>
								</ListItem>
							</List>
						</Box>
					)}

					{activeTab === "donors" && (
						<Box
							display="flex"
							flexDirection="column"
							alignItems="center"
							py={4}
						>
							<Avatar
								sx={{
									width: 80,
									height: 80,
									bgcolor: "grey.200",
									mb: 2,
								}}
							>
								<PeopleIcon sx={{ width: 40, height: 40, color: "grey.500" }} />
							</Avatar>
							<Typography variant="h6" gutterBottom>
								{cause.donorCount
									? `${cause.donorCount} people have donated`
									: "No donors yet"}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{cause.donorCount
									? "Thank you to all our donors for supporting this cause!"
									: "Be the first to support this cause!"}
							</Typography>

							{user?.role === "donor" && (
								<Button
									variant="contained"
									color="primary"
									onClick={handleDonate}
									sx={{ mt: 3 }}
									startIcon={<HeartIcon />}
								>
									Donate Now
								</Button>
							)}
						</Box>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
