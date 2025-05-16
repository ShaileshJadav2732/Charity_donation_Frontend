"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetCauseByIdQuery } from "@/store/api/causeApi";
import { useCreateDonationMutation } from "@/store/api/donationApi";
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
	TextField,
	FormControl,
	FormControlLabel,
	RadioGroup,
	Radio,
	Divider,
	Stepper,
	Step,
	StepLabel,
	Alert,
	Switch,
	LinearProgress,
	InputAdornment,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	CreditCard as CreditCardIcon,
	AccountBalance as BankIcon,
	PaymentOutlined as PaymentIcon,
	FavoriteOutlined as HeartIcon,
	VisibilityOff as AnonymousIcon,
	Receipt as ReceiptIcon,
	CheckCircleOutline as CheckIcon,
} from "@mui/icons-material";

const DONATION_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function DonatePage({ params }: { params: { id: string } }) {
	const router = useRouter();
	const resolvedParams = React.use(params);
	const { id } = resolvedParams;
	const { user } = useSelector((state: RootState) => state.auth);
	const [activeStep, setActiveStep] = useState(0);
	const [donationAmount, setDonationAmount] = useState<number | string>(25);
	const [customAmount, setCustomAmount] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("creditCard");
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [comment, setComment] = useState("");
	const [error, setError] = useState("");

	const {
		data: causeData,
		isLoading: isCauseLoading,
		error: causeError,
	} = useGetCauseByIdQuery(id);

	const [createDonation, { isLoading: isSubmitting }] =
		useCreateDonationMutation();

	const handleBack = () => {
		router.push(`/dashboard/causes/${id}`);
	};

	const handleAmountSelect = (amount: number) => {
		setDonationAmount(amount);
		setCustomAmount(false);
	};

	const handleCustomAmountToggle = () => {
		if (!customAmount) {
			setDonationAmount("");
		} else {
			setDonationAmount(25);
		}
		setCustomAmount(!customAmount);
	};

	const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// Only allow numbers and prevent negative values
		if (/^\d*\.?\d{0,2}$/.test(value) && !value.startsWith("-")) {
			setDonationAmount(value);
		}
	};

	const handlePaymentMethodChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setPaymentMethod(e.target.value);
	};

	const handleAnonymousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsAnonymous(e.target.checked);
	};

	const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setComment(e.target.value);
	};

	const validateStep = () => {
		if (activeStep === 0) {
			// Validate donation amount
			const amount = Number(donationAmount);
			if (!donationAmount || isNaN(amount) || amount <= 0) {
				setError("Please enter a valid donation amount");
				return false;
			}
			setError("");
			return true;
		}
		return true;
	};

	const handleNext = () => {
		if (validateStep()) {
			if (activeStep === 1) {
				handleSubmit();
			} else {
				setActiveStep((prevStep) => prevStep + 1);
			}
		}
	};

	const handlePrevious = () => {
		setActiveStep((prevStep) => prevStep - 1);
	};

	const handleSubmit = async () => {
		try {
			const amount = Number(donationAmount);
			await createDonation({
				causeId: id,
				amount,
				paymentMethod,
				isAnonymous,
				comment: comment || undefined,
			}).unwrap();
			setActiveStep(2); // Success step
		} catch (err) {
			setError("Failed to process donation. Please try again.");
			console.error(err);
		}
	};

	// Redirect if not a donor
	if (user && user.role !== "donor") {
		return (
			<Box p={4}>
				<Alert severity="warning" sx={{ mb: 3 }}>
					Only donors can make donations. Please log in as a donor to continue.
				</Alert>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => router.push("/dashboard/causes")}
				>
					Back to causes
				</Button>
			</Box>
		);
	}

	if (isCauseLoading) {
		return (
			<Box display="flex" justifyContent="center" p={8}>
				<CircularProgress />
			</Box>
		);
	}

	if (causeError || !causeData?.cause) {
		return (
			<Box p={4}>
				<Alert severity="error">
					This cause doesn&apos;t exist or has been removed.
				</Alert>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => router.push("/dashboard/causes")}
					sx={{ mt: 2 }}
				>
					Back to causes
				</Button>
			</Box>
		);
	}

	const cause = causeData.cause;
	const progress = Math.min(
		100,
		Math.round((cause.raisedAmount / cause.targetAmount) * 100)
	);

	return (
		<Box p={4}>
			{/* Back button */}
			<Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 4 }}>
				Back to cause
			</Button>

			{/* Page title */}
			<Typography variant="h4" gutterBottom>
				Donate to {cause.title}
			</Typography>
			<Typography variant="body1" color="text.secondary" paragraph>
				Your generous donation helps make a real difference.
			</Typography>

			{/* Stepper */}
			<Stepper activeStep={activeStep} sx={{ mb: 4 }}>
				<Step>
					<StepLabel>Amount</StepLabel>
				</Step>
				<Step>
					<StepLabel>Payment</StepLabel>
				</Step>
				<Step>
					<StepLabel>Confirmation</StepLabel>
				</Step>
			</Stepper>

			<Grid container spacing={4}>
				{/* Left column: Donation form */}
				<Grid item xs={12} md={8} component="div">
					<Card>
						<CardContent sx={{ p: 4 }}>
							{activeStep === 0 && (
								<>
									<Typography variant="h6" gutterBottom>
										Select Donation Amount
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mb: 3 }}
									>
										Choose a donation amount or enter a custom amount.
									</Typography>

									{/* Donation amount buttons */}
									<Grid container spacing={2} sx={{ mb: 3 }}>
										{DONATION_AMOUNTS.map((amount) => (
											<Grid item xs={6} sm={4} key={amount} component="div">
												<Button
													fullWidth
													variant={
														donationAmount === amount && !customAmount
															? "contained"
															: "outlined"
													}
													color="primary"
													onClick={() => handleAmountSelect(amount)}
													sx={{ height: "100%" }}
												>
													${amount}
												</Button>
											</Grid>
										))}
										<Grid item xs={6} sm={4} component="div">
											<Button
												fullWidth
												variant={customAmount ? "contained" : "outlined"}
												color="primary"
												onClick={handleCustomAmountToggle}
												sx={{ height: "100%" }}
											>
												Custom
											</Button>
										</Grid>
									</Grid>

									{/* Custom amount input */}
									{customAmount && (
										<TextField
											fullWidth
											label="Custom Amount"
											variant="outlined"
											type="text"
											value={donationAmount}
											onChange={handleCustomAmountChange}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">$</InputAdornment>
												),
											}}
											sx={{ mb: 3 }}
										/>
									)}

									{/* Anonymous donation toggle */}
									<FormControlLabel
										control={
											<Switch
												checked={isAnonymous}
												onChange={handleAnonymousChange}
											/>
										}
										label="Make this donation anonymous"
										sx={{ mb: 3 }}
									/>

									{/* Optional comment */}
									<TextField
										fullWidth
										label="Add a comment (optional)"
										variant="outlined"
										multiline
										rows={3}
										value={comment}
										onChange={handleCommentChange}
									/>

									{error && (
										<Alert severity="error" sx={{ mt: 2 }}>
											{error}
										</Alert>
									)}
								</>
							)}

							{activeStep === 1 && (
								<>
									<Typography variant="h6" gutterBottom>
										Payment Method
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mb: 3 }}
									>
										Select a payment method to complete your donation.
									</Typography>

									<FormControl
										component="fieldset"
										sx={{ mb: 3, width: "100%" }}
									>
										<RadioGroup
											aria-label="payment-method"
											name="payment-method"
											value={paymentMethod}
											onChange={handlePaymentMethodChange}
										>
											<Card
												variant="outlined"
												sx={{
													mb: 2,
													borderColor:
														paymentMethod === "creditCard"
															? "primary.main"
															: "divider",
												}}
											>
												<CardContent>
													<FormControlLabel
														value="creditCard"
														control={<Radio />}
														label={
															<Box display="flex" alignItems="center">
																<CreditCardIcon color="action" sx={{ mr: 1 }} />
																<Typography>Credit/Debit Card</Typography>
															</Box>
														}
													/>
												</CardContent>
											</Card>

											<Card
												variant="outlined"
												sx={{
													mb: 2,
													borderColor:
														paymentMethod === "bankTransfer"
															? "primary.main"
															: "divider",
												}}
											>
												<CardContent>
													<FormControlLabel
														value="bankTransfer"
														control={<Radio />}
														label={
															<Box display="flex" alignItems="center">
																<BankIcon color="action" sx={{ mr: 1 }} />
																<Typography>Bank Transfer</Typography>
															</Box>
														}
													/>
												</CardContent>
											</Card>

											<Card
												variant="outlined"
												sx={{
													borderColor:
														paymentMethod === "paypal"
															? "primary.main"
															: "divider",
												}}
											>
												<CardContent>
													<FormControlLabel
														value="paypal"
														control={<Radio />}
														label={
															<Box display="flex" alignItems="center">
																<PaymentIcon color="action" sx={{ mr: 1 }} />
																<Typography>PayPal</Typography>
															</Box>
														}
													/>
												</CardContent>
											</Card>
										</RadioGroup>
									</FormControl>

									<Typography variant="h6" gutterBottom>
										Donation Summary
									</Typography>
									<Box sx={{ mb: 3 }}>
										<Box
											display="flex"
											justifyContent="space-between"
											sx={{ mb: 1 }}
										>
											<Typography variant="body2">Donation Amount</Typography>
											<Typography variant="body2" fontWeight="bold">
												${Number(donationAmount).toFixed(2)}
											</Typography>
										</Box>
										<Box
											display="flex"
											justifyContent="space-between"
											sx={{ mb: 1 }}
										>
											<Typography variant="body2">Processing Fee</Typography>
											<Typography variant="body2">$0.00</Typography>
										</Box>
										<Divider sx={{ my: 1 }} />
										<Box
											display="flex"
											justifyContent="space-between"
											sx={{ mb: 1 }}
										>
											<Typography variant="subtitle2">Total</Typography>
											<Typography variant="subtitle2" fontWeight="bold">
												${Number(donationAmount).toFixed(2)}
											</Typography>
										</Box>
									</Box>

									{error && (
										<Alert severity="error" sx={{ mt: 2 }}>
											{error}
										</Alert>
									)}
								</>
							)}

							{activeStep === 2 && (
								<Box
									display="flex"
									flexDirection="column"
									alignItems="center"
									py={4}
								>
									<CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
									<Typography variant="h5" gutterBottom textAlign="center">
										Thank you for your donation!
									</Typography>
									<Typography
										variant="body1"
										color="text.secondary"
										textAlign="center"
										paragraph
									>
										Your generous contribution of $
										{Number(donationAmount).toFixed(2)} to {cause.title} has
										been processed successfully.
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										textAlign="center"
										sx={{ mb: 4 }}
									>
										A confirmation receipt has been sent to your email.
									</Typography>

									<Box mt={4} width="100%">
										<Button
											fullWidth
											variant="contained"
											color="primary"
											startIcon={<ReceiptIcon />}
											sx={{ mb: 2 }}
										>
											View Receipt
										</Button>
										<Button
											fullWidth
											variant="outlined"
											color="primary"
											onClick={() => router.push("/dashboard/donations")}
										>
											View My Donations
										</Button>
									</Box>
								</Box>
							)}

							{activeStep < 2 && (
								<Box
									display="flex"
									justifyContent="space-between"
									sx={{ mt: 4 }}
								>
									<Button
										disabled={activeStep === 0}
										onClick={handlePrevious}
										variant="outlined"
									>
										Back
									</Button>
									<Button
										variant="contained"
										color="primary"
										onClick={handleNext}
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<CircularProgress size={24} />
										) : activeStep === 1 ? (
											"Complete Donation"
										) : (
											"Continue"
										)}
									</Button>
								</Box>
							)}
						</CardContent>
					</Card>
				</Grid>

				{/* Right column: Cause summary */}
				<Grid item xs={12} md={4} component="div">
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Cause Details
							</Typography>

							{cause.imageUrl && (
								<Box
									component="img"
									src={cause.imageUrl}
									alt={cause.title}
									sx={{
										width: "100%",
										height: 150,
										objectFit: "cover",
										borderRadius: 1,
										mb: 2,
									}}
								/>
							)}

							<Typography variant="subtitle1" gutterBottom>
								{cause.title}
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{
									mb: 2,
									overflow: "hidden",
									textOverflow: "ellipsis",
									display: "-webkit-box",
									WebkitLineClamp: 3,
									WebkitBoxOrient: "vertical",
								}}
							>
								{cause.description}
							</Typography>

							<Box sx={{ mb: 2 }}>
								<Box
									display="flex"
									justifyContent="space-between"
									sx={{ mb: 0.5 }}
								>
									<Typography variant="body2" color="text.secondary">
										Raised
									</Typography>
									<Typography variant="body2" fontWeight="medium">
										${cause.raisedAmount.toLocaleString()}
									</Typography>
								</Box>
								<Box
									display="flex"
									justifyContent="space-between"
									sx={{ mb: 1 }}
								>
									<Typography variant="body2" color="text.secondary">
										Goal
									</Typography>
									<Typography variant="body2">
										${cause.targetAmount.toLocaleString()}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={progress}
									sx={{ height: 8, borderRadius: 4 }}
								/>
								<Typography
									variant="caption"
									color="text.secondary"
									align="right"
									display="block"
									sx={{ mt: 0.5 }}
								>
									{progress}% funded
								</Typography>
							</Box>

							<Box
								display="flex"
								alignItems="center"
								gap={1}
								sx={{ mt: 3, bgcolor: "info.50", p: 2, borderRadius: 1 }}
							>
								<HeartIcon color="info" />
								<Typography variant="body2">
									{cause.donorCount || 0} people have donated to this cause
								</Typography>
							</Box>

							{isAnonymous && (
								<Box
									display="flex"
									alignItems="center"
									gap={1}
									sx={{
										mt: 2,
										bgcolor: "background.default",
										p: 2,
										borderRadius: 1,
									}}
								>
									<AnonymousIcon color="action" />
									<Typography variant="body2">
										Your donation will be anonymous
									</Typography>
								</Box>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
}
