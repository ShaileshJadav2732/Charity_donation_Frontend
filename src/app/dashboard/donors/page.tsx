"use client";

import React, { useState } from "react";
import {
	Box,
	Typography,
	Card,
	CardContent,
	Avatar,
	Chip,
	TextField,
	InputAdornment,
	CircularProgress,
	Alert,
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Tooltip,
} from "@mui/material";
import {
	Search,
	Users,
	DollarSign,
	Calendar,
	TrendingUp,
	Award,
	RefreshCw,
} from "lucide-react";
import { useGetOrganizationDonorsQuery } from "@/store/api/donorsApi";
import { Donor } from "@/store/api/donorsApi";

const DonorsPage: React.FC = () => {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");

	const {
		data: donorsData,
		isLoading,
		isError,
		refetch,
		isFetching,
	} = useGetOrganizationDonorsQuery({
		page: page + 1, // API uses 1-based pagination
		limit: rowsPerPage,
		search: searchTerm || undefined,
	});

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setPage(0); // Reset to first page when searching
	};

	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getFrequencyColor = (frequency: string): string => {
		switch (frequency) {
			case "Regular":
				return "#4caf50"; // Green
			case "Frequent":
				return "#2196f3"; // Blue
			case "Occasional":
				return "#ff9800"; // Orange
			default:
				return "#9e9e9e"; // Gray
		}
	};

	const getImpactScoreColor = (score: number): string => {
		if (score >= 80) return "#4caf50"; // Green
		if (score >= 60) return "#2196f3"; // Blue
		if (score >= 40) return "#ff9800"; // Orange
		return "#f44336"; // Red
	};

	// Summary statistics
	const summary = donorsData?.data?.summary;
	const donors = donorsData?.data?.donors || [];
	const pagination = donorsData?.data?.pagination;

	return (
		<Box sx={{ p: 3, maxWidth: "1400px", mx: "auto" }}>
			{/* Header Section */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					sx={{ fontWeight: "bold", color: "#1a1a1a", mb: 1 }}
				>
					Donor Management
				</Typography>
				<Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
					Manage and track your donor relationships and contributions
				</Typography>

				{/* Summary Cards */}
				{summary && (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, 1fr)",
								md: "repeat(3, 1fr)",
							},
							gap: 3,
							mb: 4,
						}}
					>
						<Card
							sx={{
								background: "linear-gradient(135deg, #287068 0%, #2f8077 100%)",
								color: "white",
							}}
						>
							<CardContent>
								<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
									<Avatar
										sx={{
											backgroundColor: "rgba(255, 255, 255, 0.2)",
											mr: 2,
										}}
									>
										<Users size={24} />
									</Avatar>
									<Box>
										<Typography variant="h4" sx={{ fontWeight: "bold" }}>
											{summary.totalDonors}
										</Typography>
										<Typography variant="body2" sx={{ opacity: 0.9 }}>
											Total Donors
										</Typography>
									</Box>
								</Box>
							</CardContent>
						</Card>

						<Card
							sx={{
								background: "linear-gradient(135deg, #4a9b8e 0%, #5fb3a3 100%)",
								color: "white",
							}}
						>
							<CardContent>
								<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
									<Avatar
										sx={{
											backgroundColor: "rgba(255, 255, 255, 0.2)",
											mr: 2,
										}}
									>
										<DollarSign size={24} />
									</Avatar>
									<Box>
										<Typography variant="h4" sx={{ fontWeight: "bold" }}>
											{formatCurrency(summary.totalFundsRaised)}
										</Typography>
										<Typography variant="body2" sx={{ opacity: 0.9 }}>
											Total Funds Raised
										</Typography>
									</Box>
								</Box>
							</CardContent>
						</Card>

						<Card
							sx={{
								background: "linear-gradient(135deg, #6bb6a3 0%, #7cc7b8 100%)",
								color: "white",
							}}
						>
							<CardContent>
								<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
									<Avatar
										sx={{
											backgroundColor: "rgba(255, 255, 255, 0.2)",
											mr: 2,
										}}
									>
										<TrendingUp size={24} />
									</Avatar>
									<Box>
										<Typography variant="h4" sx={{ fontWeight: "bold" }}>
											{formatCurrency(summary.averageDonation)}
										</Typography>
										<Typography variant="body2" sx={{ opacity: 0.9 }}>
											Average Donation
										</Typography>
									</Box>
								</Box>
							</CardContent>
						</Card>
					</Box>
				)}
			</Box>

			{/* Search and Filter Section */}
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					gap: 2,
					mb: 3,
					alignItems: { sm: "center" },
					justifyContent: "space-between",
				}}
			>
				<TextField
					placeholder="Search donors by name or email..."
					value={searchTerm}
					onChange={handleSearchChange}
					sx={{
						flexGrow: 1,
						maxWidth: { sm: "400px" },
						"& .MuiOutlinedInput-root": {
							borderRadius: "12px",
						},
					}}
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position="start">
									<Search size={20} color="#666" />
								</InputAdornment>
							),
						},
					}}
				/>
				<Button
					variant="outlined"
					startIcon={<RefreshCw size={16} />}
					onClick={() => refetch()}
					disabled={isFetching}
					sx={{
						borderRadius: "12px",
						borderColor: "#287068",
						color: "#287068",
						"&:hover": {
							borderColor: "#2f8077",
							backgroundColor: "rgba(40, 112, 104, 0.04)",
						},
					}}
				>
					{isFetching ? "Refreshing..." : "Refresh"}
				</Button>
			</Box>

			{/* Loading State */}
			{isLoading && (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: "400px",
					}}
				>
					<CircularProgress sx={{ color: "#287068" }} />
				</Box>
			)}

			{/* Error State */}
			{isError && (
				<Alert
					severity="error"
					sx={{ mb: 3, borderRadius: "12px" }}
					action={
						<Button
							color="inherit"
							size="small"
							onClick={() => refetch()}
							startIcon={<RefreshCw size={16} />}
						>
							Retry
						</Button>
					}
				>
					Failed to load donors data. Please try again.
				</Alert>
			)}

			{/* Empty State */}
			{!isLoading && !isError && donors.length === 0 && (
				<Paper
					sx={{
						p: 6,
						textAlign: "center",
						borderRadius: "16px",
						border: "1px solid #e0e0e0",
					}}
				>
					<Avatar
						sx={{
							width: 64,
							height: 64,
							mx: "auto",
							mb: 2,
							backgroundColor: "#f5f5f5",
							color: "#9e9e9e",
						}}
					>
						<Users size={32} />
					</Avatar>
					<Typography variant="h6" sx={{ mb: 1, color: "#666" }}>
						{searchTerm ? "No donors found" : "No donors yet"}
					</Typography>
					<Typography variant="body2" sx={{ color: "#999", mb: 3 }}>
						{searchTerm
							? "Try adjusting your search criteria"
							: "Donors will appear here once they make donations to your organization"}
					</Typography>
					{searchTerm && (
						<Button
							variant="outlined"
							onClick={() => setSearchTerm("")}
							sx={{
								borderRadius: "8px",
								borderColor: "#287068",
								color: "#287068",
							}}
						>
							Clear Search
						</Button>
					)}
				</Paper>
			)}

			{/* Donors Table */}
			{!isLoading && !isError && donors.length > 0 && (
				<Paper
					sx={{
						borderRadius: "16px",
						border: "1px solid #e0e0e0",
						overflow: "hidden",
					}}
				>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow sx={{ backgroundColor: "#f8f9fa" }}>
									<TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
										Donor
									</TableCell>
									<TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
										Contact
									</TableCell>
									<TableCell
										sx={{ fontWeight: "bold", color: "#374151" }}
										align="right"
									>
										Total Donated
									</TableCell>
									<TableCell
										sx={{ fontWeight: "bold", color: "#374151" }}
										align="center"
									>
										Donations
									</TableCell>
									<TableCell
										sx={{ fontWeight: "bold", color: "#374151" }}
										align="center"
									>
										Frequency
									</TableCell>
									<TableCell
										sx={{ fontWeight: "bold", color: "#374151" }}
										align="center"
									>
										Impact Score
									</TableCell>
									<TableCell
										sx={{ fontWeight: "bold", color: "#374151" }}
										align="center"
									>
										Donation Dates
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{donors.map((donor: Donor) => (
									<TableRow
										key={donor.id}
										sx={{
											"&:hover": {
												backgroundColor: "#f8f9fa",
											},
											borderBottom: "1px solid #e5e7eb",
										}}
									>
										{/* Donor Info */}
										<TableCell>
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 2 }}
											>
												<Avatar
													src={donor.profileImage || undefined}
													sx={{
														width: 48,
														height: 48,
														backgroundColor: "#287068",
														fontSize: "18px",
														fontWeight: "bold",
													}}
												>
													{donor.name.charAt(0).toUpperCase()}
												</Avatar>
												<Box>
													<Typography
														variant="subtitle1"
														sx={{ fontWeight: "600", color: "#1f2937" }}
													>
														{donor.name}
													</Typography>
													<Box
														sx={{
															display: "flex",
															flexWrap: "wrap",
															gap: 0.5,
															mt: 0.5,
														}}
													>
														{donor.donationTypes.map((type, index) => (
															<Chip
																key={index}
																label={type}
																size="small"
																sx={{
																	backgroundColor:
																		type === "MONEY" ? "#e8f5e8" : "#e3f2fd",
																	color:
																		type === "MONEY" ? "#2e7d32" : "#1565c0",
																	fontSize: "11px",
																	height: "20px",
																}}
															/>
														))}
													</Box>
												</Box>
											</Box>
										</TableCell>

										{/* Contact Info */}
										<TableCell>
											<Box>
												<Typography
													variant="body2"
													sx={{ color: "#374151", mb: 0.5 }}
												>
													{donor.email}
												</Typography>
												{donor.phoneNumber && (
													<Typography
														variant="body2"
														sx={{ color: "#6b7280", fontSize: "12px" }}
													>
														{donor.phoneNumber}
													</Typography>
												)}
												{donor.address.city && (
													<Typography
														variant="body2"
														sx={{ color: "#6b7280", fontSize: "12px" }}
													>
														{donor.address.city}
														{donor.address.state && `, ${donor.address.state}`}
													</Typography>
												)}
											</Box>
										</TableCell>

										{/* Total Donated */}
										<TableCell align="right">
											<Typography
												variant="h6"
												sx={{ fontWeight: "bold", color: "#287068" }}
											>
												{formatCurrency(donor.totalDonated)}
											</Typography>
										</TableCell>

										{/* Donations Count */}
										<TableCell align="center">
											<Box sx={{ textAlign: "center" }}>
												<Typography
													variant="h6"
													sx={{ fontWeight: "bold", color: "#1f2937" }}
												>
													{donor.totalDonations}
												</Typography>
												<Typography
													variant="body2"
													sx={{ color: "#6b7280", fontSize: "12px" }}
												>
													{donor.causesSupported} cause
													{donor.causesSupported !== 1 ? "s" : ""}
												</Typography>
											</Box>
										</TableCell>

										{/* Frequency */}
										<TableCell align="center">
											<Chip
												label={donor.frequency}
												sx={{
													backgroundColor: getFrequencyColor(donor.frequency),
													color: "white",
													fontWeight: "bold",
													fontSize: "12px",
												}}
											/>
										</TableCell>

										{/* Impact Score */}
										<TableCell align="center">
											<Tooltip title="Impact score based on donation amount and frequency">
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														gap: 1,
													}}
												>
													<Award
														size={16}
														color={getImpactScoreColor(donor.impactScore)}
													/>
													<Typography
														variant="body1"
														sx={{
															fontWeight: "bold",
															color: getImpactScoreColor(donor.impactScore),
														}}
													>
														{donor.impactScore}
													</Typography>
												</Box>
											</Tooltip>
										</TableCell>

										{/* Donation Dates */}
										<TableCell align="center">
											<Box sx={{ textAlign: "center" }}>
												<Typography
													variant="body2"
													sx={{ color: "#374151", fontSize: "12px" }}
												>
													<Calendar size={12} style={{ marginRight: "4px" }} />
													First: {formatDate(donor.firstDonation)}
												</Typography>
												<Typography
													variant="body2"
													sx={{ color: "#6b7280", fontSize: "12px", mt: 0.5 }}
												>
													Latest: {formatDate(donor.lastDonation)}
												</Typography>
											</Box>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					{/* Pagination */}
					{pagination && (
						<TablePagination
							component="div"
							count={pagination.total}
							page={page}
							onPageChange={handleChangePage}
							rowsPerPage={rowsPerPage}
							onRowsPerPageChange={handleChangeRowsPerPage}
							rowsPerPageOptions={[5, 10, 25, 50]}
							sx={{
								borderTop: "1px solid #e5e7eb",
								"& .MuiTablePagination-toolbar": {
									paddingLeft: 3,
									paddingRight: 3,
								},
							}}
						/>
					)}
				</Paper>
			)}
		</Box>
	);
};

export default DonorsPage;
