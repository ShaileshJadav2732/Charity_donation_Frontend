"use client";

import {
	ArrowBack,
	ArrowForward,
	CheckCircle,
	Home,
	LocalShipping,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Divider,
	FormControl,
	FormControlLabel,
	Paper,
	Radio,
	RadioGroup,
	Step,
	StepLabel,
	Stepper,
	TextField,
	Typography,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import PaymentWrapper from "../payment/PaymentWrapper";
import { toast } from "react-hot-toast";
import {
	CauseWithDetails,
	ImprovedDonationFormValues,
	FormSubmissionHandler,
	SelectChangeEvent,
} from "@/types/forms";
import { DonationType } from "@/types/donation";

interface ImprovedDonationFormProps {
	cause: CauseWithDetails;
	onSubmit: FormSubmissionHandler<ImprovedDonationFormValues>;
	isLoading?: boolean;
}

const ImprovedDonationForm: React.FC<ImprovedDonationFormProps> = ({
	cause,
	onSubmit,
	isLoading = false,
}) => {
	const [activeStep, setActiveStep] = useState(0);
	const [isMonetary, setIsMonetary] = useState(false);
	const [showPayment, setShowPayment] = useState(false);
	const [paymentCompleted, setPaymentCompleted] = useState(false);
	const customColor = "#287068";

	// Get accepted donation types from cause
	const acceptedDonationTypes = cause?.cause?.acceptedDonationTypes || [
		DonationType.MONEY,
	];
	const canDonateMoney = acceptedDonationTypes.includes(DonationType.MONEY);
	const canDonateItems = acceptedDonationTypes.some(
		(type) => type !== DonationType.MONEY
	);

	// Filter available item types based on cause acceptance
	const availableItemTypes = acceptedDonationTypes.filter(
		(type) => type !== DonationType.MONEY
	);

	const steps = [
		"Donation Type",
		"Details",
		"Delivery",
		"Contact",
		"Review",
		"Payment",
	];

	const formik = useFormik({
		initialValues: {
			type: DonationType.MONEY,
			amount: "",
			description: "",
			quantity: 1,
			unit: "kg",
			scheduledDate: "",
			scheduledTime: "",
			isPickup: false,
			contactPhone: "",
			contactEmail: "",
			pickupAddress: {
				street: "",
				city: "",
				state: "",
				zipCode: "",
				country: "",
			},
		},

		onSubmit: async (values) => {
			if (isMonetary && !paymentCompleted) {
				if (
					!values.amount ||
					!values.description ||
					!values.contactPhone ||
					!values.contactEmail
				) {
					toast.error("Please fill in all required fields");
					return;
				}
				setShowPayment(true);
				setActiveStep(5);
				return;
			}

			if (!isMonetary) {
				if (
					!values.quantity ||
					!values.unit ||
					!values.description ||
					!values.scheduledDate ||
					!values.scheduledTime ||
					!values.contactPhone ||
					!values.contactEmail
				) {
					toast.error("Please fill in all required fields");
					return;
				}

				if (
					values.isPickup &&
					(!values.pickupAddress.street ||
						!values.pickupAddress.city ||
						!values.pickupAddress.state ||
						!values.pickupAddress.zipCode ||
						!values.pickupAddress.country)
				) {
					toast.error("Please fill in all pickup address fields");
					return;
				}
			}

			try {
				await onSubmit(values);
			} catch (error) {
				console.error("Error in form submission:", error);
			}
		},
	});

	const validateCurrentStep = () => {
		switch (activeStep) {
			case 0:
				return true;
			case 1:
				if (isMonetary) {
					return (
						formik.values.amount &&
						Number(formik.values.amount) > 0 &&
						formik.values.description
					);
				} else {
					return (
						formik.values.quantity &&
						formik.values.unit &&
						formik.values.description
					);
				}
			case 2:
				if (isMonetary) return true;
				return formik.values.scheduledDate && formik.values.scheduledTime;
			case 3:
				return formik.values.contactPhone && formik.values.contactEmail;
			default:
				return true;
		}
	};

	const handleNext = () => {
		if (validateCurrentStep()) {
			if (isMonetary && activeStep === 1) {
				setActiveStep(3);
			} else if (isMonetary && activeStep === 4) {
				setShowPayment(true);
				setActiveStep(5);
			} else {
				setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
			}
		} else {
			toast.error("Please fill in all required fields before proceeding");
		}
	};

	const handleBack = () => {
		if (isMonetary && activeStep === 3) {
			setActiveStep(1);
		} else {
			setActiveStep((prev) => Math.max(prev - 1, 0));
		}
	};

	const handleDonationTypeChange = (event: SelectChangeEvent) => {
		const value = event.target.value;
		const isMonetaryDonation = value === "MONEY";
		setIsMonetary(isMonetaryDonation);
		formik.setFieldValue(
			"type",
			isMonetaryDonation
				? DonationType.MONEY
				: availableItemTypes[0] || DonationType.OTHER
		);
		formik.setFieldValue("isPickup", !isMonetaryDonation);
	};

	const renderStepContent = (step: number) => {
		switch (step) {
			case 0:
				return (
					<Card sx={{ border: `1px solid ${customColor}`, borderRadius: 2 }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
								Donation Type
							</Typography>
							<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
								Select how you would like to support this cause.
							</Typography>
							<FormControl component="fieldset" fullWidth>
								<RadioGroup
									value={isMonetary ? "MONEY" : "ITEMS"}
									onChange={handleDonationTypeChange}
								>
									<Box
										sx={{ display: "flex", flexDirection: "column", gap: 2 }}
									>
										{canDonateMoney && (
											<Paper
												elevation={isMonetary ? 3 : 1}
												sx={{
													p: 3,
													cursor: "pointer",
													border: `1px solid ${
														isMonetary ? customColor : "#e0e0e0"
													}`,
													borderRadius: 2,
												}}
												onClick={() =>
													handleDonationTypeChange({
														target: { value: "MONEY" },
													})
												}
											>
												<FormControlLabel
													value="MONEY"
													control={<Radio sx={{ color: customColor }} />}
													label={
														<Box>
															<Typography variant="h6" sx={{ fontWeight: 600 }}>
																Monetary Donation
															</Typography>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																Make a secure online donation.
															</Typography>
														</Box>
													}
												/>
											</Paper>
										)}
										{canDonateItems && (
											<Paper
												elevation={!isMonetary ? 3 : 1}
												sx={{
													p: 3,
													cursor: "pointer",
													border: `1px solid ${
														!isMonetary ? customColor : "#e0e0e0"
													}`,
													borderRadius: 2,
												}}
												onClick={() =>
													handleDonationTypeChange({
														target: { value: "ITEMS" },
													})
												}
											>
												<FormControlLabel
													value="ITEMS"
													control={<Radio sx={{ color: customColor }} />}
													label={
														<Box>
															<Typography variant="h6" sx={{ fontWeight: 600 }}>
																Item Donation
															</Typography>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																Donate items:{" "}
																{availableItemTypes.join(", ").toLowerCase()}
															</Typography>
														</Box>
													}
												/>
											</Paper>
										)}
										{!canDonateMoney && !canDonateItems && (
											<Alert severity="warning">
												This cause is not currently accepting donations.
											</Alert>
										)}
									</Box>
								</RadioGroup>
							</FormControl>
						</CardContent>
					</Card>
				);

			case 1:
				return (
					<Card sx={{ border: `1px solid ${customColor}`, borderRadius: 2 }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
								{isMonetary ? "Donation Amount" : "Item Details"}
							</Typography>
							<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
								{isMonetary
									? "Choose the amount you would like to donate."
									: "Provide details about the items you are donating."}
							</Typography>
							{isMonetary ? (
								<Box>
									<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
										Select Amount
									</Typography>
									<Box
										sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}
									>
										{[10, 25, 50, 100, 250, 500].map((amount) => (
											<Chip
												key={amount}
												label={`$${amount}`}
												onClick={() => formik.setFieldValue("amount", amount)}
												color={
													Number(formik.values.amount) === amount
														? "primary"
														: "default"
												}
												sx={{ fontWeight: 600 }}
											/>
										))}
									</Box>
									<TextField
										fullWidth
										label="Custom Amount ($)"
										name="amount"
										type="number"
										value={formik.values.amount}
										onChange={formik.handleChange}
										error={
											formik.touched.amount && Boolean(formik.errors.amount)
										}
										helperText={formik.touched.amount && formik.errors.amount}
										sx={{ mb: 3 }}
									/>
								</Box>
							) : (
								<Box>
									<Box
										sx={{
											display: "flex",
											gap: 2,
											flexDirection: { xs: "column", md: "row" },
											mb: 3,
										}}
									>
										<Box sx={{ flex: 1 }}>
											<TextField
												fullWidth
												label="Quantity"
												name="quantity"
												type="number"
												value={formik.values.quantity}
												onChange={formik.handleChange}
												error={
													formik.touched.quantity &&
													Boolean(formik.errors.quantity)
												}
												helperText={
													formik.touched.quantity && formik.errors.quantity
												}
											/>
										</Box>
										<Box sx={{ flex: 1 }}>
											<TextField
												fullWidth
												label="Unit (e.g., kg, items, boxes)"
												name="unit"
												value={formik.values.unit}
												onChange={formik.handleChange}
												error={
													formik.touched.unit && Boolean(formik.errors.unit)
												}
												helperText={formik.touched.unit && formik.errors.unit}
											/>
										</Box>
									</Box>
									{availableItemTypes.length > 1 && (
										<Box sx={{ mb: 3 }}>
											<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
												Item Type
											</Typography>
											<FormControl fullWidth>
												<Select
													value={formik.values.type}
													onChange={(e) =>
														formik.setFieldValue("type", e.target.value)
													}
													displayEmpty
												>
													{availableItemTypes.map((type) => (
														<MenuItem key={type} value={type}>
															{type.charAt(0) + type.slice(1).toLowerCase()}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</Box>
									)}
								</Box>
							)}
							<TextField
								fullWidth
								label="Description"
								name="description"
								multiline
								rows={4}
								value={formik.values.description}
								onChange={formik.handleChange}
								error={
									formik.touched.description &&
									Boolean(formik.errors.description)
								}
								helperText={
									formik.touched.description && formik.errors.description
								}
								sx={{ mt: 3 }}
							/>
						</CardContent>
					</Card>
				);

			case 2:
				return !isMonetary ? (
					<Card sx={{ border: `1px solid ${customColor}`, borderRadius: 2 }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
								Delivery Method
							</Typography>
							<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
								Choose how you would like to deliver your donation.
							</Typography>
							<Box
								sx={{
									display: "flex",
									gap: 2,
									flexDirection: { xs: "column", md: "row" },
								}}
							>
								<Box sx={{ flex: 1 }}>
									<Paper
										elevation={formik.values.isPickup ? 3 : 1}
										sx={{
											p: 3,
											cursor: "pointer",
											border: `1px solid ${
												formik.values.isPickup ? customColor : "#e0e0e0"
											}`,
											borderRadius: 2,
										}}
										onClick={() => formik.setFieldValue("isPickup", true)}
									>
										<Box sx={{ textAlign: "center" }}>
											<LocalShipping
												sx={{ fontSize: 40, color: customColor, mb: 1 }}
											/>
											<Typography variant="h6" sx={{ fontWeight: 600 }}>
												Pickup Service
											</Typography>
											<Typography variant="body2" color="text.secondary">
												We will collect the donation from your address.
											</Typography>
										</Box>
									</Paper>
								</Box>
								<Box sx={{ flex: 1 }}>
									<Paper
										elevation={!formik.values.isPickup ? 3 : 1}
										sx={{
											p: 3,
											cursor: "pointer",
											border: `1px solid ${
												!formik.values.isPickup ? customColor : "#e0e0e0"
											}`,
											borderRadius: 2,
										}}
										onClick={() => formik.setFieldValue("isPickup", false)}
									>
										<Box sx={{ textAlign: "center" }}>
											<Home sx={{ fontSize: 40, color: customColor, mb: 1 }} />
											<Typography variant="h6" sx={{ fontWeight: 600 }}>
												Drop-off
											</Typography>
											<Typography variant="body2" color="text.secondary">
												You will deliver to the organization&apos;s address.
											</Typography>
										</Box>
									</Paper>
								</Box>
							</Box>
							<Box sx={{ mt: 3 }}>
								<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
									Schedule Date & Time
								</Typography>
								<Box
									sx={{
										display: "flex",
										gap: 2,
										flexDirection: { xs: "column", md: "row" },
									}}
								>
									<Box sx={{ flex: 1 }}>
										<TextField
											fullWidth
											type="date"
											name="scheduledDate"
											label="Preferred Date"
											slotProps={{ inputLabel: { shrink: true } }}
											value={formik.values.scheduledDate}
											onChange={formik.handleChange}
											error={
												formik.touched.scheduledDate &&
												Boolean(formik.errors.scheduledDate)
											}
											helperText={
												formik.touched.scheduledDate &&
												formik.errors.scheduledDate
											}
										/>
									</Box>
									<Box sx={{ flex: 1 }}>
										<TextField
											fullWidth
											type="time"
											name="scheduledTime"
											label="Preferred Time"
											slotProps={{ inputLabel: { shrink: true } }}
											value={formik.values.scheduledTime}
											onChange={formik.handleChange}
											error={
												formik.touched.scheduledTime &&
												Boolean(formik.errors.scheduledTime)
											}
											helperText={
												formik.touched.scheduledTime &&
												formik.errors.scheduledTime
											}
										/>
									</Box>
								</Box>
							</Box>
						</CardContent>
					</Card>
				) : (
					<Alert severity="info" sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Delivery Not Required
						</Typography>
						<Typography>
							Monetary donations are processed electronically.
						</Typography>
					</Alert>
				);

			case 3:
				return (
					<Card sx={{ border: `1px solid ${customColor}`, borderRadius: 2 }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
								Contact Information
							</Typography>
							<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
								Provide contact details for donation coordination.
							</Typography>
							<Box
								sx={{
									display: "flex",
									gap: 2,
									flexDirection: { xs: "column", md: "row" },
								}}
							>
								<Box sx={{ flex: 1 }}>
									<TextField
										fullWidth
										label="Phone Number"
										name="contactPhone"
										value={formik.values.contactPhone}
										onChange={formik.handleChange}
										error={
											formik.touched.contactPhone &&
											Boolean(formik.errors.contactPhone)
										}
										helperText={
											formik.touched.contactPhone && formik.errors.contactPhone
										}
									/>
								</Box>
								<Box sx={{ flex: 1 }}>
									<TextField
										fullWidth
										label="Email Address"
										name="contactEmail"
										type="email"
										value={formik.values.contactEmail}
										onChange={formik.handleChange}
										error={
											formik.touched.contactEmail &&
											Boolean(formik.errors.contactEmail)
										}
										helperText={
											formik.touched.contactEmail && formik.errors.contactEmail
										}
									/>
								</Box>
							</Box>
							{!isMonetary && formik.values.isPickup && (
								<Box sx={{ mt: 3 }}>
									<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
										Pickup Address
									</Typography>
									<Box
										sx={{ display: "flex", flexDirection: "column", gap: 2 }}
									>
										<Box>
											<TextField
												fullWidth
												label="Street Address"
												name="pickupAddress.street"
												value={formik.values.pickupAddress.street}
												onChange={formik.handleChange}
											/>
										</Box>
										<Box
											sx={{
												display: "flex",
												gap: 2,
												flexDirection: { xs: "column", md: "row" },
											}}
										>
											<Box sx={{ flex: 1 }}>
												<TextField
													fullWidth
													label="City"
													name="pickupAddress.city"
													value={formik.values.pickupAddress.city}
													onChange={formik.handleChange}
												/>
											</Box>
											<Box sx={{ flex: 1 }}>
												<TextField
													fullWidth
													label="State"
													name="pickupAddress.state"
													value={formik.values.pickupAddress.state}
													onChange={formik.handleChange}
												/>
											</Box>
										</Box>
										<Box
											sx={{
												display: "flex",
												gap: 2,
												flexDirection: { xs: "column", md: "row" },
											}}
										>
											<Box sx={{ flex: 1 }}>
												<TextField
													fullWidth
													label="ZIP Code"
													name="pickupAddress.zipCode"
													value={formik.values.pickupAddress.zipCode}
													onChange={formik.handleChange}
												/>
											</Box>
											<Box sx={{ flex: 1 }}>
												<TextField
													fullWidth
													label="Country"
													name="pickupAddress.country"
													value={formik.values.pickupAddress.country}
													onChange={formik.handleChange}
												/>
											</Box>
										</Box>
									</Box>
								</Box>
							)}
						</CardContent>
					</Card>
				);

			case 4:
				return (
					<Card sx={{ border: `1px solid ${customColor}`, borderRadius: 2 }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
								Review Your Donation
							</Typography>
							<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
								Please review your donation details before submitting.
							</Typography>
							<Box
								sx={{
									display: "flex",
									gap: 2,
									flexDirection: { xs: "column", md: "row" },
								}}
							>
								<Box sx={{ flex: 1 }}>
									<Paper sx={{ p: 2, bgcolor: "grey.50" }}>
										<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
											Donation Details
										</Typography>
										<Divider sx={{ mb: 2 }} />
										<Typography variant="body2" sx={{ mb: 1 }}>
											<strong>Type:</strong> {isMonetary ? "Monetary" : "Items"}
										</Typography>
										{isMonetary ? (
											<Typography variant="body2" sx={{ mb: 1 }}>
												<strong>Amount:</strong> ${formik.values.amount}
											</Typography>
										) : (
											<>
												<Typography variant="body2" sx={{ mb: 1 }}>
													<strong>Quantity:</strong> {formik.values.quantity}{" "}
													{formik.values.unit}
												</Typography>
												<Typography variant="body2" sx={{ mb: 1 }}>
													<strong>Delivery:</strong>{" "}
													{formik.values.isPickup ? "Pickup" : "Drop-off"}
												</Typography>
											</>
										)}
										<Typography variant="body2">
											<strong>Description:</strong> {formik.values.description}
										</Typography>
									</Paper>
								</Box>
								<Box sx={{ flex: 1 }}>
									<Paper sx={{ p: 2, bgcolor: "grey.50" }}>
										<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
											Contact Information
										</Typography>
										<Divider sx={{ mb: 2 }} />
										<Typography variant="body2" sx={{ mb: 1 }}>
											<strong>Phone:</strong> {formik.values.contactPhone}
										</Typography>
										<Typography variant="body2">
											<strong>Email:</strong> {formik.values.contactEmail}
										</Typography>
									</Paper>
								</Box>
							</Box>
							<Alert severity="success" sx={{ mt: 3 }}>
								<Typography variant="body2">
									By submitting, you agree to our terms and conditions. You will
									receive a confirmation email once processed.
								</Typography>
							</Alert>
						</CardContent>
					</Card>
				);

			case 5:
				return isMonetary && showPayment ? (
					<PaymentWrapper
						donationData={{
							amount: Number(formik.values.amount),
							cause: cause?.cause?.id || cause?.cause?._id || "",
							organization: cause?.cause?.organizationId || "",
							campaign: cause?.campaign?._id,
							description: formik.values.description,
							contactPhone: formik.values.contactPhone,
							contactEmail: formik.values.contactEmail,
						}}
						onSuccess={() => {
							setPaymentCompleted(true);
							toast.success(
								"Payment successful! Your donation has been processed."
							);
							if (onSubmit) {
								onSubmit(formik.values);
							}
						}}
						onError={(error) => {
							toast.error(`Payment failed: ${error}`);
						}}
						onCancel={() => {
							setShowPayment(false);
							setActiveStep(4);
						}}
					/>
				) : (
					<Alert severity="info" sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Payment Not Required
						</Typography>
						<Typography>
							Item donations do not require online payment.
						</Typography>
					</Alert>
				);

			default:
				return <Typography>Step content not implemented yet</Typography>;
		}
	};

	return (
		<Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 2, md: 3 } }}>
			<Box sx={{ mb: 3 }}>
				<Typography
					variant="h4"
					gutterBottom
					sx={{ fontWeight: 600, color: customColor }}
				>
					Make a Donation
				</Typography>
				<Typography variant="h6" sx={{ color: "text.secondary" }}>
					{cause?.cause?.title}
				</Typography>
			</Box>

			<Card sx={{ mb: 3, border: `1px solid ${customColor}`, borderRadius: 2 }}>
				<CardContent sx={{ p: 2 }}>
					<Stepper
						activeStep={activeStep}
						alternativeLabel
						sx={{
							"& .MuiStepLabel-root .Mui-completed": { color: customColor },
							"& .MuiStepLabel-root .Mui-active": { color: customColor },
							"& .MuiStepConnector-line": { borderColor: "#e0e0e0" },
							"& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
								borderColor: customColor,
							},
							"& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
								borderColor: customColor,
							},
							"& .MuiStepLabel-label": { fontWeight: 600 },
						}}
					>
						{steps.map((label) => (
							<Step key={label}>
								<StepLabel>{label}</StepLabel>
							</Step>
						))}
					</Stepper>
				</CardContent>
			</Card>

			<Box component="form" onSubmit={formik.handleSubmit}>
				{renderStepContent(activeStep)}

				{activeStep !== 5 && (
					<Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
						<Button
							onClick={handleBack}
							disabled={activeStep === 0}
							startIcon={<ArrowBack />}
							variant="outlined"
							sx={{ borderColor: customColor, color: customColor }}
						>
							Back
						</Button>
						<Button
							type={
								(activeStep === steps.length - 2 && !isMonetary) ||
								(isMonetary && activeStep === 4)
									? "submit"
									: "button"
							}
							onClick={
								(activeStep === steps.length - 2 && !isMonetary) ||
								(isMonetary && activeStep === 4)
									? undefined
									: handleNext
							}
							endIcon={
								(activeStep === steps.length - 2 && !isMonetary) ||
								(isMonetary && activeStep === 4) ? (
									<CheckCircle />
								) : (
									<ArrowForward />
								)
							}
							variant="contained"
							disabled={isLoading}
							sx={{
								backgroundColor: customColor,
								"&:hover": { backgroundColor: `${customColor}cc` },
							}}
						>
							{isLoading ? (
								<CircularProgress size={20} color="inherit" />
							) : (activeStep === steps.length - 2 && !isMonetary) ||
							  (isMonetary && activeStep === 4) ? (
								isMonetary ? (
									"Proceed to Payment"
								) : (
									"Complete Donation"
								)
							) : (
								"Next"
							)}
						</Button>
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default ImprovedDonationForm;
