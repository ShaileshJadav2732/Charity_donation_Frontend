"use client";

import { DonationType } from "@/types/donation";
import {
	CauseWithDetails,
	FormSubmissionHandler,
	DonationFormValues,
	SelectChangeEvent,
} from "@/types/forms";
import { CheckCircle, Home, LocalShipping } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Select,
	TextField,
	Typography,
	MenuItem,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import VoiceToDonateButton from "./VoiceToDonateButton";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface ImprovedDonationFormProps {
	cause: CauseWithDetails;
	onSubmit: FormSubmissionHandler<DonationFormValues>;
	onPaymentSubmit: FormSubmissionHandler<DonationFormValues>;
	isLoading?: boolean;
}

const ImprovedDonationForm: React.FC<ImprovedDonationFormProps> = ({
	cause,
	onSubmit,
	onPaymentSubmit,
	isLoading = false,
}) => {
	const [isMonetary, setIsMonetary] = useState(false);
	const customColor = "#287068";

	// Get user role to show voice feature only for donors
	const { user } = useSelector((state: RootState) => state.auth);
	const isDonor = user?.role === "donor";

	// Get accepted donation types from cause
	const acceptedDonationTypes = cause?.cause?.acceptedDonationTypes || [
		DonationType.MONEY,
	];
	const acceptanceType = cause?.cause?.acceptanceType || "money";
	const canDonateMoney =
		acceptanceType === "money" || acceptanceType === "both";
	const canDonateItems =
		acceptanceType === "items" || acceptanceType === "both";
	const availableItemTypes = [...new Set(acceptedDonationTypes)].filter(
		(type: DonationType) => type !== DonationType.MONEY
	);

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
			// Validation for monetary donations
			if (isMonetary) {
				if (
					!values.amount ||
					Number(values.amount) < 10 ||
					!values.description ||
					!values.contactPhone ||
					!values.contactEmail
				) {
					if (Number(values.amount) < 10) {
						toast.error("Minimum donation amount is ₹10");
					} else {
						toast.error("Please fill in all required fields");
					}
					return;
				}
				// Call the payment submission handler for monetary donations
				try {
					await onPaymentSubmit(values);
				} catch {
					// Error handling is done in the parent component
				}
				return;
			}

			// Validation for item donations
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
				// Call the regular submission handler for item donations
				try {
					await onSubmit(values);
				} catch {
					// Error handling is done in the parent component
				}
			}
		},
	});

	const handleDonationTypeChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
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

	// Handle voice command - Fill COMPLETE form with ALL extracted data
	const handleVoiceCommand = (command: any) => {
		console.log("Voice command received:", command);

		// Get current user info as fallback
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

		// Generate default scheduling (tomorrow at 10 AM) if not provided
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const defaultDate = tomorrow.toISOString().split("T")[0];
		const defaultTime = "10:00";

		if (command.type === "MONEY" && command.amount) {
			// Set monetary donation
			setIsMonetary(true);

			formik.setFieldValue("type", DonationType.MONEY);
			formik.setFieldValue("amount", command.amount.toString());
			formik.setFieldValue(
				"description",
				command.description || `Voice donation of ₹${command.amount}`
			);

			formik.setFieldValue("quantity", 1);
			formik.setFieldValue("unit", "kg");
			formik.setFieldValue("isPickup", false);

			formik.setFieldValue(
				"contactPhone",
				command.contactPhone || currentUser.phone || ""
			);
			formik.setFieldValue(
				"contactEmail",
				command.contactEmail || currentUser.email || ""
			);

			if (command.address) {
				formik.setFieldValue(
					"pickupAddress.street",
					command.address.street || ""
				);
				formik.setFieldValue("pickupAddress.city", command.address.city || "");
				formik.setFieldValue(
					"pickupAddress.state",
					command.address.state || ""
				);
				formik.setFieldValue(
					"pickupAddress.zipCode",
					command.address.zipCode || ""
				);
				formik.setFieldValue(
					"pickupAddress.country",
					command.address.country || "India"
				);
			} else if (currentUser.address) {
				// Fallback to user's saved address
				formik.setFieldValue(
					"pickupAddress.street",
					currentUser.address.street || ""
				);
				formik.setFieldValue(
					"pickupAddress.city",
					currentUser.address.city || ""
				);
				formik.setFieldValue(
					"pickupAddress.state",
					currentUser.address.state || ""
				);
				formik.setFieldValue(
					"pickupAddress.zipCode",
					currentUser.address.zipCode || ""
				);
				formik.setFieldValue(
					"pickupAddress.country",
					currentUser.address.country || "India"
				);
			}

			// Clear scheduling (not needed for money)
			formik.setFieldValue("scheduledDate", "");
			formik.setFieldValue("scheduledTime", "");

			// Create success message with filled fields
			const filledFields = [];
			if (command.contactPhone) filledFields.push("phone");
			if (command.contactEmail) filledFields.push("email");
			if (command.address) filledFields.push("address");

			const fieldsText =
				filledFields.length > 0
					? ` with ${filledFields.join(", ")}`
					: " with contact info";

			toast.success(
				`Complete form filled: ₹${command.amount} donation${fieldsText}!`
			);
		} else if (command.type === "ITEMS") {
			setIsMonetary(false);

			const upperItemType = command.itemType?.toUpperCase() || "";
			const itemType =
				Object.entries(DonationType).find(([key]) =>
					upperItemType.includes(key)
				)?.[1] ||
				availableItemTypes[0] ||
				DonationType.OTHER;

			// Basic fields
			formik.setFieldValue("type", itemType);
			formik.setFieldValue("quantity", command.quantity || 1);
			formik.setFieldValue("unit", command.unit || "items");
			formik.setFieldValue(
				"description",
				command.description ||
					`Voice donation: ${command.quantity || 1} ${
						command.unit || "items"
					} of ${command.itemType || "items"}`
			);
			formik.setFieldValue("isPickup", command.isPickup ?? true);
			formik.setFieldValue(
				"scheduledDate",
				command.scheduledDate || defaultDate
			);
			formik.setFieldValue(
				"scheduledTime",
				command.scheduledTime || defaultTime
			);
			formik.setFieldValue(
				"contactPhone",
				command.contactPhone || currentUser.phone || ""
			);
			formik.setFieldValue(
				"contactEmail",
				command.contactEmail || currentUser.email || ""
			);

			// Address
			const address = command.address || currentUser.address || {};
			["street", "city", "state", "zipCode", "country"].forEach((field) =>
				formik.setFieldValue(
					`pickupAddress.${field}`,
					address[field] || (field === "country" ? "India" : "")
				)
			);

			// Clear monetary field
			formik.setFieldValue("amount", "");

			// Toast message
			const filledFields = [
				command.contactPhone && "phone",
				command.contactEmail && "email",
				command.address && "address",
				command.scheduledDate && "schedule",
			].filter(Boolean);
			const deliveryMethod = command.isPickup !== false ? "pickup" : "delivery";
			toast.success(
				`✅ Complete form filled: ${command.quantity || 1} ${
					command.unit || "items"
				} of ${command.itemType || "items"} for ${deliveryMethod}${
					filledFields.length ? ` with ${filledFields.join(", ")}` : ""
				}!`
			);
		}

		// Mark fields as touched to show they're filled
		formik.setFieldTouched("type", true);
		formik.setFieldTouched("amount", true);
		formik.setFieldTouched("description", true);
		formik.setFieldTouched("contactPhone", true);
		formik.setFieldTouched("contactEmail", true);
		if (!isMonetary) {
			formik.setFieldTouched("scheduledDate", true);
			formik.setFieldTouched("scheduledTime", true);
		}
	};

	return (
		<Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 2, md: 3 } }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Box>
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
				{isDonor && (
					<VoiceToDonateButton
						onVoiceCommand={handleVoiceCommand}
						disabled={isLoading}
					/>
				)}
			</Box>

			<Box component="form" onSubmit={formik.handleSubmit}>
				{/* Donation Type */}
				<Box
					sx={{
						mb: 3,
						p: 3,
						border: `1px solid ${customColor}`,
						borderRadius: 2,
					}}
				>
					<Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
						Donation Type
					</Typography>
					<FormControl component="fieldset" fullWidth>
						<RadioGroup
							value={isMonetary ? "MONEY" : "ITEMS"}
							onChange={handleDonationTypeChange}
						>
							<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
								{canDonateMoney && (
									<FormControlLabel
										value="MONEY"
										control={<Radio sx={{ color: customColor }} />}
										label={
											<Box>
												<Typography variant="h6" sx={{ fontWeight: 600 }}>
													Monetary Donation
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Make a secure online donation.
												</Typography>
											</Box>
										}
										sx={{
											p: 2,
											border: `1px solid ${
												isMonetary ? customColor : "#e0e0e0"
											}`,
											borderRadius: 2,
										}}
									/>
								)}
								{canDonateItems && (
									<FormControlLabel
										value="ITEMS"
										control={<Radio sx={{ color: customColor }} />}
										label={
											<Box>
												<Typography variant="h6" sx={{ fontWeight: 600 }}>
													Item Donation
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Donate items:{" "}
													{availableItemTypes.join(", ").toLowerCase()}
												</Typography>
											</Box>
										}
										sx={{
											p: 2,
											border: `1px solid ${
												!isMonetary ? customColor : "#e0e0e0"
											}`,
											borderRadius: 2,
										}}
									/>
								)}
								{!canDonateMoney && !canDonateItems && (
									<Alert severity="warning">
										This cause is not currently accepting donations.
									</Alert>
								)}
							</Box>
						</RadioGroup>
					</FormControl>
				</Box>

				{/* Donation Details */}
				<Box
					sx={{
						mb: 3,
						p: 3,
						border: `1px solid ${customColor}`,
						borderRadius: 2,
					}}
				>
					<Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
						{isMonetary ? "Donation Amount" : "Item Details"}
					</Typography>
					{isMonetary ? (
						<>
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
								{[50, 100, 250, 500, 1000, 2500].map((amount) => (
									<Chip
										key={amount}
										label={`₹${amount}`}
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
								label="Custom Amount (₹)"
								name="amount"
								type="number"
								value={formik.values.amount}
								onChange={formik.handleChange}
								helperText={
									(formik.touched.amount && formik.errors.amount) ||
									(formik.values.amount && Number(formik.values.amount) < 50
										? "Minimum amount is ₹50"
										: "")
								}
								slotProps={{ htmlInput: { min: 50 } }}
								sx={{ mb: 3 }}
							/>
						</>
					) : (
						<>
							<Box
								sx={{
									display: "flex",
									gap: 2,
									flexDirection: { xs: "column", md: "row" },
									mb: 3,
								}}
							>
								<TextField
									fullWidth
									label="Quantity"
									name="quantity"
									type="number"
									value={formik.values.quantity}
									onChange={formik.handleChange}
									error={
										formik.touched.quantity && Boolean(formik.errors.quantity)
									}
									helperText={formik.touched.quantity && formik.errors.quantity}
								/>
								<TextField
									fullWidth
									label="Unit (e.g., kg, items, boxes)"
									name="unit"
									value={formik.values.unit}
									onChange={formik.handleChange}
									error={formik.touched.unit && Boolean(formik.errors.unit)}
									helperText={formik.touched.unit && formik.errors.unit}
								/>
							</Box>
							{availableItemTypes.length > 1 && (
								<Box sx={{ mb: 3 }}>
									<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
										Item Type
									</Typography>
									<FormControl fullWidth>
										<Select
											value={formik.values.type}
											onChange={(e: SelectChangeEvent) =>
												formik.setFieldValue("type", e.target.value)
											}
											displayEmpty
										>
											{availableItemTypes.map((type: DonationType) => (
												<MenuItem key={type} value={type}>
													{type.charAt(0) + type.slice(1).toLowerCase()}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Box>
							)}
						</>
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
							formik.touched.description && Boolean(formik.errors.description)
						}
						helperText={formik.touched.description && formik.errors.description}
					/>
				</Box>

				{/* Delivery Method */}
				{!isMonetary && (
					<Box
						sx={{
							mb: 3,
							p: 3,
							border: `1px solid ${customColor}`,
							borderRadius: 2,
						}}
					>
						<Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
							Delivery Method
						</Typography>
						<Box
							sx={{
								display: "flex",
								gap: 2,
								flexDirection: { xs: "column", md: "row" },
								mb: 3,
							}}
						>
							<Box
								sx={{
									flex: 1,
									p: 3,
									border: `1px solid ${
										formik.values.isPickup ? customColor : "#e0e0e0"
									}`,
									borderRadius: 2,
									cursor: "pointer",
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
							</Box>
							<Box
								sx={{
									flex: 1,
									p: 3,
									border: `1px solid ${
										!formik.values.isPickup ? customColor : "#e0e0e0"
									}`,
									borderRadius: 2,
									cursor: "pointer",
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
							</Box>
						</Box>
						<Box
							sx={{
								display: "flex",
								gap: 2,
								flexDirection: { xs: "column", md: "row" },
								mb: 3,
							}}
						>
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
									formik.touched.scheduledDate && formik.errors.scheduledDate
								}
							/>
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
									formik.touched.scheduledTime && formik.errors.scheduledTime
								}
							/>
						</Box>
					</Box>
				)}

				{/* Contact Information */}
				<Box
					sx={{
						mb: 3,
						p: 3,
						border: `1px solid ${customColor}`,
						borderRadius: 2,
					}}
				>
					<Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
						Contact Information
					</Typography>
					<Box
						sx={{
							display: "flex",
							gap: 2,
							flexDirection: { xs: "column", md: "row" },
							mb: 3,
						}}
					>
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
					{!isMonetary && formik.values.isPickup && (
						<Box>
							<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
								Pickup Address
							</Typography>
							<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
								<TextField
									fullWidth
									label="Street Address"
									name="pickupAddress.street"
									value={formik.values.pickupAddress.street}
									onChange={formik.handleChange}
								/>
								<Box
									sx={{
										display: "flex",
										gap: 2,
										flexDirection: { xs: "column", md: "row" },
									}}
								>
									<TextField
										fullWidth
										label="City"
										name="pickupAddress.city"
										value={formik.values.pickupAddress.city}
										onChange={formik.handleChange}
									/>
									<TextField
										fullWidth
										label="State"
										name="pickupAddress.state"
										value={formik.values.pickupAddress.state}
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
									<TextField
										fullWidth
										label="ZIP Code"
										name="pickupAddress.zipCode"
										value={formik.values.pickupAddress.zipCode}
										onChange={formik.handleChange}
									/>
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
					)}
				</Box>

				{/* Submit Button */}
				<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
					<Button
						type="submit" // Changed back to submit
						endIcon={<CheckCircle />}
						variant="contained"
						disabled={isLoading}
						sx={{
							backgroundColor: customColor,
							"&:hover": { backgroundColor: `${customColor}cc` },
						}}
					>
						{isLoading ? (
							<CircularProgress size={20} color="inherit" />
						) : isMonetary ? (
							"Make Payment"
						) : (
							"Complete Donation"
						)}
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default ImprovedDonationForm;
