"use client";
import {
	useGetCauseByIdQuery,
	useUpdateCauseMutation,
} from "@/store/api/causeApi";
import { UpdateCauseBody } from "@/types/cause";
import { DonationType } from "@/types/donation";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Grid,
	Paper,
	TextField,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	ListItemText,
	Checkbox,
	OutlinedInput,
	SelectChangeEvent,
} from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import CloudinaryImageUpload from "@/components/cloudinary/CloudinaryImageUpload";
import { toast } from "react-hot-toast";

interface Cause {
	id: string;
	title: string;
	description: string;
	targetAmount: number;
	imageUrl: string;
	tags: string[];
	acceptanceType?: "money" | "items" | "both";
	donationItems?: string[];
	acceptedDonationTypes?: DonationType[];
}

const DONATION_ITEMS = [
	"Clothes",
	"Books",
	"Toys",
	"Food",
	"Furniture",
	"Electronics",
	"Household Items",
	"School Supplies",
	"Medical Supplies",
	"Hygiene Products",
	"Baby Items",
	"Sports Equipment",
];

const validationSchema = Yup.object().shape({
	title: Yup.string().min(3, "Title must be at least 3 characters"),
	description: Yup.string().min(
		10,
		"Description must be at least 10 characters"
	),
	targetAmount: Yup.number().min(1, "Target amount must be greater than 0"),
	imageUrl: Yup.string().url("Must be a valid URL"),
	tags: Yup.array().of(Yup.string()),
});

