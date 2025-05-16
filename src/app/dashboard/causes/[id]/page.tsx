"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetCauseByIdQuery } from "@/store/api/causeApi";
import { DonationType } from "@/types/donation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useGetOrganizationByCauseIdQuery } from "@/store/api/organizationApi";

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
	Paper,
} from "@mui/material";
import {
	FavoriteOutlined as HeartIcon,
	MonetizationOn as MoneyIcon,
	People as PeopleIcon,
	AccessTime as ClockIcon,
	Category as CategoryIcon,
	ArrowBack as ArrowBackIcon,
	CalendarToday as CalendarIcon,
	Public as PublicIcon,
	Bloodtype as BloodIcon,
	Fastfood as FoodIcon,
	ChildCare as ToysIcon,
	MenuBook as BooksIcon,
	Living as FurnitureIcon,
	Living as HouseholdIcon,
	Business as BusinessIcon,
	LocationOn as LocationIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
} from "@mui/icons-material";

// Extended DonationType to include missing types
enum ExtendedDonationType {
	MONEY = "MONEY",
	BLOOD = "BLOOD",
	FOOD = "FOOD",
	TOYS = "TOYS",
	BOOKS = "BOOKS",
	FURNITURE = "FURNITURE",
	HOUSEHOLD = "HOUSEHOLD",
	IN_KIND = "IN_KIND",
	VOLUNTEER = "VOLUNTEER"
}

const donationTypeIcons: Record<string, React.ComponentType<any>> = {
	[DonationType.MONEY]: MoneyIcon,
	[DonationType.BLOOD]: BloodIcon,
	[DonationType.FOOD]: FoodIcon,
	[DonationType.TOYS]: ToysIcon,
	[DonationType.BOOKS]: BooksIcon,
	[DonationType.FURNITURE]: FurnitureIcon,
	[DonationType.HOUSEHOLD]: HouseholdIcon,
	[ExtendedDonationType.IN_KIND]: MoneyIcon,
	[ExtendedDonationType.VOLUNTEER]: PeopleIcon
};

