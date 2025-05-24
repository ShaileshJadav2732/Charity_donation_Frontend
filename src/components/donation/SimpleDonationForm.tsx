"use client";

import {
	Box,
	Button,
	Card,
	CardContent,
	TextField,
	Typography,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Stack,
	Chip,
	CircularProgress,
	Alert,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { AttachMoney, Inventory } from "@mui/icons-material";

interface SimpleDonationFormProps {
	cause: any;
	onSubmit: (values: any) => Promise<void>;
	isLoading?: boolean;
}

const SimpleDonationForm: React.FC<SimpleDonationFormProps> = ({
	cause,
	onSubmit,
	isLoading = false,
}) => {
	const [donationType, setDonationType] = useState<"MONEY" | "ITEMS">("MONEY");
	const customColor = "#2f8077";

	const formik = useFormik({
		initialValues: {
			type: "MONEY",
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
		validationSchema: Yup.object({
			amount: donationType === "MONEY"
				? Yup.number()
						.required("Amount is required")
						.min(1, "Amount must be at least $1")
				: Yup.number(),
			description: Yup.string()
				.required("Description is required")
				.min(10, "Please provide more details"),
			quantity: donationType === "ITEMS"
				? Yup.number()
						.required("Quantity is required")
						.min(1, "Quantity must be at least 1")
				: Yup.number(),
			unit: donationType === "ITEMS"
				? Yup.string().required("Unit is required")
				: Yup.string(),
			scheduledDate: donationType === "ITEMS"
				? Yup.string().required("Scheduled date is required")
				: Yup.string(),
			scheduledTime: donationType === "ITEMS"
				? Yup.string().required("Scheduled time is required")
				: Yup.string(),
			contactPhone: Yup.string().required("Phone number is required"),
			contactEmail: Yup.string()
				.email("Invalid email")
				.required("Email is required"),
		}),
		onSubmit: async (values) => {
			try {
				await onSubmit(values);
			} catch (error) {
				console.error("Error in form submission:", error);
			}
		},
	});

	const handleDonationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value as "MONEY" | "ITEMS";
		setDonationType(value);
		formik.setFieldValue("type", value === "MONEY" ? "MONEY" : "FOOD");
		formik.setFieldValue("isPickup", value === "ITEMS");
	};

	return (
		<Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
			{/* Header */}
			<Card elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
				<CardContent sx={{ p: 4, textAlign: "center" }}>
					<Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: customColor }}>
						Make a Donation
					</Typography>
					<Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
						{cause?.cause?.title || "Support this cause"}
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Your contribution will make a real difference in the lives of those in need.
					</Typography>
				</CardContent>
			</Card>

			{/* Main Form */}
			<Card elevation={2} sx={{ borderRadius: 3 }}>
				<CardContent sx={{ p: 4 }}>
					<Box component="form" onSubmit={formik.handleSubmit}>
						{/* Donation Type Selection */}
						<Box sx={{ mb: 4 }}>
							<Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: customColor }}>
								What would you like to donate?
							</Typography>
							<FormControl component="fieldset" fullWidth>
								<RadioGroup
									value={donationType}
									onChange={handleDonationTypeChange}
									sx={{ gap: 2 }}
								>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<Card
											elevation={donationType === "MONEY" ? 3 : 1}
											sx={{
												flex: 1,
												minWidth: 250,
												cursor: "pointer",
												border: "2px solid",
												borderColor: donationType === "MONEY" ? customColor : "transparent",
												bgcolor: donationType === "MONEY" ? `${customColor}15` : "background.paper",
												transition: "all 0.3s ease",
												"&:hover": { elevation: 3, borderColor: customColor },
											}}
											onClick={() => handleDonationTypeChange({ target: { value: "MONEY" } } as any)}
										>
											<CardContent sx={{ textAlign: "center", p: 3 }}>
												<AttachMoney sx={{ fontSize: 48, color: customColor, mb: 2 }} />
												<FormControlLabel
													value="MONEY"
													control={<Radio sx={{ color: customColor, "&.Mui-checked": { color: customColor } }} />}
													label={
														<Box>
															<Typography variant="h6" sx={{ fontWeight: 600 }}>
																Monetary Donation
															</Typography>
															<Typography variant="body2" color="text.secondary">
																Donate money to support this cause directly
															</Typography>
														</Box>
													}
													sx={{ m: 0 }}
												/>
											</CardContent>
										</Card>

										<Card
											elevation={donationType === "ITEMS" ? 3 : 1}
											sx={{
												flex: 1,
												minWidth: 250,
												cursor: "pointer",
												border: "2px solid",
												borderColor: donationType === "ITEMS" ? customColor : "transparent",
												bgcolor: donationType === "ITEMS" ? `${customColor}15` : "background.paper",
												transition: "all 0.3s ease",
												"&:hover": { elevation: 3, borderColor: customColor },
											}}
											onClick={() => handleDonationTypeChange({ target: { value: "ITEMS" } } as any)}
										>
											<CardContent sx={{ textAlign: "center", p: 3 }}>
												<Inventory sx={{ fontSize: 48, color: customColor, mb: 2 }} />
												<FormControlLabel
													value="ITEMS"
													control={<Radio sx={{ color: customColor, "&.Mui-checked": { color: customColor } }} />}
													label={
														<Box>
															<Typography variant="h6" sx={{ fontWeight: 600 }}>
																Item Donation
															</Typography>
															<Typography variant="body2" color="text.secondary">
																Donate physical items that this cause needs
															</Typography>
														</Box>
													}
													sx={{ m: 0 }}
												/>
											</CardContent>
										</Card>
									</Box>
								</RadioGroup>
							</FormControl>
						</Box>

						{/* Donation Details */}
						<Box sx={{ mb: 4 }}>
							<Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: customColor }}>
								Donation Details
							</Typography>

							{donationType === "MONEY" ? (
								<Box>
									<Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
										How much would you like to donate?
									</Typography>
									<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
										{[10, 25, 50, 100, 250, 500].map((amount) => (
											<Chip
												key={amount}
												label={`$${amount}`}
												onClick={() => formik.setFieldValue("amount", amount)}
												sx={{
													px: 2,
													py: 1,
													fontSize: "1rem",
													fontWeight: 600,
													cursor: "pointer",
													backgroundColor: Number(formik.values.amount) === amount ? customColor : "transparent",
													color: Number(formik.values.amount) === amount ? "white" : customColor,
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
										error={formik.touched.amount && Boolean(formik.errors.amount)}
										helperText={formik.touched.amount && formik.errors.amount}
										sx={{ 
											mb: 3,
											"& .MuiOutlinedInput-root": {
												"&:hover .MuiOutlinedInput-notchedOutline": {
													borderColor: customColor,
												},
												"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
													borderColor: customColor,
												},
											},
											"& .MuiInputLabel-root.Mui-focused": {
												color: customColor,
											},
										}}
									/>
								</Box>
							) : (
								<Stack spacing={3}>
									<Box sx={{ display: "flex", gap: 2 }}>
										<TextField
											label="Quantity"
											name="quantity"
											type="number"
											value={formik.values.quantity}
											onChange={formik.handleChange}
											error={formik.touched.quantity && Boolean(formik.errors.quantity)}
											helperText={formik.touched.quantity && formik.errors.quantity}
											sx={{ 
												flex: 1,
												"& .MuiOutlinedInput-root": {
													"&:hover .MuiOutlinedInput-notchedOutline": {
														borderColor: customColor,
													},
													"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
														borderColor: customColor,
													},
												},
												"& .MuiInputLabel-root.Mui-focused": {
													color: customColor,
												},
											}}
										/>
										<TextField
											label="Unit (e.g., kg, items, boxes)"
											name="unit"
											value={formik.values.unit}
											onChange={formik.handleChange}
											error={formik.touched.unit && Boolean(formik.errors.unit)}
											helperText={formik.touched.unit && formik.errors.unit}
											sx={{ 
												flex: 1,
												"& .MuiOutlinedInput-root": {
													"&:hover .MuiOutlinedInput-notchedOutline": {
														borderColor: customColor,
													},
													"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
														borderColor: customColor,
													},
												},
												"& .MuiInputLabel-root.Mui-focused": {
													color: customColor,
												},
											}}
										/>
									</Box>