export const UpdateCauseForm = () => {
	const params = useParams<{ id: string }>();
	const id = params.id;
	const router = useRouter();
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");
	const [acceptanceType, setAcceptanceType] = useState<
		"money" | "items" | "both"
	>("money");
	const [donationItems, setDonationItems] = useState<string[]>([]);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [imagePublicId, setImagePublicId] = useState<string>("");

	const { data: causesResponse } = useGetCauseByIdQuery(id || "");
	const [updateCause, { isLoading: isUpdating }] = useUpdateCauseMutation();
	console.log("cause respose", causesResponse);

	useEffect(() => {
		if (causesResponse?.cause) {
			setTags(causesResponse.cause.tags || []);
			setImageUrl(causesResponse.cause.imageUrl || "");

			// Set acceptance type based on cause data
			if (causesResponse.cause.acceptanceType) {
				setAcceptanceType(causesResponse.cause.acceptanceType);
			} else if (causesResponse.cause.acceptedDonationTypes) {
				// If no acceptanceType but has acceptedDonationTypes, infer from them
				const hasMoneyType =
					causesResponse.cause.acceptedDonationTypes.includes(
						DonationType.MONEY
					);
				const hasItemTypes = causesResponse.cause.acceptedDonationTypes.some(
					(type) => type !== DonationType.MONEY
				);

				if (hasMoneyType && hasItemTypes) {
					setAcceptanceType("both");
				} else if (hasMoneyType) {
					setAcceptanceType("money");
				} else if (hasItemTypes) {
					setAcceptanceType("items");
				}
			}

			// Set donation items if available
			if (
				causesResponse.cause.donationItems &&
				causesResponse.cause.donationItems.length > 0
			) {
				setDonationItems(causesResponse.cause.donationItems);
			} else if (causesResponse.cause.acceptedDonationTypes) {
				// If no donationItems but has acceptedDonationTypes, map them to items
				const itemTypes = causesResponse.cause.acceptedDonationTypes
					.filter((type) => type !== DonationType.MONEY)
					.map((type) => {
						switch (type) {
							case DonationType.CLOTHES:
								return "Clothes";
							case DonationType.BOOKS:
								return "Books";
							case DonationType.TOYS:
								return "Toys";
							case DonationType.FOOD:
								return "Food";
							case DonationType.FURNITURE:
								return "Furniture";
							case DonationType.HOUSEHOLD:
								return "Household Items";
							default:
								return type.charAt(0) + type.slice(1).toLowerCase();
						}
					});
				setDonationItems(itemTypes);
			}
		}
	}, [causesResponse]);

	// if (isLoading) return <CircularProgress />;
	// if (isError || !causesResponse?.data?.cause) return <Typography>Error loading cause</Typography>;

	const initialValues: UpdateCauseBody = {
		title: causesResponse?.cause?.title || "",
		description: causesResponse?.cause?.description || "",
		targetAmount: causesResponse?.cause?.targetAmount || 0,
		imageUrl: causesResponse?.cause?.imageUrl || "",
		tags: causesResponse?.cause?.tags || [],
	};

	const handleAddTag = () => {
		if (tagInput.trim() && !tags.includes(tagInput.trim())) {
			setTags([...tags, tagInput.trim()]);
			setTagInput("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setTags(tags.filter((tag) => tag !== tagToRemove));
	};

	const handleAcceptanceTypeChange = (event: SelectChangeEvent<string>) => {
		const value = event.target.value as "money" | "items" | "both";
		setAcceptanceType(value);
		// Reset donation items if changing to money-only
		if (value === "money") {
			setDonationItems([]);
		}
	};

	const handleDonationItemsChange = (event: SelectChangeEvent<string[]>) => {
		const value = event.target.value as string[];
		setDonationItems(value);
	};

	const handleImageUpload = (newImageUrl: string, publicId: string) => {
		setImageUrl(newImageUrl);
		setImagePublicId(publicId);
	};

	const handleSubmit = async (values: UpdateCauseBody) => {
		try {
			// Convert donation items to DonationType enum values
			const acceptedDonationTypes: DonationType[] = [];

			if (acceptanceType === "money" || acceptanceType === "both") {
				acceptedDonationTypes.push(DonationType.MONEY);
			}

			if (acceptanceType === "items" || acceptanceType === "both") {
				donationItems.forEach((item) => {
					switch (item.toUpperCase()) {
						case "CLOTHES":
							acceptedDonationTypes.push(DonationType.CLOTHES);
							break;
						case "BOOKS":
							acceptedDonationTypes.push(DonationType.BOOKS);
							break;
						case "TOYS":
							acceptedDonationTypes.push(DonationType.TOYS);
							break;
						case "FOOD":
							acceptedDonationTypes.push(DonationType.FOOD);
							break;
						case "FURNITURE":
							acceptedDonationTypes.push(DonationType.FURNITURE);
							break;
						case "HOUSEHOLD ITEMS":
							acceptedDonationTypes.push(DonationType.HOUSEHOLD);
							break;
						default:
							acceptedDonationTypes.push(DonationType.OTHER);
							break;
					}
				});
			}

			const body = {
				...values,
				imageUrl: imageUrl || values.imageUrl,
				tags,
				acceptanceType,
				donationItems: acceptanceType !== "money" ? donationItems : [],
				acceptedDonationTypes,
			};

			await updateCause({ id, body }).unwrap();
			router.push(`/dashboard/causes/${id}`);
		} catch (error) {
			console.error("Failed to update cause:", error);
		}
	};

	return (
		<Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
			<Typography variant="h4" gutterBottom>
				Update Cause
			</Typography>

			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}
			>
				{({ errors, touched }) => (
					<Form>
						<Grid container spacing={3}>
							<Grid item xs={12}>
								<Field
									as={TextField}
									fullWidth
									name="title"
									label="Title"
									variant="outlined"
									error={touched.title && !!errors.title}
									helperText={<ErrorMessage name="title" />}
								/>
							</Grid>

							<Grid item xs={12}>
								<Field
									as={TextField}
									fullWidth
									name="description"
									label="Description"
									variant="outlined"
									multiline
									rows={4}
									error={touched.description && !!errors.description}
									helperText={<ErrorMessage name="description" />}
								/>
							</Grid>

							<Grid item xs={12} md={6}>
								<Field
									as={TextField}
									fullWidth
									name="targetAmount"
									label="Target Amount"
									type="number"
									variant="outlined"
									error={touched.targetAmount && !!errors.targetAmount}
									helperText={<ErrorMessage name="targetAmount" />}
								/>
							</Grid>

							<Grid item xs={12}>
								<CloudinaryImageUpload
									onImageUpload={handleImageUpload}
									currentImageUrl={imageUrl}
									label="Cause Image"
									helperText="Upload a new image for your cause (max 5MB). Supported formats: JPG, PNG, WebP, GIF"
								/>
							</Grid>

							<Grid item xs={12}>
								<FormControl fullWidth>
									<InputLabel id="acceptance-type-label">
										Acceptance Type
									</InputLabel>
									<Select
										labelId="acceptance-type-label"
										id="acceptance-type"
										value={acceptanceType}
										label="Acceptance Type"
										onChange={handleAcceptanceTypeChange}
									>
										<MenuItem value="money">Money Only</MenuItem>
										<MenuItem value="items">Items Only</MenuItem>
										<MenuItem value="both">Both Money and Items</MenuItem>
									</Select>
								</FormControl>
							</Grid>

							{acceptanceType !== "money" && (
								<Grid item xs={12}>
									<FormControl fullWidth>
										<InputLabel id="donation-items-label">
											Donation Items
										</InputLabel>
										<Select
											labelId="donation-items-label"
											id="donation-items"
											multiple
											value={donationItems}
											onChange={handleDonationItemsChange}
											input={<OutlinedInput label="Donation Items" />}
											renderValue={(selected) => selected.join(", ")}
										>
											{DONATION_ITEMS.map((item) => (
												<MenuItem key={item} value={item}>
													<Checkbox
														checked={donationItems.indexOf(item) > -1}
													/>
													<ListItemText primary={item} />
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>
							)}

							<Grid item xs={12}>
								<Box sx={{ mb: 2 }}>
									<Typography variant="subtitle1" gutterBottom>
										Tags
									</Typography>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<TextField
											value={tagInput}
											onChange={(e) => setTagInput(e.target.value)}
											onKeyPress={(e) =>
												e.key === "Enter" &&
												(e.preventDefault(), handleAddTag())
											}
											label="Add tag"
											size="small"
										/>
										<Button
											variant="outlined"
											onClick={handleAddTag}
											disabled={!tagInput.trim()}
										>
											Add
										</Button>
									</Box>
									<Box
										sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}
									>
										{tags.map((tag) => (
											<Chip
												key={tag}
												label={tag}
												onDelete={() => handleRemoveTag(tag)}
											/>
										))}
									</Box>
								</Box>
							</Grid>

							<Grid item xs={12}>
								<Box
									sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
								>
									<Button
										variant="outlined"
										onClick={() => router.push(`/dashboard/causes`)}
										disabled={isUpdating}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										variant="contained"
										color="primary"
										disabled={isUpdating}
									>
										{isUpdating ? (
											<CircularProgress size={24} />
										) : (
											"Update Cause"
										)}
									</Button>
								</Box>
							</Grid>
						</Grid>
					</Form>
				)}
			</Formik>
		</Paper>
	);
};

export default UpdateCauseForm;
