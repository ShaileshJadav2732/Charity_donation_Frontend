"use client";

import {
	Box,
	Button,
	MenuItem,
	TextField,
	Typography,
	FormControlLabel,
	FormControl,
	FormLabel,
	RadioGroup,
	Radio,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Chip,
	CircularProgress,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateDonationMutation } from "@/store/api/donationApi";
import toast from "react-hot-toast";
import { useGetCauseByIdQuery } from "@/store/api/causeApi";
import React, { useState } from "react";
import { LocalShipping, Home } from "@mui/icons-material";
import { DonationType } from "@/types/donation";

export default function DonationForm() {
	const params = useParams();
	const causeId = params.id;
	const { data: cause, isLoading } = useGetCauseByIdQuery(causeId as string);
	const [createDonation, { isLoading: creating }] = useCreateDonationMutation();
	const [isMonetary, setIsMonetary] = useState(false);
	const [availableDonationTypes, setAvailableDonationTypes] = useState<string[]>([]);
	// We'll use formik.values.isPickup instead of a separate state

	const formik = useFormik({
		initialValues: {
			type: isMonetary ? "MONEY" : availableDonationTypes[0] || "FOOD",
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
			dropoffAddress: {
				street: "",
				city: "",
				state: "",
				zipCode: "",
				country: "",
			},
			status: "PENDING",
		},
		validationSchema: Yup.object({
			type: Yup.string()
				.required("Donation type is required")
				.test(
					'is-valid-donation-type',
					'Selected donation type is not accepted for this cause',
					function (value) {
						// For monetary donations, always allow MONEY type
						if (value === "MONEY" && isMonetary) {
							return true;
						}

						// For non-monetary donations, check if the type is in the available types
						if (value !== "MONEY" && !isMonetary) {
							// If no available types, allow OTHER
							if (availableDonationTypes.length === 0) {
								return value === "OTHER";
							}
							// Otherwise check if the type is in the available types
							return availableDonationTypes.includes(value);
						}

						return false;
					}
				),
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
			// We don't need to validate dropoffAddress since we'll use the organization's address
			dropoffAddress: Yup.object().notRequired(),
		}),
		onSubmit: async (values) => {
			if (!cause || !causeId || typeof causeId !== "string") return;

			// Additional validation to ensure donation type is valid
			const causeData = cause.cause as any;
			const isValidType = values.type === "MONEY" ?
				(causeData.acceptanceType === 'money' || causeData.acceptanceType === 'both') :
				(causeData.acceptanceType === 'items' || causeData.acceptanceType === 'both');

			if (!isValidType) {
				toast.error(`This cause does not accept ${values.type === "MONEY" ? "monetary" : "item"} donations.`);
				return;
			}

			// For non-monetary donations, validate that the type is in the accepted types
			if (values.type !== "MONEY") {
				const availableTypes = getAvailableItemTypes(causeData);
				if (availableTypes.length > 0 && !availableTypes.includes(values.type)) {
					toast.error(`This cause does not accept ${values.type} donations.`);
					return;
				}
			}

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
				// Include the pickup address only if pickup is selected
				// For dropoff, we don't need to include an address as the organization's address will be used
				pickupAddress: values.isPickup ? values.pickupAddress : undefined,
				// For dropoff, we'll use an empty object to indicate using organization address
				dropoffAddress: !values.isPickup ? {
					street: "ORGANIZATION_ADDRESS",
					city: "",
					state: "",
					zipCode: "",
					country: ""
				} : undefined,
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

		// Set appropriate donation type based on selection
		if (value) {
			// For monetary donations, always use MONEY type
			formik.setFieldValue("type", "MONEY");
		} else {
			// For non-monetary donations, use the first available type
			// Only if we have available types
			if (availableDonationTypes.length > 0) {
				formik.setFieldValue("type", availableDonationTypes[0]);
			}
			// We don't need an else case here because the availableDonationTypes
			// will always have at least one item (either a valid type or "OTHER")
			// as set in the useEffect
		}

		// Reset form fields based on donation type
		formik.setFieldValue("amount", value ? "" : undefined);
		formik.setFieldValue("quantity", value ? undefined : 1);
		formik.setFieldValue("unit", value ? undefined : "kg");
		formik.setFieldValue("scheduledDate", value ? undefined : "");
		formik.setFieldValue("scheduledTime", value ? undefined : "");
	};

	// Handler for delivery method toggle
	const handleDeliveryMethodChange = (
		_: React.MouseEvent<HTMLElement>,
		newDeliveryMethod: 'pickup' | 'dropoff' | null
	) => {
		// Only update if a valid value is selected (not null)
		if (newDeliveryMethod !== null) {
			// Update the isPickup value in the form
			formik.setFieldValue("isPickup", newDeliveryMethod === 'pickup');

			// When dropoff is selected, we don't need to collect the dropoff address
			// as we'll use the organization's address
			if (newDeliveryMethod === 'dropoff') {
				// Reset the dropoff address fields as they won't be used
				formik.setFieldValue("dropoffAddress", {
					street: "",
					city: "",
					state: "",
					zipCode: "",
					country: "",
				});
			}
		}
	};

	// Set up donation options based on cause's acceptance type
	React.useEffect(() => {
		if (cause?.cause) {
			// Cast cause to any to access the properties we know exist
			const causeData = cause.cause as any;

			// Determine available donation types based on cause settings
			if (causeData.acceptanceType === 'money') {
				// For money-only causes
				setIsMonetary(true);
				formik.setFieldValue("type", "MONEY");
				setAvailableDonationTypes([]);
			} else if (causeData.acceptanceType === 'items') {
				// For item-only causes
				setIsMonetary(false);

				// Get available donation types for this cause
				let availableTypes: string[] = [];

				// First check if the cause has acceptedDonationTypes defined
				if (causeData.acceptedDonationTypes && causeData.acceptedDonationTypes.length > 0) {
					// Use the predefined accepted donation types, excluding MONEY
					availableTypes = causeData.acceptedDonationTypes.filter(
						(type: string) => type !== "MONEY"
					);
				} else if (causeData.donationItems && causeData.donationItems.length > 0) {
					// If no acceptedDonationTypes but has donationItems, map them to types
					availableTypes = mapDonationItemsToTypes(causeData.donationItems);
				}

				// If no types are available after all checks, only then use OTHER
				if (availableTypes.length === 0) {
					availableTypes = ["OTHER"];
				}

				// Set available types
				setAvailableDonationTypes(availableTypes);

				// Set initial type to first available item type
				if (availableTypes.length > 0) {
					formik.setFieldValue("type", availableTypes[0]);
				}
			} else {
				// For 'both' type causes (accepting money and items)
				// Default to monetary donation initially
				setIsMonetary(true);
				formik.setFieldValue("type", "MONEY");

				// Get available item types for when user switches to item donation
				let availableTypes: string[] = [];

				// First check if the cause has acceptedDonationTypes defined
				if (causeData.acceptedDonationTypes && causeData.acceptedDonationTypes.length > 0) {
					// Use the predefined accepted donation types, excluding MONEY
					availableTypes = causeData.acceptedDonationTypes.filter(
						(type: string) => type !== "MONEY"
					);
				} else if (causeData.donationItems && causeData.donationItems.length > 0) {
					// If no acceptedDonationTypes but has donationItems, map them to types
					availableTypes = mapDonationItemsToTypes(causeData.donationItems);
				}

				// If no types are available after all checks, only then use OTHER
				if (availableTypes.length === 0) {
					availableTypes = ["OTHER"];
				}

				// Set available types
				setAvailableDonationTypes(availableTypes);
			}
		}
	}, [cause]);

	// Helper function to get available item types from a cause
	const getAvailableItemTypes = (cause: any): string[] => {
		let availableTypes: string[] = [];

		if (cause.acceptedDonationTypes && cause.acceptedDonationTypes.length > 0) {
			// Use the predefined accepted donation types, excluding MONEY
			availableTypes = cause.acceptedDonationTypes.filter((type: string) => type !== "MONEY");
		} else if (cause.donationItems && cause.donationItems.length > 0) {
			// If no acceptedDonationTypes but has donationItems, map them to types
			availableTypes = mapDonationItemsToTypes(cause.donationItems);
		}

		// Return the available types (may be empty)
		return availableTypes;
	};

	// Helper function to map donation items to donation types
	// Map donation items to their corresponding types for better consistency
	const DONATION_ITEMS_MAP: Record<string, string> = {
		"Clothes": DonationType.CLOTHES,
		"Winter Clothing": DonationType.CLOTHES,
		"Summer Clothing": DonationType.CLOTHES,
		"Children's Clothing": DonationType.CLOTHES,
		"Books": DonationType.BOOKS,
		"Textbooks": DonationType.BOOKS,
		"Children's Books": DonationType.BOOKS,
		"Educational Materials": DonationType.BOOKS,
		"Toys": DonationType.TOYS,
		"Children's Toys": DonationType.TOYS,
		"Board Games": DonationType.TOYS,
		"Food": DonationType.FOOD,
		"Non-perishable Food": DonationType.FOOD,
		"Canned Goods": DonationType.FOOD,
		"Baby Food": DonationType.FOOD,
		"Furniture": DonationType.FURNITURE,
		"Beds": DonationType.FURNITURE,
		"Tables": DonationType.FURNITURE,
		"Chairs": DonationType.FURNITURE,
		"Household Items": DonationType.HOUSEHOLD,
		"Kitchen Supplies": DonationType.HOUSEHOLD,
		"Cleaning Supplies": DonationType.HOUSEHOLD,
		"Bedding": DonationType.HOUSEHOLD,
		"Medical Supplies": DonationType.OTHER,
		"Hygiene Products": DonationType.OTHER,
		"Baby Items": DonationType.OTHER,
		"Sports Equipment": DonationType.OTHER,
		"School Supplies": DonationType.OTHER,
		"Electronics": DonationType.OTHER,
		"Other": DonationType.OTHER,
	};

	const mapDonationItemsToTypes = (items: string[]): string[] => {
		// Map items to types and filter out duplicates
		const mappedTypes = [...new Set(items.map(item => {
			// Normalize the item string by trimming
			const normalizedItem = item.trim();

			// Use our mapping or default to OTHER
			return DONATION_ITEMS_MAP[normalizedItem] || DonationType.OTHER;
		}))];

		// If we have at least one standard type, don't include OTHER
		const hasStandardType = mappedTypes.some(type => type !== DonationType.OTHER);

		// Filter out OTHER if we have standard types, otherwise keep it
		return hasStandardType
			? mappedTypes.filter(type => type !== DonationType.OTHER)
			: mappedTypes;
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

			{/* Display information about accepted donation types */}
			{cause?.cause && (cause.cause as any)?.acceptanceType && (
				<Box sx={{ mb: 3, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
					<Typography variant="h6" color="info.contrastText" gutterBottom>
						Donation Information
					</Typography>
					<Typography variant="body1" color="info.contrastText" sx={{ mb: 2 }}>
						{(() => {
							// Use a safe reference to cause data
							const causeData = cause.cause as any;

							// Display appropriate message based on acceptance type
							if (causeData.acceptanceType === 'money') {
								return 'This cause only accepts monetary donations.';
							} else if (causeData.acceptanceType === 'items') {
								return 'This cause only accepts item donations. Please select from the available items below.';
							} else {
								return 'This cause accepts both monetary and item donations. You can choose your preferred donation type below.';
							}
						})()}
					</Typography>

					{/* Show accepted items if available and relevant */}
					{(() => {
						const causeData = cause.cause as any;
						if (causeData.donationItems &&
							causeData.donationItems.length > 0 &&
							causeData.acceptanceType !== 'money') {
							return (
								<Box sx={{ mt: 2 }}>
									<Typography variant="subtitle2" color="info.contrastText" gutterBottom>
										Accepted Items:
									</Typography>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
										{causeData.donationItems.map((item: string, index: number) => (
											<Chip
												key={index}
												label={item}
												size="small"
												color="primary"
												variant="outlined"
												sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
											/>
										))}
									</Box>
								</Box>
							);
						}
						return null;
					})()}
				</Box>
			)}

			<Stack spacing={2}>
				{/* Only show donation category selection if cause accepts both types */}
				{(cause?.cause as any)?.acceptanceType === 'both' && (
					<Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
						<Typography variant="subtitle1" gutterBottom>
							What would you like to donate?
						</Typography>
						<FormControl component="fieldset" fullWidth>
							<RadioGroup
								row
								name="donationCategory"
								value={isMonetary ? "MONEY" : "NON_MONETARY"}
								onChange={handleDonationTypeChange}
							>
								<Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
									<Box
										sx={{
											flex: 1,
											p: 2,
											border: '1px solid',
											borderColor: isMonetary ? 'primary.main' : 'divider',
											borderRadius: 2,
											bgcolor: isMonetary ? 'primary.50' : 'transparent',
											cursor: 'pointer',
											transition: 'all 0.2s',
											'&:hover': {
												borderColor: 'primary.main',
												bgcolor: isMonetary ? 'primary.50' : 'primary.50',
											}
										}}
										onClick={() => handleDonationTypeChange({ target: { value: 'MONEY' } } as any)}
									>
										<FormControlLabel
											value="MONEY"
											control={<Radio />}
											label={
												<Box>
													<Typography variant="subtitle1">Monetary Donation</Typography>
													<Typography variant="body2" color="text.secondary">
														Donate money to support this cause
													</Typography>
												</Box>
											}
											sx={{ m: 0 }}
										/>
									</Box>
									<Box
										sx={{
											flex: 1,
											p: 2,
											border: '1px solid',
											borderColor: !isMonetary ? 'primary.main' : 'divider',
											borderRadius: 2,
											bgcolor: !isMonetary ? 'primary.50' : 'transparent',
											cursor: 'pointer',
											transition: 'all 0.2s',
											'&:hover': {
												borderColor: 'primary.main',
												bgcolor: !isMonetary ? 'primary.50' : 'primary.50',
											}
										}}
										onClick={() => handleDonationTypeChange({ target: { value: 'NON_MONETARY' } } as any)}
									>
										<FormControlLabel
											value="NON_MONETARY"
											control={<Radio />}
											label={
												<Box>
													<Typography variant="subtitle1">Item Donation</Typography>
													<Typography variant="body2" color="text.secondary">
														Donate items that this cause needs
													</Typography>
												</Box>
											}
											sx={{ m: 0 }}
										/>
									</Box>
								</Box>
							</RadioGroup>
						</FormControl>
					</Box>
				)}

				{isMonetary ? (
					<Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
						<Typography variant="subtitle1" gutterBottom>
							How much would you like to donate?
						</Typography>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
							{[10, 25, 50, 100, 250, 500].map((amount) => (
								<Chip
									key={amount}
									label={`$${amount}`}
									onClick={() => formik.setFieldValue('amount', amount)}
									color={Number(formik.values.amount) === amount ? 'primary' : 'default'}
									variant={Number(formik.values.amount) === amount ? 'filled' : 'outlined'}
									sx={{ px: 1, py: 2, fontSize: '1rem' }}
								/>
							))}
						</Box>
						<TextField
							fullWidth
							label="Amount ($)"
							name="amount"
							type="number"
							value={formik.values.amount}
							onChange={formik.handleChange}
							error={formik.touched.amount && Boolean(formik.errors.amount)}
							helperText={(formik.touched.amount && formik.errors.amount) || "Enter a custom amount"}
							InputProps={{
								startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
							}}
						/>
					</Box>
				) : (
					<>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
							<Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
								<Typography variant="subtitle2" gutterBottom>
									What type of items would you like to donate?
								</Typography>
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
									{/* Show only the donation types that are valid for this cause */}
									{availableDonationTypes.map((type) => (
										<MenuItem key={type} value={type}>
											{type}
										</MenuItem>
									))}
								</TextField>
							</Box>

							<Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
								<Typography variant="subtitle2" gutterBottom>
									How much would you like to donate?
								</Typography>
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
						</Box>

						<Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
							<Typography variant="subtitle2" gutterBottom>
								Unit of Measurement
							</Typography>
							<TextField
								fullWidth
								label="Unit (e.g., kg, items, boxes)"
								name="unit"
								value={formik.values.unit}
								onChange={formik.handleChange}
								error={formik.touched.unit && Boolean(formik.errors.unit)}
								helperText={formik.touched.unit && formik.errors.unit}
								placeholder="e.g., kg, items, pieces, boxes"
							/>
						</Box>

						<Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
							<Typography variant="subtitle2" gutterBottom>
								When would you like to schedule your donation?
							</Typography>
							<Box sx={{ display: "flex", gap: 2 }}>
								<TextField
									fullWidth
									type="date"
									name="scheduledDate"
									label="Pickup/Drop Date"
									// @ts-ignore - InputLabelProps is deprecated but still works
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

								<TextField
									fullWidth
									type="time"
									name="scheduledTime"
									label="Pickup/Drop Time"
									// @ts-ignore - InputLabelProps is deprecated but still works
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
							</Box>
						</Box>
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
					<Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
						<Typography variant="subtitle1" gutterBottom fontWeight="medium">
							How would you like to deliver your donation?
						</Typography>
						<ToggleButtonGroup
							value={formik.values.isPickup ? 'pickup' : 'dropoff'}
							exclusive
							onChange={handleDeliveryMethodChange}
							aria-label="delivery method"
							sx={{ width: '100%', mb: 2 }}
						>
							<ToggleButton
								value="pickup"
								aria-label="pickup"
								sx={{
									flex: 1,
									display: 'flex',
									flexDirection: 'column',
									gap: 1,
									py: 3,
									borderColor: formik.values.isPickup ? 'primary.main' : 'divider',
									bgcolor: formik.values.isPickup ? 'primary.50' : 'transparent',
									'&.Mui-selected': {
										bgcolor: 'primary.50',
									},
									'&:hover': {
										bgcolor: formik.values.isPickup ? 'primary.50' : 'rgba(0, 0, 0, 0.04)',
									}
								}}
							>
								<LocalShipping sx={{ fontSize: 32, color: 'primary.main' }} />
								<Typography variant="subtitle1">Pickup</Typography>
								<Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: '80%' }}>
									We'll collect the donation from your address
								</Typography>
							</ToggleButton>
							<ToggleButton
								value="dropoff"
								aria-label="dropoff"
								sx={{
									flex: 1,
									display: 'flex',
									flexDirection: 'column',
									gap: 1,
									py: 3,
									borderColor: !formik.values.isPickup ? 'primary.main' : 'divider',
									bgcolor: !formik.values.isPickup ? 'primary.50' : 'transparent',
									'&.Mui-selected': {
										bgcolor: 'primary.50',
									},
									'&:hover': {
										bgcolor: !formik.values.isPickup ? 'primary.50' : 'rgba(0, 0, 0, 0.04)',
									}
								}}
							>
								<Home sx={{ fontSize: 32, color: 'primary.main' }} />
								<Typography variant="subtitle1">Dropoff</Typography>
								<Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: '80%' }}>
									You'll deliver to the organization's address
								</Typography>
							</ToggleButton>
						</ToggleButtonGroup>
					</Box>
				)}

				<Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
					<Typography variant="subtitle1" gutterBottom fontWeight="medium">
						Contact Information
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						We'll use this information to contact you about your donation.
					</Typography>
					<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
					</Box>
				</Box>

				{!isMonetary && (
					<>
						{formik.values.isPickup ? (
							<Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
								<Typography variant="subtitle1" gutterBottom fontWeight="medium">
									Pickup Address
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
									Please provide the address where we should pick up your donation.
								</Typography>
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
							</Box>
						) : (
							<Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
								<Typography variant="subtitle1" gutterBottom fontWeight="medium">
									Dropoff Information
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
									Please drop off your donation at the following address during the scheduled time.
								</Typography>
								<Box sx={{
									p: 3,
									bgcolor: 'background.paper',
									borderRadius: 1,
									border: '1px solid',
									borderColor: 'divider',
									mb: 2
								}}>
									{cause?.cause && (
										<Box>
											<Typography variant="subtitle1" fontWeight="bold">
												{(cause.cause as any).organizationName || "Organization"}
											</Typography>
											<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
												The organization will provide you with their address details after your donation is confirmed.
											</Typography>
											<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
												You will receive a confirmation email with all the necessary information.
											</Typography>
											<Typography variant="body2" color="primary" sx={{ mt: 2, fontStyle: 'italic' }}>
												Note: Please bring a copy of your donation confirmation when you deliver your items.
											</Typography>
										</Box>
									)}
								</Box>
							</Box>
						)}
					</>
				)}

				<Box sx={{ mt: 4, textAlign: 'center' }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						By clicking "Donate Now", you agree to our terms and conditions for donations.
					</Typography>
					<Button
						type="submit"
						variant="contained"
						disabled={creating}
						size="large"
						sx={{
							mt: 1,
							px: 4,
							py: 1.5,
							fontSize: '1rem',
							boxShadow: 2,
							'&:hover': {
								boxShadow: 4
							}
						}}
					>
						{creating ? (
							<>
								<CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
								Submitting...
							</>
						) : (
							"Donate Now"
						)}
					</Button>
				</Box>
			</Stack>
		</Box>
	);
}