export default function CauseDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = React.use(params);
	const router = useRouter();
	// WARNING: React.use() is not a standard React API and might be causing issues
	// This should be replaced with a proper approach for unwrapping params

	const [activeTab, setActiveTab] = useState("about");
	const { user } = useSelector((state: RootState) => state.auth);

	const { data, isLoading, error } = useGetCauseByIdQuery(id);
	const {
		data: organizationData,
		isLoading: orgLoading,
		error: orgError
	} = useGetOrganizationByCauseIdQuery(id, { skip: !id });

	console.log("Cause data:", data);
	console.log("Organization data:", organizationData);
	console.log("Organization error:", orgError);

	const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
		setActiveTab(newValue);
	};

	const handleDonate = () => {
		router.push(`/dashboard/donate/${id}`);
	};

	const handleBack = () => {
		router.push("/dashboard/causes");
	};

	const handleViewOrganization = () => {
		if (data?.data.cause.organizationId) {
			router.push(`/dashboard/organizations/${data.data.cause.organizationId}`);
		}
	};

	// Get organization details
	const organization = organizationData?.organization;

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" p={8}>
				<CircularProgress />
			</Box>
		);
	}

	if (error || !data) {
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
	console.log(data.data.cause.targetAmount);
	const progress =
		data?.data.cause.raisedAmount && data.data.cause.targetAmount
			? Math.min(
				100,
				Math.round(
					(data?.data.cause.raisedAmount / data.data.cause.targetAmount) * 100
				)
			)
			: 0;

	// We'll assume these values if they're not in the API response
	const donorCount = 0; // Since this property doesn't exist in the type
	const acceptedDonationTypes = [DonationType.MONEY]; // Default to money donations

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
					{data.data.cause.imageUrl ? (
						<Box
							component="img"
							src={data?.data.cause?.imageUrl}
							alt={data?.data.cause?.title || "Cause"}
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
						{data?.data.cause?.title || "Untitled Cause"}
					</Typography>

					<Box display="flex" alignItems="center" mb={3}>
						<PeopleIcon sx={{ mr: 1, color: "grey.500" }} />
						<Typography variant="body2" color="text.secondary">
							{data.data.cause.organizationName || "Organization"}
						</Typography>
					</Box>

					{/* Cause Stats */}
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
						<Card variant="outlined" sx={{ flexGrow: 1, minWidth: '220px' }}>
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
									$
									{data?.data.cause.raisedAmount
										? data.data.cause.raisedAmount.toLocaleString()
										: "0"}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									of $
									{data?.data.cause.targetAmount
										? data.data.cause.targetAmount.toLocaleString()
										: "0"}{" "}
									goal
								</Typography>
							</CardContent>
						</Card>

						<Card variant="outlined" sx={{ flexGrow: 1, minWidth: '220px' }}>
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
									{donorCount}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									people have donated
								</Typography>
							</CardContent>
						</Card>

						<Card variant="outlined" sx={{ flexGrow: 1, minWidth: '220px' }}>
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
									{data?.data.cause.createdAt
										? new Date(data.data.cause.createdAt).toLocaleDateString(
											undefined,
											{
												month: "short",
												day: "numeric",
												year: "numeric",
											}
										)
										: "N/A"}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									start date
								</Typography>
							</CardContent>
						</Card>
					</Box>

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
								$
								{data?.data.cause.targetAmount
									? data.data.cause.targetAmount.toLocaleString()
									: "0"}{" "}
								goal
							</Typography>
						</Box>
					</Box>

					{/* Action Buttons */}
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
						<Button
							fullWidth
							variant="contained"
							color="primary"
							size="large"
							startIcon={<HeartIcon />}
							onClick={handleDonate}
							disabled={user?.role !== "donor"}
							sx={{ flexGrow: 1, minWidth: '200px' }}
						>
							Donate Now
						</Button>
						<Button
							fullWidth
							variant="outlined"
							color="primary"
							size="large"
							startIcon={<PeopleIcon />}
							disabled={
								user?.role !== "donor" ||
								!acceptedDonationTypes.includes(
									ExtendedDonationType.VOLUNTEER as unknown as DonationType
								)
							}
							sx={{ flexGrow: 1, minWidth: '200px' }}
						>
							Volunteer
						</Button>
					</Box>

					{user?.role !== "donor" && (
						<Alert severity="info" sx={{ mb: 4 }}>
							You are logged in as an organization. Donation features are only
							available to donors.
						</Alert>
					)}

					{/* Organization Information */}
					{data?.data.cause.organizationName && (
						<Box mb={4}>
							<Typography variant="h6" gutterBottom>
								About the Organization
							</Typography>
							<Paper variant="outlined" sx={{ p: 3 }}>
								<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
									<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: { xs: '100%', md: '120px' } }}>
										<Avatar
											sx={{
												width: 80,
												height: 80,
												bgcolor: "primary.main",
											}}
										>
											<BusinessIcon sx={{ fontSize: 40 }} />
										</Avatar>
									</Box>
									<Box sx={{ flexGrow: 1 }}>
										<Typography variant="h6" gutterBottom>
											{data.data.cause.organizationName}
										</Typography>

										<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
											<BusinessIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
											<Typography variant="body2" color="text.secondary">
												Organization ID: {data.data.cause.organizationId}
											</Typography>
										</Box>

										{!orgLoading && organization ? (
											<>
												{organization.email && organization.email !== "Not available" && (
													<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
														<EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
														<Typography variant="body2" color="text.secondary">
															{organization.email}
														</Typography>
													</Box>
												)}

												{organization.phoneNumber && organization.phoneNumber !== "Not available" && (
													<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
														<PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
														<Typography variant="body2" color="text.secondary">
															{organization.phoneNumber}
														</Typography>
													</Box>
												)}

												{organization.address && (
													<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
														<LocationIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
														<Typography variant="body2" color="text.secondary">
															{`${organization.address}${organization.city ? `, ${organization.city}` : ''}${organization.state ? `, ${organization.state}` : ''}${organization.country ? `, ${organization.country}` : ''}`}
														</Typography>
													</Box>
												)}

												<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
													{organization.description || "This is the organization managing this charitable cause. Click below to view their complete profile."}
												</Typography>
											</>
										) : orgLoading ? (
											<Box display="flex" alignItems="center" my={2}>
												<CircularProgress size={20} sx={{ mr: 2 }} />
												<Typography variant="body2" color="text.secondary">
													Loading organization details...
												</Typography>
											</Box>
										) : (
											<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
												This is the organization managing this charitable cause. Click below to view their complete profile.
											</Typography>
										)}

										<Button
											variant="text"
											color="primary"
											startIcon={<BusinessIcon />}
											onClick={handleViewOrganization}
											sx={{ mt: 2 }}
										>
											View Organization Profile
										</Button>
									</Box>
								</Box>
							</Paper>
						</Box>
					)}

					{/* Tags */}
					{data?.data.cause.tags && data.data.cause.tags.length > 0 && (
						<Box mb={4}>
							<Typography variant="subtitle2" gutterBottom>
								Categories
							</Typography>
							<Box display="flex" flexWrap="wrap" gap={1}>
								{data.data.cause.tags.map((tag) => (
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
								{data?.data.cause.description || "No description available."}
							</Typography>

							{acceptedDonationTypes && acceptedDonationTypes.length > 0 && (
								<Box mt={4}>
									<Typography variant="h6" gutterBottom>
										Ways You Can Help
									</Typography>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
										{acceptedDonationTypes.map(
											(type, index) => {
												const TypeIcon = donationTypeIcons[type] || MoneyIcon;
												let title = "Donation";
												let description = "Support this cause";

												switch (type) {
													case DonationType.MONEY:
														title = "Monetary Donations";
														description =
															"Support this cause with financial contributions.";
														break;
													case ExtendedDonationType.IN_KIND as unknown as DonationType:
														title = "In-Kind Donations";
														description =
															"Donate goods, supplies, or services.";
														break;
													case ExtendedDonationType.VOLUNTEER as unknown as DonationType:
														title = "Volunteer Work";
														description = "Contribute your time and skills.";
														break;
													case DonationType.BLOOD:
														title = "Blood Donations";
														description = "Donate blood to save lives.";
														break;
													case DonationType.FOOD:
														title = "Food Donations";
														description = "Donate food items to those in need.";
														break;
													case DonationType.BOOKS:
														title = "Book Donations";
														description = "Donate books for education and knowledge.";
														break;
													default:
														title = `${type} Donations`;
														description = `Donate ${type.toLowerCase()} to support this cause.`;
												}

												return (
													<Card key={index} variant="outlined" sx={{ flexGrow: 1, minWidth: '240px', maxWidth: '350px' }}>
														<CardContent>
															<Box
																display="flex"
																alignItems="center"
																mb={2}
															>
																<Box
																	sx={{
																		bgcolor: "primary.50",
																		borderRadius: "50%",
																		p: 1,
																		mr: 2,
																	}}
																>
																	{TypeIcon && <TypeIcon color="primary" />}
																</Box>
																<Typography variant="h6">
																	{title}
																</Typography>
															</Box>
															<Typography variant="body2">
																{description}
															</Typography>
														</CardContent>
													</Card>
												);
											}
										)}
									</Box>
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
										secondary={`$${data?.data.cause.targetAmount
											? data.data.cause?.targetAmount.toLocaleString()
											: "0"
											}`}
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
										secondary={
											data?.data.cause?.createdAt
												? new Date(
													data.data.cause?.createdAt
												).toLocaleDateString()
												: "N/A"
										}
									/>
									{console.log("cause data",data?.data.cause)}
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
										secondary={
											data?.data.cause?.organizationId.name || "Organization"
										}
									/>
								</ListItem>
								<Divider variant="inset" component="li" />
								<ListItem>
									<ListItemAvatar>
										<Avatar sx={{ bgcolor: "primary.light" }}>
											<BusinessIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary="Organization ID"
										secondary={data?.data.cause?.organizationId._id || "N/A"}
									/>
								</ListItem>
							</List>

							{/* Organization Contact Information */}
							{data?.data.cause.organizationId && (
								<Box mt={4}>
									<Typography variant="h6" gutterBottom>
										Organization Contact Information
									</Typography>
									<Card variant="outlined" sx={{ mt: 2 }}>
										<CardContent>
											{orgLoading ? (
												<Box display="flex" justifyContent="center" p={3}>
													<CircularProgress size={30} />
												</Box>
											) : organization ? (
												<List>
													<ListItem>
														<ListItemAvatar>
															<Avatar sx={{ bgcolor: "primary.light" }}>
																<BusinessIcon />
															</Avatar>
														</ListItemAvatar>
														<ListItemText
															primary="Organization"
															secondary={data?.data.cause.organizationName}
														/>
													</ListItem>

													{organization.email && organization.email !== "Not available" && (
														<>
															<Divider variant="inset" component="li" />
															<ListItem>
																<ListItemAvatar>
																	<Avatar sx={{ bgcolor: "primary.light" }}>
																		<EmailIcon />
																	</Avatar>
																</ListItemAvatar>
																<ListItemText
																	primary="Email"
																	secondary={organization.email}
																/>
															</ListItem>
														</>
													)}

													{organization.phoneNumber && organization.phoneNumber !== "Not available" && (
														<>
															<Divider variant="inset" component="li" />
															<ListItem>
																<ListItemAvatar>
																	<Avatar sx={{ bgcolor: "primary.light" }}>
																		<PhoneIcon />
																	</Avatar>
																</ListItemAvatar>
																<ListItemText
																	primary="Phone"
																	secondary={organization.phoneNumber}
																/>
															</ListItem>
														</>
													)}

													{organization.address && (
														<>
															<Divider variant="inset" component="li" />
															<ListItem>
																<ListItemAvatar>
																	<Avatar sx={{ bgcolor: "primary.light" }}>
																		<LocationIcon />
																	</Avatar>
																</ListItemAvatar>
																<ListItemText
																	primary="Address"
																	secondary={`${organization.address}${organization.city ? `, ${organization.city}` : ''}${organization.state ? `, ${organization.state}` : ''}${organization.country ? `, ${organization.country}` : ''}`}
																/>
															</ListItem>
														</>
													)}
												</List>
											) : (
												<Box p={3}>
													<Typography variant="body2" color="text.secondary" align="center">
														Click below to view full organization details.
													</Typography>
												</Box>
											)}

											<Box display="flex" justifyContent="center" mt={2}>
												<Button
													variant="contained"
													color="primary"
													startIcon={<BusinessIcon />}
													onClick={handleViewOrganization}
												>
													View Full Organization Profile
												</Button>
											</Box>
										</CardContent>
									</Card>
								</Box>
							)}
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
								{donorCount
									? `${donorCount} people have donated`
									: "No donors yet"}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{donorCount
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
