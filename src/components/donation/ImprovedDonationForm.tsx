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
	const customColor = "#287068";

	const steps = ["Donation Type", "Details", "Delivery", "Contact", "Review"];

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

			// Final validation before submission
			if (isMonetary) {
				if (
					!values.amount ||
					!values.description ||
					!values.contactPhone ||
					!values.contactEmail
				) {
					toast.error("Please fill in all required fields");
					return;
				}
			} else {
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
						sx={{ border: "1px solid", borderColor: "divider" }}
					>
						<CardContent sx={{ p: 4 }}>
							<Box sx={{ textAlign: "center", mb: 4 }}>
								<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
									What would you like to donate?
								</Typography>
								<Typography variant="body1" color="text.secondary">
									Choose the type of donation you'd like to make
								</Typography>
							</Box>

							<FormControl component="fieldset" fullWidth>
								<RadioGroup
									value={isMonetary ? "MONEY" : "ITEMS"}
									onChange={handleDonationTypeChange}
								>
									<Grid container spacing={3}>
										<Grid item xs={12} md={6}>
											<Paper
												elevation={isMonetary ? 3 : 1}
												sx={{
													p: 3,
													cursor: "pointer",
													border: "2px solid",
													borderColor: isMonetary ? customColor : "transparent",
													bgcolor: isMonetary
														? `${customColor}15`
														: "background.paper",
													transition: "all 0.3s ease",
													"&:hover": {
														elevation: 3,
														borderColor: customColor,
													},
												}}
												onClick={() =>
													handleDonationTypeChange({
														target: { value: "MONEY" },
													})
												}
											>
												<Box sx={{ textAlign: "center" }}>
													<AttachMoney
														sx={{
															fontSize: 48,
															color: customColor,
															mb: 2,
														}}
													/>
													<FormControlLabel
														value="MONEY"
														control={<Radio />}
														label={
															<Box>
																<Typography
																	variant="h6"
																	sx={{ fontWeight: 600 }}
																>
																	Monetary Donation
																</Typography>
																<Typography
																	variant="body2"
																	color="text.secondary"
																>
																	Donate money to support this cause directly
																</Typography>
															</Box>
														}
														sx={{ m: 0 }}
													/>
												</Box>
											</Paper>
										</Grid>
										<Grid item xs={12} md={6}>
											<Paper
												elevation={!isMonetary ? 3 : 1}
												sx={{
													p: 3,
													cursor: "pointer",
													border: "2px solid",
													borderColor: !isMonetary
														? customColor
														: "transparent",
													bgcolor: !isMonetary
														? `${customColor}15`
														: "background.paper",
													transition: "all 0.3s ease",
													"&:hover": {
														elevation: 3,
														borderColor: customColor,
													},
												}}
												onClick={() =>
													handleDonationTypeChange({
														target: { value: "ITEMS" },
													})
												}
											>
												<Box sx={{ textAlign: "center" }}>
													<Inventory
														sx={{
															fontSize: 48,
															color: customColor,
															mb: 2,
														}}
													/>
													<FormControlLabel
														value="ITEMS"
														control={<Radio />}
														label={
															<Box>
																<Typography
																	variant="h6"
																	sx={{ fontWeight: 600 }}
																>
																	Item Donation
																</Typography>
																<Typography
																	variant="body2"
																	color="text.secondary"
																>
																	Donate physical items that this cause needs
																</Typography>
															</Box>
														}
														sx={{ m: 0 }}
													/>
												</Box>
											</Paper>
										</Grid>
									</Grid>
								</RadioGroup>
							</FormControl>
						</CardContent>
					</Card>
				);

			case 1:
				return (
					<Card
						elevation={0}
						sx={{ border: "1px solid", borderColor: "divider" }}
					>
						<CardContent sx={{ p: 4 }}>
							<Box sx={{ textAlign: "center", mb: 4 }}>
								<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
									Donation Details
								</Typography>
								<Typography variant="body1" color="text.secondary">
									Provide details about your donation
								</Typography>
							</Box>

							{isMonetary ? (
								<Box>
									<Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
										How much would you like to donate?
									</Typography>
									<Box
										sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}
									>
										{[10, 25, 50, 100, 250, 500].map((amount) => (
											<Chip
												key={amount}
												label={`$${amount}`}
												onClick={() => formik.setFieldValue("amount", amount)}
												sx={{
													px: 2,
													py: 3,
													fontSize: "1.1rem",
													fontWeight: 600,
													cursor: "pointer",
													backgroundColor:
														Number(formik.values.amount) === amount
															? customColor
															: "transparent",
													color:
														Number(formik.values.amount) === amount
															? "white"
															: customColor,
													border: `1px solid ${customColor}`,
													"&:hover": {
														backgroundColor: customColor,
														color: "white",
													},
												}}
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
												We'll collect the donation from your address
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
												You'll deliver to the organization's address
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
									We'll use this information to contact you about your donation
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

			default:
				return <Typography>Step content not implemented yet</Typography>;
		}
	};

	return (
		<Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
			{/* Header */}
			<Paper
				elevation={0}
				sx={{ p: 4, mb: 4, bgcolor: `${customColor}15`, borderRadius: 3 }}
			>
				<Typography
					variant="h4"
					gutterBottom
					sx={{ fontWeight: 700, color: customColor }}
				>
					Make a Donation
				</Typography>
				<Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
					{cause?.cause?.title}
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Your generosity makes a difference. Follow the simple steps below to
					complete your donation.
				</Typography>
			</Paper>

			{/* Stepper */}
			<Card elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
				<CardContent sx={{ p: 3 }}>
					<Stepper activeStep={activeStep} alternativeLabel>
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
							activeStep === steps.length - 1 ||
							(isMonetary && activeStep === 3)
								? "submit"
								: "button"
						}
						onClick={
							activeStep === steps.length - 1 ||
							(isMonetary && activeStep === 3)
								? undefined
								: handleNext
						}
						endIcon={
							activeStep === steps.length - 1 ||
							(isMonetary && activeStep === 3) ? (
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
						) : activeStep === steps.length - 1 ||
						  (isMonetary && activeStep === 3) ? (
							"Complete Donation"
						) : (
							"Next"
						)}
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default ImprovedDonationForm;
