"use client";
import {
	useGetCauseByIdQuery,
	useUpdateCauseMutation,
} from "@/store/api/causeApi";
import { UpdateCauseBody } from "@/types/cause";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Grid,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";

interface Cause {
	id: string;
	title: string;
	description: string;
	targetAmount: number;
	imageUrl: string;
	tags: string[];
}

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

	const { data: causesResponse } = useGetCauseByIdQuery(id || "");
	const [updateCause, { isLoading: isUpdating }] = useUpdateCauseMutation();
	console.log("cause respose", causesResponse);
	useEffect(() => {
		if (causesResponse?.cause) {
			setTags(causesResponse.cause.tags || []);
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

	const handleSubmit = async (values: UpdateCauseBody) => {
		try {
			const body = { ...values, tags };
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

							<Grid item xs={12} md={6}>
								<Field
									as={TextField}
									fullWidth
									name="imageUrl"
									label="Image URL"
									variant="outlined"
									error={touched.imageUrl && !!errors.imageUrl}
									helperText={<ErrorMessage name="imageUrl" />}
								/>
							</Grid>

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
										onClick={() => router.push(`/causes/${causeId}`)}
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
