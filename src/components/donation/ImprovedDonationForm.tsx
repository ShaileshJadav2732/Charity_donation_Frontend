"use client";

import {
	ArrowBack,
	ArrowForward,
	AttachMoney,
	CheckCircle,
	Home,
	Inventory,
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
	Grid,
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

interface ImprovedDonationFormProps {
	cause: any;
	onSubmit: (values: any) => Promise<void>;
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
			type: "MONEY",
			amount: "",
			description: "",
			quantity: 1,
			unit: "kg",
			scheduledDate: "",
			scheduledTime: "",
			isPickup: false, // Default to false for monetary donations
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
		validationSchema: Yup.object({
			amount: isMonetary
				? Yup.number()
						.required("Amount is required")
						.min(1, "Amount must be at least $1")
				: Yup.number(),
			description: Yup.string()
				.required("Description is required")
				.min(10, "Please provide more details"),
			quantity: !isMonetary
				? Yup.number()
						.required("Quantity is required")
						.min(1, "Quantity must be at least 1")
				: Yup.number(),
			unit: !isMonetary
				? Yup.string().required("Unit is required")
				: Yup.string(),
			scheduledDate: !isMonetary
				? Yup.string().required("Scheduled date is required")
				: Yup.string(),
			scheduledTime: !isMonetary
				? Yup.string().required("Scheduled time is required")
				: Yup.string(),
			contactPhone: Yup.string().required("Phone number is required"),
			contactEmail: Yup.string()
				.email("Invalid email")
				.required("Email is required"),
			pickupAddress: !isMonetary
				? Yup.object().when("isPickup", {
						is: true,
						then: (schema) =>
							schema.shape({
								street: Yup.string().required("Street address is required"),
								city: Yup.string().required("City is required"),
								state: Yup.string().required("State is required"),
								zipCode: Yup.string().required("ZIP code is required"),
								country: Yup.string().required("Country is required"),
							}),
						otherwise: (schema) => schema.notRequired(),
				  })
				: Yup.object(),
		}),
		onSubmit: async (values) => {
			console.log("Form submitted with values:", values);

			// For monetary donations, show payment form instead of submitting directly
			if (isMonetary && !paymentCompleted) {
				// Final validation before showing payment
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
				setActiveStep(5); // Go to payment step
				return;
			}

			// For item donations or completed payments, proceed with submission
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
				// Donation type is always valid since we have defaults
				return true;
			case 1:
				// Validate donation details
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
				// For monetary donations, skip delivery step
				if (isMonetary) return true;
				// For item donations, validate date and time
				return formik.values.scheduledDate && formik.values.scheduledTime;
			case 3:
				// Validate contact information
				return formik.values.contactPhone && formik.values.contactEmail;
			default:
				return true;
		}
	};

	const handleNext = () => {
		if (validateCurrentStep()) {
			// For monetary donations, skip the delivery step (step 2)
			if (isMonetary && activeStep === 1) {
				setActiveStep(3); // Skip to contact info
			} else if (isMonetary && activeStep === 4) {
				// For monetary donations, go to payment step after review
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
		// For monetary donations, skip the delivery step when going back
		if (isMonetary && activeStep === 3) {
			setActiveStep(1); // Go back to details
		} else {
			setActiveStep((prev) => Math.max(prev - 1, 0));
		}
	};

	const handleDonationTypeChange = (event: any) => {
		const value = event.target.value;
		const isMonetaryDonation = value === "MONEY";
		setIsMonetary(isMonetaryDonation);
		formik.setFieldValue("type", isMonetaryDonation ? "MONEY" : "FOOD");

		// For monetary donations, set isPickup to false (not applicable)
		// For item donations, set isPickup to true (default to pickup)
		formik.setFieldValue("isPickup", !isMonetaryDonation);
	};

	const renderStepContent = (step: number) => {
		switch (step) {
			case 0:
				return (
					<Card
						elevation={0}
						sx={{
							border: `3px solid ${customColor}`,
							borderRadius: 4,
							background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${customColor}08)`,
							overflow: "hidden",
						}}
					>
						<CardContent sx={{ p: 5 }}>
							<Box sx={{ textAlign: "center", mb: 5 }}>
								<Typography
									variant="h4"
									gutterBottom
									sx={{
										fontWeight: 700,
										color: customColor,
										mb: 2,
									}}
								>
									🎯 Choose Your Donation Type
								</Typography>
								<Typography
									variant="h6"
									sx={{
										color: "#4a5568",
										fontWeight: 500,
										maxWidth: 500,
										mx: "auto",
										lineHeight: 1.6,
									}}
								>
									Select how you would like to make a difference and support
									this amazing cause
								</Typography>
							</Box>

							<FormControl component="fieldset" fullWidth>
								<RadioGroup
									value={isMonetary ? "MONEY" : "ITEMS"}
									onChange={handleDonationTypeChange}
								>
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
											gap: 4,
										}}
									>
										{/* Monetary Donation Option */}
										<Paper
											elevation={isMonetary ? 8 : 2}
											sx={{
												p: 4,
												cursor: "pointer",
												border: "3px solid",
												borderColor: isMonetary ? customColor : "#e0e0e0",
												bgcolor: isMonetary
													? `${customColor}15`
													: "background.paper",
												borderRadius: 4,
												transition: "all 0.3s ease",
												transform: isMonetary ? "scale(1.02)" : "scale(1)",
												"&:hover": {
													elevation: 8,
													borderColor: customColor,
													transform: "scale(1.02)",
													bgcolor: `${customColor}10`,
												},
											}}
											onClick={() =>
												handleDonationTypeChange({
													target: { value: "MONEY" },
												})
											}
										>
											<Box sx={{ textAlign: "center" }}>
												<Box
													sx={{
														width: 80,
														height: 80,
														borderRadius: "50%",
														background: `linear-gradient(135deg, ${customColor}, #3b82f6)`,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														mx: "auto",
														mb: 3,
														boxShadow: `0 8px 25px ${customColor}40`,
													}}
												>
													<AttachMoney sx={{ fontSize: 40, color: "white" }} />
												</Box>
												<FormControlLabel
													value="MONEY"
													control={
														<Radio
															sx={{
																color: customColor,
																"&.Mui-checked": {
																	color: customColor,
																},
															}}
														/>
													}
													label={
														<Box>
															<Typography
																variant="h5"
																sx={{
																	fontWeight: 700,
																	color: isMonetary ? customColor : "#1a1a1a",
																	mb: 1,
																}}
															>
																💰 Monetary Donation
															</Typography>
															<Typography
																variant="body1"
																sx={{
																	color: "#6b7280",
																	fontWeight: 500,
																	lineHeight: 1.5,
																}}
															>
																Make an instant impact with a secure online
																donation. Every dollar counts!
															</Typography>
														</Box>
													}
													sx={{ m: 0 }}
												/>
											</Box>
										</Paper>

										{/* Item Donation Option */}
										<Paper
											elevation={!isMonetary ? 8 : 2}
											sx={{
												p: 4,
												cursor: "pointer",
												border: "3px solid",
												borderColor: !isMonetary ? customColor : "#e0e0e0",
												bgcolor: !isMonetary
													? `${customColor}15`
													: "background.paper",
												borderRadius: 4,
												transition: "all 0.3s ease",
												transform: !isMonetary ? "scale(1.02)" : "scale(1)",
												"&:hover": {
													elevation: 8,
													borderColor: customColor,
													transform: "scale(1.02)",
													bgcolor: `${customColor}10`,
												},
											}}
											onClick={() =>
												handleDonationTypeChange({
													target: { value: "ITEMS" },
												})
											}
										>
											<Box sx={{ textAlign: "center" }}>
												<Box
													sx={{
														width: 80,
														height: 80,
														borderRadius: "50%",
														background: `linear-gradient(135deg, #ec4899, #f59e0b)`,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														mx: "auto",
														mb: 3,
														boxShadow: "0 8px 25px rgba(236, 72, 153, 0.4)",
													}}
												>
													<Inventory sx={{ fontSize: 40, color: "white" }} />
												</Box>
												<FormControlLabel
													value="ITEMS"
													control={
														<Radio
															sx={{
																color: customColor,
																"&.Mui-checked": {
																	color: customColor,
																},
															}}
														/>
													}
													label={
														<Box>
															<Typography
																variant="h5"
																sx={{
																	fontWeight: 700,
																	color: !isMonetary ? customColor : "#1a1a1a",
																	mb: 1,
																}}
															>
																📦 Item Donation
															</Typography>
															<Typography
																variant="body1"
																sx={{
																	color: "#6b7280",
																	fontWeight: 500,
																	lineHeight: 1.5,
																}}
															>
																Donate physical items that this cause needs.
																Your items will directly help those in need!
															</Typography>
														</Box>
													}
													sx={{ m: 0 }}
												/>
											</Box>
										</Paper>
									</Box>
								</RadioGroup>
							</FormControl>
						</CardContent>
					</Card>
				);

			case 1:
				return (
					<Card
						elevation={0}
						sx={{
							border: `3px solid ${customColor}`,
							borderRadius: 4,
							background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${customColor}08)`,
							overflow: "hidden",
						}}
					>
						<CardContent sx={{ p: 5 }}>
							<Box sx={{ textAlign: "center", mb: 5 }}>
								<Typography
									variant="h4"
									gutterBottom
									sx={{
										fontWeight: 700,
										color: customColor,
										mb: 2,
									}}
								>
									{isMonetary ? "💰 Donation Amount" : "📦 Item Details"}
								</Typography>
								<Typography
									variant="h6"
									sx={{
										color: "#4a5568",
										fontWeight: 500,
										maxWidth: 500,
										mx: "auto",
										lineHeight: 1.6,
									}}
								>
									{isMonetary
										? "Every contribution makes a difference! Choose an amount that feels right for you."
										: "Tell us about the items you'd like to donate to help this cause."}
								</Typography>
							</Box>

							{isMonetary ? (
								<Box>
									<Typography
										variant="h5"
										gutterBottom
										sx={{
											mb: 4,
											fontWeight: 600,
											color: customColor,
											textAlign: "center",
										}}
									>
										🎯 How much would you like to donate?
									</Typography>

									{/* Quick Amount Selection */}
									<Box sx={{ mb: 4 }}>
										<Typography
											variant="h6"
											sx={{
												mb: 3,
												fontWeight: 600,
												color: "#374151",
											}}
										>
											Quick Select:
										</Typography>
										<Box
											sx={{
												display: "grid",
												gridTemplateColumns:
													"repeat(auto-fit, minmax(120px, 1fr))",
												gap: 2,
											}}
										>
											{[10, 25, 50, 100, 250, 500].map((amount) => (
												<Paper
													key={amount}
													elevation={
														Number(formik.values.amount) === amount ? 8 : 2
													}
													sx={{
														p: 3,
														cursor: "pointer",
														border: "3px solid",
														borderColor:
															Number(formik.values.amount) === amount
																? customColor
																: "#e0e0e0",
														backgroundColor:
															Number(formik.values.amount) === amount
																? `${customColor}15`
																: "white",
														borderRadius: 3,
														textAlign: "center",
														transition: "all 0.3s ease",
														transform:
															Number(formik.values.amount) === amount
																? "scale(1.05)"
																: "scale(1)",
														"&:hover": {
															elevation: 8,
															borderColor: customColor,
															backgroundColor: `${customColor}10`,
															transform: "scale(1.05)",
														},
													}}
													onClick={() => formik.setFieldValue("amount", amount)}
												>
													<Typography
														variant="h5"
														sx={{
															fontWeight: 700,
															color:
																Number(formik.values.amount) === amount
																	? customColor
																	: "#1a1a1a",
															mb: 1,
														}}
													>
														${amount}
													</Typography>
													<Typography
														variant="body2"
														sx={{
															color: "#6b7280",
															fontWeight: 500,
														}}
													>
														{amount <= 25
															? "Starter"
															: amount <= 100
															? "Popular"
															: "Generous"}
													</Typography>
												</Paper>
											))}
										</Box>
									</Box>

									{/* Custom Amount Input */}
									<Box
										sx={{
											p: 4,
											borderRadius: 3,
											border: `2px solid ${customColor}30`,
											backgroundColor: `${customColor}05`,
										}}
									>
										<Typography
											variant="h6"
											sx={{
												mb: 3,
												fontWeight: 600,
												color: customColor,
												textAlign: "center",
											}}
										>
											💡 Or enter a custom amount:
										</Typography>
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
											sx={{
												"& .MuiOutlinedInput-root": {
													borderRadius: 3,
													fontSize: "1.2rem",
													fontWeight: 600,
													"& fieldset": {
														borderColor: customColor,
														borderWidth: 2,
													},
													"&:hover fieldset": {
														borderColor: customColor,
													},
													"&.Mui-focused fieldset": {
														borderColor: customColor,
													},
												},
												"& .MuiInputLabel-root": {
													color: customColor,
													fontWeight: 600,
													"&.Mui-focused": {
														color: customColor,
													},
												},
											}}
											InputProps={{
												startAdornment: (
													<Box
														sx={{
															mr: 1,
															color: customColor,
															fontWeight: 700,
															fontSize: "1.2rem",
														}}
													>
														$
													</Box>
												),
											}}
										/>
									</Box>
								</Box>
							) : (
								<Grid container spacing={3}>
									<Grid item xs={12} md={6}>
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
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											fullWidth
											label="Unit (e.g., kg, items, boxes)"
											name="unit"
											value={formik.values.unit}
											onChange={formik.handleChange}
											error={formik.touched.unit && Boolean(formik.errors.unit)}
											helperText={formik.touched.unit && formik.errors.unit}
										/>
									</Grid>
								</Grid>
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
								placeholder="Tell us more about your donation..."
								sx={{ mt: 3 }}
							/>
						</CardContent>
					</Card>
				);

			case 2:
				return !isMonetary ? (
					<Card
						elevation={0}
						sx={{ border: "1px solid", borderColor: "divider" }}
					>
						<CardContent sx={{ p: 4 }}>
							<Box sx={{ textAlign: "center", mb: 4 }}>
								<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
									Delivery Method
								</Typography>
								<Typography variant="body1" color="text.secondary">
									How would you like to deliver your donation?
								</Typography>
							</Box>

							<Grid container spacing={3}>
								<Grid item xs={12} md={6}>
									<Paper
										elevation={formik.values.isPickup ? 3 : 1}
										sx={{
											p: 3,
											cursor: "pointer",
											border: "2px solid",
											borderColor: formik.values.isPickup
												? customColor
												: "transparent",
											bgcolor: formik.values.isPickup
												? `${customColor}15`
												: "background.paper",
											transition: "all 0.3s ease",
											"&:hover": { elevation: 3, borderColor: customColor },
										}}
										onClick={() => formik.setFieldValue("isPickup", true)}
									>
										<Box sx={{ textAlign: "center" }}>
											<LocalShipping
												sx={{ fontSize: 48, color: customColor, mb: 2 }}
											/>
											<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
												Pickup Service
											</Typography>
											<Typography variant="body2" color="text.secondary">
												We will collect the donation from your address
											</Typography>
										</Box>
									</Paper>
								</Grid>
								<Grid item xs={12} md={6}>
									<Paper
										elevation={!formik.values.isPickup ? 3 : 1}
										sx={{
											p: 3,
											cursor: "pointer",
											border: "2px solid",
											borderColor: !formik.values.isPickup
												? customColor
												: "transparent",
											bgcolor: !formik.values.isPickup
												? `${customColor}15`
												: "background.paper",
											transition: "all 0.3s ease",
											"&:hover": { elevation: 3, borderColor: customColor },
										}}
										onClick={() => formik.setFieldValue("isPickup", false)}
									>
										<Box sx={{ textAlign: "center" }}>
											<Home sx={{ fontSize: 48, color: customColor, mb: 2 }} />
											<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
												Drop-off
											</Typography>
											<Typography variant="body2" color="text.secondary">
												You will deliver to the organizations address
											</Typography>
										</Box>
									</Paper>
								</Grid>
							</Grid>

							<Box sx={{ mt: 4 }}>
								<Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
									Schedule Date & Time
								</Typography>
								<Grid container spacing={3}>
									<Grid item xs={12} md={6}>
										<TextField
											fullWidth
											type="date"
											name="scheduledDate"
											label="Preferred Date"
											InputLabelProps={{ shrink: true }}
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
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											fullWidth
											type="time"
											name="scheduledTime"
											label="Preferred Time"
											InputLabelProps={{ shrink: true }}
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
									</Grid>
								</Grid>
							</Box>
						</CardContent>
					</Card>
				) : (
					<Alert severity="info" sx={{ textAlign: "center", p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Delivery Not Required
						</Typography>
						<Typography>
							Monetary donations are processed electronically. No delivery is
							needed.
						</Typography>
					</Alert>
				);

			case 3:
				return (
					<Card
						elevation={0}
						sx={{ border: "1px solid", borderColor: "divider" }}
					>
						<CardContent sx={{ p: 4 }}>
							<Box sx={{ textAlign: "center", mb: 4 }}>
								<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
									Contact Information
								</Typography>
								<Typography variant="body1" color="text.secondary">
									We will use this information to contact you about your
									donation
								</Typography>
							</Box>

							<Grid container spacing={3}>
								<Grid item xs={12} md={6}>
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
								</Grid>
								<Grid item xs={12} md={6}>
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
								</Grid>
							</Grid>

							{!isMonetary && formik.values.isPickup && (
								<Box sx={{ mt: 4 }}>
									<Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
										Pickup Address
									</Typography>
									<Grid container spacing={3}>
										<Grid item xs={12}>
											<TextField
												fullWidth
												label="Street Address"
												name="pickupAddress.street"
												value={formik.values.pickupAddress.street}
												onChange={formik.handleChange}
											/>
										</Grid>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="City"
												name="pickupAddress.city"
												value={formik.values.pickupAddress.city}
												onChange={formik.handleChange}
											/>
										</Grid>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="State"
												name="pickupAddress.state"
												value={formik.values.pickupAddress.state}
												onChange={formik.handleChange}
											/>
										</Grid>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="ZIP Code"
												name="pickupAddress.zipCode"
												value={formik.values.pickupAddress.zipCode}
												onChange={formik.handleChange}
											/>
										</Grid>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="Country"
												name="pickupAddress.country"
												value={formik.values.pickupAddress.country}
												onChange={formik.handleChange}
											/>
										</Grid>
									</Grid>
								</Box>
							)}
						</CardContent>
					</Card>
				);

			case 4:
				return (
					<Card
						elevation={0}
						sx={{ border: "1px solid", borderColor: "divider" }}
					>
						<CardContent sx={{ p: 4 }}>
							<Box sx={{ textAlign: "center", mb: 4 }}>
								<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
									Review Your Donation
								</Typography>
								<Typography variant="body1" color="text.secondary">
									Please review your donation details before submitting
								</Typography>
							</Box>

							<Grid container spacing={3}>
								<Grid item xs={12} md={6}>
									<Paper elevation={1} sx={{ p: 3, bgcolor: "grey.50" }}>
										<Typography
											variant="h6"
											gutterBottom
											sx={{ fontWeight: 600 }}
										>
											Donation Details
										</Typography>
										<Divider sx={{ mb: 2 }} />
										<Typography variant="body1" sx={{ mb: 1 }}>
											<strong>Type:</strong> {isMonetary ? "Monetary" : "Items"}
										</Typography>
										{isMonetary ? (
											<Typography variant="body1" sx={{ mb: 1 }}>
												<strong>Amount:</strong> ${formik.values.amount}
											</Typography>
										) : (
											<>
												<Typography variant="body1" sx={{ mb: 1 }}>
													<strong>Quantity:</strong> {formik.values.quantity}{" "}
													{formik.values.unit}
												</Typography>
												<Typography variant="body1" sx={{ mb: 1 }}>
													<strong>Delivery:</strong>{" "}
													{formik.values.isPickup ? "Pickup" : "Drop-off"}
												</Typography>
											</>
										)}
										<Typography variant="body1">
											<strong>Description:</strong> {formik.values.description}
										</Typography>
									</Paper>
								</Grid>
								<Grid item xs={12} md={6}>
									<Paper elevation={1} sx={{ p: 3, bgcolor: "grey.50" }}>
										<Typography
											variant="h6"
											gutterBottom
											sx={{ fontWeight: 600 }}
										>
											Contact Information
										</Typography>
										<Divider sx={{ mb: 2 }} />
										<Typography variant="body1" sx={{ mb: 1 }}>
											<strong>Phone:</strong> {formik.values.contactPhone}
										</Typography>
										<Typography variant="body1">
											<strong>Email:</strong> {formik.values.contactEmail}
										</Typography>
									</Paper>
								</Grid>
							</Grid>

							<Alert severity="success" sx={{ mt: 3 }}>
								<Typography variant="body1">
									By submitting this donation, you agree to our terms and
									conditions. You will receive a confirmation email once your
									donation is processed.
								</Typography>
							</Alert>
						</CardContent>
					</Card>
				);

			case 5:
				// Payment step - only for monetary donations
				console.log("Debug - Cause data structure:", cause);
				console.log("Debug - Cause ID:", cause?.cause?.id || cause?.cause?._id);
				console.log("Debug - Organization ID:", cause?.cause?.organizationId);
				console.log("Debug - Form values:", formik.values);

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
						onSuccess={(donation) => {
							console.log("Payment successful:", donation);
							setPaymentCompleted(true);
							toast.success(
								"Payment successful! Your donation has been processed."
							);
							// You can redirect or show success message here
							if (onSubmit) {
								// Call the parent's onSubmit to handle post-payment logic
								onSubmit(formik.values);
							}
						}}
						onError={(error) => {
							console.error("Payment failed:", error);
							toast.error(`Payment failed: ${error}`);
						}}
						onCancel={() => {
							setShowPayment(false);
							setActiveStep(4); // Go back to review step
						}}
					/>
				) : (
					<Alert severity="info" sx={{ textAlign: "center", p: 3 }}>
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
		<Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
			{/* Enhanced Header */}
			<Box
				sx={{
					background: `linear-gradient(135deg, ${customColor}20, #3b82f640, #ec489940)`,
					borderRadius: 4,
					p: 5,
					mb: 4,
					position: "relative",
					overflow: "hidden",
					border: `3px solid ${customColor}`,
				}}
			>
				{/* Background Pattern */}
				<Box
					sx={{
						position: "absolute",
						top: -50,
						right: -50,
						width: 200,
						height: 200,
						borderRadius: "50%",
						background: `linear-gradient(45deg, ${customColor}30, #3b82f630)`,
						opacity: 0.3,
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						bottom: -30,
						left: -30,
						width: 150,
						height: 150,
						borderRadius: "50%",
						background: `linear-gradient(45deg, #ec489930, #f59e0b30)`,
						opacity: 0.3,
					}}
				/>

				<Box sx={{ position: "relative", zIndex: 2, textAlign: "center" }}>
					<Typography
						variant="h3"
						gutterBottom
						sx={{
							fontWeight: 800,
							color: customColor,
							textShadow: "0 2px 4px rgba(0,0,0,0.1)",
							mb: 2,
						}}
					>
						💝 Make a Donation
					</Typography>
					<Typography
						variant="h5"
						sx={{
							mb: 3,
							color: "#1a1a1a",
							fontWeight: 600,
							background: "rgba(255,255,255,0.9)",
							borderRadius: 2,
							px: 3,
							py: 1,
							display: "inline-block",
						}}
					>
						{cause?.cause?.title}
					</Typography>
					<Typography
						variant="h6"
						sx={{
							color: "#4a5568",
							fontWeight: 500,
							maxWidth: 600,
							mx: "auto",
							lineHeight: 1.6,
						}}
					>
						🌟 Your generosity creates real impact! Follow our simple steps to
						complete your donation and make a difference in someone's life.
					</Typography>
				</Box>
			</Box>

			{/* Enhanced Stepper */}
			<Card
				elevation={0}
				sx={{
					mb: 4,
					borderRadius: 4,
					border: `2px solid ${customColor}`,
					background: `linear-gradient(135deg, rgba(255,255,255,0.9), ${customColor}05)`,
					overflow: "hidden",
				}}
			>
				<CardContent sx={{ p: 4 }}>
					<Stepper
						activeStep={activeStep}
						alternativeLabel
						sx={{
							"& .MuiStepLabel-root .Mui-completed": {
								color: customColor,
							},
							"& .MuiStepLabel-root .Mui-active": {
								color: customColor,
							},
							"& .MuiStepConnector-line": {
								borderColor: "#e0e0e0",
							},
							"& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
								borderColor: customColor,
							},
							"& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
								borderColor: customColor,
							},
							"& .MuiStepIcon-root": {
								fontSize: "2rem",
							},
							"& .MuiStepIcon-root.Mui-completed": {
								color: customColor,
							},
							"& .MuiStepIcon-root.Mui-active": {
								color: customColor,
							},
							"& .MuiStepLabel-label": {
								fontWeight: 600,
								fontSize: "1rem",
							},
							"& .MuiStepLabel-label.Mui-active": {
								color: customColor,
								fontWeight: 700,
							},
							"& .MuiStepLabel-label.Mui-completed": {
								color: customColor,
								fontWeight: 600,
							},
						}}
					>
						{steps.map((label, index) => (
							<Step key={label}>
								<StepLabel>{label}</StepLabel>
							</Step>
						))}
					</Stepper>
				</CardContent>
			</Card>

			{/* Step Content */}
			<Box component="form" onSubmit={formik.handleSubmit}>
				{renderStepContent(activeStep)}

				{/* Debug info - remove in production */}
				{process.env.NODE_ENV === "development" && (
					<Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
						<Typography variant="caption" display="block">
							Debug: Current step: {activeStep}, Is Monetary:{" "}
							{isMonetary.toString()}
						</Typography>
						<Typography variant="caption" display="block">
							Form values: {JSON.stringify(formik.values, null, 2)}
						</Typography>
					</Box>
				)}

				{/* Navigation Buttons */}
				{activeStep !== 5 && ( // Hide navigation buttons on payment step
					<Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
						<Button
							onClick={handleBack}
							disabled={activeStep === 0}
							startIcon={<ArrowBack />}
							variant="outlined"
							size="large"
						>
							Back
						</Button>
						<Button
							type={
								(activeStep === steps.length - 2 && !isMonetary) || // Review step for item donations
								(isMonetary && activeStep === 4) // Review step for monetary donations
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
							size="large"
							disabled={isLoading}
							sx={{
								backgroundColor: customColor,
								"&:hover": {
									backgroundColor: `${customColor}dd`,
								},
								"&:disabled": {
									backgroundColor: `${customColor}66`,
								},
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
