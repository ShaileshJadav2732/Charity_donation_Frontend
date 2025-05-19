"use client";

import {
	Box,
	Button,
	MenuItem,
	TextField,
	Typography,
	FormControlLabel,
	Checkbox,
	FormControl,
	FormLabel,
	RadioGroup,
	Radio,
	Stack,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateDonationMutation } from "@/store/api/donationApi";
import toast from "react-hot-toast";
import { useGetCauseByIdQuery } from "@/store/api/causeApi";
import { useState } from "react";

export default function DonationForm() {
	const params = useParams();
	const causeId = params.id;
	const { data: cause, isLoading } = useGetCauseByIdQuery(causeId as string);
	const [createDonation, { isLoading: creating }] = useCreateDonationMutation();
	const [isMonetary, setIsMonetary] = useState(false);

	const formik = useFormik({
		initialValues: {
			type: isMonetary ? "MONEY" : "FOOD",
			amount: "",
			description: "",
			quantity: 1,
			unit: isMonetary ? "" : "kg",
			scheduledDate: "",
			scheduledTime: "",
			isPickup: true,
			contactPhone: "",
			contactEmail: "",
			pickupAddress: {
				street: "",
				city: "",
				state: "",
				zipCode: "",
				country: "",
			},
			status: "PENDING",
		},
		validationSchema: Yup.object({
			type: Yup.string().required("Donation type is required"),
			description: Yup.string().required("Description is required"),
			amount: Yup.number().when("type", {
				is: "MONEY",
				then: (schema) =>
					schema
						.min(1, "Amount must be at least 1")
						.required("Amount is required for monetary donations"),
				otherwise: (schema) => schema.notRequired(),
			}),
			quantity: Yup.number().when("type", {
				is: (val: string) => val !== "MONEY",
				then: (schema) =>
					schema
						.min(1, "Quantity must be at least 1")
						.required("Quantity is required for non-monetary donations"),
				otherwise: (schema) => schema.notRequired(),
			}),
			unit: Yup.string().when("type", {
				is: (val: string) => val !== "MONEY",
				then: (schema) =>
					schema.required("Unit is required for non-monetary donations"),
				otherwise: (schema) => schema.notRequired(),
			}),
			scheduledDate: Yup.string().when("type", {
				is: (val: string) => val !== "MONEY",
				then: (schema) =>
					schema.required(
						"Scheduled date is required for non-monetary donations"
					),
				otherwise: (schema) => schema.notRequired(),
			}),
			scheduledTime: Yup.string().when("type", {
				is: (val: string) => val !== "MONEY",
				then: (schema) =>
					schema.required(
						"Scheduled time is required for non-monetary donations"
					),
				otherwise: (schema) => schema.notRequired(),
			}),
			contactPhone: Yup.string().required("Phone number is required"),
			contactEmail: Yup.string()
				.email("Invalid email address")
				.required("Email is required"),
			pickupAddress: Yup.object().when("isPickup", {
				is: true,
				then: (schema) =>
					schema.shape({
						street: Yup.string().required("Street is required"),
						city: Yup.string().required("City is required"),
						state: Yup.string().required("State is required"),
						zipCode: Yup.string().required("Zip code is required"),
						country: Yup.string().required("Country is required"),
					}),
				otherwise: (schema) => schema.notRequired(),
			}),
		}),
		onSubmit: async (values) => {
			if (!cause || !causeId || typeof causeId !== "string") return;

			const payload = {
				...values,
				donor: "current_user",
				organization: cause.cause.organizationId,
				cause: causeId,
				amount: values.type === "MONEY" ? Number(values.amount) : undefined,
				quantity: values.type !== "MONEY" ? Number(values.quantity) : undefined,
				unit: values.type !== "MONEY" ? values.unit : undefined,
				scheduledDate:
					values.type !== "MONEY" ? values.scheduledDate : undefined,
				scheduledTime:
					values.type !== "MONEY" ? values.scheduledTime : undefined,
			};

			try {
				await createDonation(payload).unwrap();
				toast.success("Donation created successfully!");
				formik.resetForm();
			} catch (error: any) {
				toast.error(error?.data?.message || "Failed to create donation");
			}
		},
	});

	const handleDonationTypeChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = event.target.value === "MONEY";
		setIsMonetary(value);
		formik.setFieldValue("type", value ? "MONEY" : "FOOD");
		formik.setFieldValue("amount", "");
		formik.setFieldValue("quantity", 1);
		formik.setFieldValue("unit", value ? "" : "kg");
		formik.setFieldValue("scheduledDate", "");
		formik.setFieldValue("scheduledTime", "");
	};

	if (isLoading) return <Typography>Loading...</Typography>;

	return (
		<Box
			component="form"
			onSubmit={formik.handleSubmit}
			sx={{ maxWidth: 800, mx: "auto", p: 3 }}
		>
			<Typography variant="h5" gutterBottom>
				Donate to: {cause?.cause.title}
			</Typography>

			<Stack spacing={2}>
				<Box>
					<FormControl component="fieldset">
						<FormLabel component="legend">Donation Category</FormLabel>
						<RadioGroup
							row
							name="donationCategory"
							value={isMonetary ? "MONEY" : "NON_MONETARY"}
							onChange={handleDonationTypeChange}
						>
							<FormControlLabel
								value="MONEY"
								control={<Radio />}
								label="Monetary"
							/>
							<FormControlLabel
								value="NON_MONETARY"
								control={<Radio />}
								label="Non-Monetary"
							/>
						</RadioGroup>
					</FormControl>
				</Box>

				{isMonetary ? (
					<TextField
						fullWidth
						label="Amount ($)"
						name="amount"
						type="number"
						value={formik.values.amount}
						onChange={formik.handleChange}
						error={formik.touched.amount && Boolean(formik.errors.amount)}
						helperText={formik.touched.amount && formik.errors.amount}
					/>
				) : (
					<>
						<Box sx={{ display: "flex", gap: 2 }}>
							<TextField
								select
								fullWidth
								label="Donation Type"
								name="type"
								value={formik.values.type}
								onChange={formik.handleChange}
								error={formik.touched.type && Boolean(formik.errors.type)}
								helperText={formik.touched.type && formik.errors.type}
							>
								{[
									"FOOD",
									"CLOTHES",
									"BOOKS",
									"TOYS",
									"FURNITURE",
									"HOUSEHOLD",
									"OTHER",
								].map((type) => (
									<MenuItem key={type} value={type}>
										{type}
									</MenuItem>
								))}
							</TextField>

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
						</Box>

						<Box sx={{ display: "flex", gap: 2 }}>
							<TextField
								fullWidth
								label="Unit (e.g., kg, items)"
								name="unit"
								value={formik.values.unit}
								onChange={formik.handleChange}
								error={formik.touched.unit && Boolean(formik.errors.unit)}
								helperText={formik.touched.unit && formik.errors.unit}
							/>

							<TextField
								fullWidth
								type="date"
								name="scheduledDate"
								label="Pickup/Drop Date"
								InputLabelProps={{ shrink: true }}
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
						</Box>

						<TextField
							fullWidth
							type="time"
							name="scheduledTime"
							label="Pickup/Drop Time"
							InputLabelProps={{ shrink: true }}
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
					</>
				)}

				<TextField
					fullWidth
					label="Description"
					name="description"
					multiline
					rows={3}
					value={formik.values.description}
					onChange={formik.handleChange}
					error={
						formik.touched.description && Boolean(formik.errors.description)
					}
					helperText={formik.touched.description && formik.errors.description}
				/>

				{!isMonetary && (
					<FormControlLabel
						control={
							<Checkbox
								name="isPickup"
								checked={formik.values.isPickup}
								onChange={formik.handleChange}
							/>
						}
						label="I want pickup service"
					/>
				)}

				<TextField
					fullWidth
					label="Phone"
					name="contactPhone"
					value={formik.values.contactPhone}
					onChange={formik.handleChange}
					error={
						formik.touched.contactPhone && Boolean(formik.errors.contactPhone)
					}
					helperText={formik.touched.contactPhone && formik.errors.contactPhone}
				/>

				<TextField
					fullWidth
					label="Email"
					name="contactEmail"
					value={formik.values.contactEmail}
					onChange={formik.handleChange}
					error={
						formik.touched.contactEmail && Boolean(formik.errors.contactEmail)
					}
					helperText={formik.touched.contactEmail && formik.errors.contactEmail}
				/>

				{formik.values.isPickup && !isMonetary && (
					<>
						<Typography variant="h6">Pickup Address</Typography>
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
							{["street", "city", "state", "zipCode", "country"].map(
								(field) => (
									<Box
										key={field}
										sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "240px" }}
									>
										<TextField
											fullWidth
											label={field.charAt(0).toUpperCase() + field.slice(1)}
											name={`pickupAddress.${field}`}
											value={
												formik.values.pickupAddress[
													field as keyof typeof formik.values.pickupAddress
												]
											}
											onChange={formik.handleChange}
											error={
												formik.touched.pickupAddress?.[
													field as keyof typeof formik.values.pickupAddress
												] &&
												Boolean(
													formik.errors.pickupAddress?.[
														field as keyof typeof formik.values.pickupAddress
													]
												)
											}
											helperText={
												formik.touched.pickupAddress?.[
													field as keyof typeof formik.values.pickupAddress
												] &&
												formik.errors.pickupAddress?.[
													field as keyof typeof formik.values.pickupAddress
												]
											}
										/>
									</Box>
								)
							)}
						</Box>
					</>
				)}

				<Box>
					<Button
						type="submit"
						variant="contained"
						disabled={creating}
						sx={{ mt: 2 }}
					>
						{creating ? "Submitting..." : "Donate Now"}
					</Button>
				</Box>
			</Stack>
		</Box>
	);
}
