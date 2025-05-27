"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Rating,
	TextField,
	FormControlLabel,
	Checkbox,
	Alert,
	Divider,
	Avatar,
	Chip,
	Stack,
	IconButton,
} from "@mui/material";
import {
	Star,
	Heart,
	MessageCircle,
	X,
	Send,
	Clock,
	CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateFeedbackMutation } from "@/store/api/feedbackApi";
import { Donation } from "@/types/donation";
import { toast } from "react-hot-toast";

interface FeedbackPromptModalProps {
	donation: Donation;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: () => void;
	onSkip: () => void;
	onLater: () => void;
}

const FeedbackPromptModal: React.FC<FeedbackPromptModalProps> = ({
	donation,
	isOpen,
	onClose,
	onSubmit,
	onSkip,
	onLater,
}) => {
	const [step, setStep] = useState<"prompt" | "form" | "success">("prompt");
	const [rating, setRating] = useState<number>(0);
	const [comment, setComment] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const [formErrors, setFormErrors] = useState<{
		rating?: string;
		comment?: string;
	}>({});

	const [createFeedback, { isLoading, error }] = useCreateFeedbackMutation();

	const handleStartFeedback = () => {
		setStep("form");
	};

	const handleSubmitFeedback = async () => {
		// Validate form
		const errors: { rating?: string; comment?: string } = {};
		if (!rating) errors.rating = "Please select a rating";
		if (!comment.trim()) errors.comment = "Please enter a comment";
		else if (comment.length < 10)
			errors.comment = "Comment must be at least 10 characters";
		else if (comment.length > 500)
			errors.comment = "Comment cannot exceed 500 characters";

		setFormErrors(errors);
		if (Object.keys(errors).length > 0) return;

		try {
			console.log("Submitting feedback with data:", {
				organization: donation.organization._id,
				campaign: donation.campaign?._id,
				cause: donation.cause._id,
				rating,
				comment,
				isPublic,
			});

			await createFeedback({
				organization: donation.organization._id,
				campaign: donation.campaign?._id,
				cause: donation.cause._id,
				rating,
				comment,
				isPublic,
			}).unwrap();

			console.log("Feedback submitted successfully");
			setStep("success");
			toast.success("Thank you for your feedback!");
		} catch (err: any) {
			console.error("Failed to submit feedback:", err);
			console.error("Error details:", {
				status: err?.status,
				data: err?.data,
				message: err?.message,
			});

			// Show more specific error message if available
			const errorMessage =
				err?.data?.error ||
				err?.data?.message ||
				"Failed to submit feedback. Please try again.";
			toast.error(errorMessage);
		}
	};

	const handleSuccessComplete = () => {
		onSubmit();
		onClose();
	};

	const formatCurrency = (amount: number) => {
		return `₹${amount.toLocaleString()}`;
	};

	return (
		<Dialog
			open={isOpen}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 3,
					overflow: "hidden",
				},
			}}
		>
			<AnimatePresence mode="wait">
				{step === "prompt" && (
					<motion.div
						key="prompt"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
					>
						{/* Header */}
						<Box
							sx={{
								background: "linear-gradient(135deg, #287068 0%, #2f8077 100%)",
								color: "white",
								p: 3,
								position: "relative",
								overflow: "hidden",
							}}
						>
							{/* Background Pattern */}
							<Box
								sx={{
									position: "absolute",
									top: -20,
									right: -20,
									width: 80,
									height: 80,
									borderRadius: "50%",
									background: "rgba(255,255,255,0.1)",
								}}
							/>
							<Box
								sx={{
									position: "absolute",
									bottom: -30,
									left: -30,
									width: 100,
									height: 100,
									borderRadius: "50%",
									background: "rgba(255,255,255,0.05)",
								}}
							/>

							<Box sx={{ position: "relative", zIndex: 1 }}>
								<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
									<Avatar
										sx={{
											backgroundColor: "rgba(255,255,255,0.2)",
											mr: 2,
											width: 56,
											height: 56,
										}}
									>
										<Heart size={28} />
									</Avatar>
									<Box>
										<Typography
											variant="h5"
											sx={{ fontWeight: "bold", mb: 0.5 }}
										>
											🎉 Donation Complete!
										</Typography>
										<Typography variant="body2" sx={{ opacity: 0.9 }}>
											Your generosity makes a difference
										</Typography>
									</Box>
								</Box>

								{/* Donation Summary */}
								<Box
									sx={{
										backgroundColor: "rgba(255,255,255,0.15)",
										borderRadius: 2,
										p: 2,
										mt: 2,
									}}
								>
									<Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
										Donation Summary
									</Typography>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											mb: 1,
										}}
									>
										<Typography variant="body2">Organization:</Typography>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											{donation.organization.name}
										</Typography>
									</Box>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											mb: 1,
										}}
									>
										<Typography variant="body2">Cause:</Typography>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											{donation.cause.title}
										</Typography>
									</Box>
									<Box
										sx={{ display: "flex", justifyContent: "space-between" }}
									>
										<Typography variant="body2">
											{donation.type === "MONEY" ? "Amount:" : "Type:"}
										</Typography>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											{donation.type === "MONEY"
												? formatCurrency(donation.amount || 0)
												: donation.type}
										</Typography>
									</Box>
								</Box>
							</Box>

							<IconButton
								onClick={onClose}
								sx={{
									position: "absolute",
									top: 16,
									right: 16,
									color: "white",
									backgroundColor: "rgba(255,255,255,0.1)",
									"&:hover": {
										backgroundColor: "rgba(255,255,255,0.2)",
									},
								}}
							>
								<X size={20} />
							</IconButton>
						</Box>

						{/* Content */}
						<DialogContent sx={{ p: 3 }}>
							<Box sx={{ textAlign: "center", mb: 3 }}>
								<Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
									How was your donation experience?
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 3 }}
								>
									Your feedback helps us improve our platform and helps other
									donors make informed decisions about supporting this
									organization.
								</Typography>

								{/* Benefits of Feedback */}
								<Stack spacing={2} sx={{ textAlign: "left" }}>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<CheckCircle
											size={20}
											color="#287068"
											style={{ marginRight: 12 }}
										/>
										<Typography variant="body2">
											Help improve the donation experience
										</Typography>
									</Box>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<CheckCircle
											size={20}
											color="#287068"
											style={{ marginRight: 12 }}
										/>
										<Typography variant="body2">
											Share your experience with other donors
										</Typography>
									</Box>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<CheckCircle
											size={20}
											color="#287068"
											style={{ marginRight: 12 }}
										/>
										<Typography variant="body2">
											Support transparency in charitable giving
										</Typography>
									</Box>
								</Stack>
							</Box>
						</DialogContent>

						{/* Actions */}
						<DialogActions sx={{ p: 3, pt: 0 }}>
							<Stack spacing={2} sx={{ width: "100%" }}>
								<Button
									variant="contained"
									fullWidth
									onClick={handleStartFeedback}
									startIcon={<Star />}
									sx={{
										backgroundColor: "#287068",
										"&:hover": { backgroundColor: "#1f5a52" },
										py: 1.5,
										borderRadius: 2,
										fontWeight: 600,
									}}
								>
									Share My Experience
								</Button>
								<Box sx={{ display: "flex", gap: 1 }}>
									<Button
										variant="outlined"
										fullWidth
										onClick={onLater}
										startIcon={<Clock />}
										sx={{
											borderColor: "#287068",
											color: "#287068",
											"&:hover": {
												borderColor: "#1f5a52",
												backgroundColor: "rgba(40, 112, 104, 0.04)",
											},
										}}
									>
										Remind Me Later
									</Button>
									<Button
										variant="text"
										fullWidth
										onClick={onSkip}
										sx={{
											color: "text.secondary",
											"&:hover": {
												backgroundColor: "rgba(0,0,0,0.04)",
											},
										}}
									>
										Skip for Now
									</Button>
								</Box>
							</Stack>
						</DialogActions>
					</motion.div>
				)}

				{step === "form" && (
					<motion.div
						key="form"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
					>
						<DialogTitle sx={{ pb: 1 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<Avatar sx={{ backgroundColor: "#287068", mr: 2 }}>
										<MessageCircle size={20} />
									</Avatar>
									<Box>
										<Typography variant="h6" sx={{ fontWeight: "bold" }}>
											Share Your Feedback
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{donation.organization.name}
										</Typography>
									</Box>
								</Box>
								<IconButton onClick={onClose}>
									<X size={20} />
								</IconButton>
							</Box>
						</DialogTitle>

						<Divider />

						<DialogContent sx={{ p: 3 }}>
							<Stack spacing={3}>
								{/* Display error if any */}
								{error && (
									<Alert severity="error">
										Failed to submit feedback. Please try again.
									</Alert>
								)}

								{/* Rating */}
								<Box>
									<Typography
										variant="subtitle1"
										sx={{ fontWeight: 600, mb: 1 }}
									>
										How would you rate your experience? *
									</Typography>
									<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
										<Rating
											value={rating}
											onChange={(_, newValue) => setRating(newValue || 0)}
											size="large"
											sx={{
												"& .MuiRating-iconFilled": {
													color: "#287068",
												},
											}}
										/>
										<Typography variant="body2" color="text.secondary">
											{rating === 0 && "Select a rating"}
											{rating === 1 && "Poor"}
											{rating === 2 && "Fair"}
											{rating === 3 && "Good"}
											{rating === 4 && "Very Good"}
											{rating === 5 && "Excellent"}
										</Typography>
									</Box>
									{formErrors.rating && (
										<Typography
											variant="caption"
											color="error"
											sx={{ mt: 0.5, display: "block" }}
										>
											{formErrors.rating}
										</Typography>
									)}
								</Box>

								{/* Comment */}
								<Box>
									<Typography
										variant="subtitle1"
										sx={{ fontWeight: 600, mb: 1 }}
									>
										Tell us about your experience *
									</Typography>
									<TextField
										multiline
										rows={4}
										fullWidth
										placeholder="Share details about your donation experience, the organization's communication, and any suggestions for improvement..."
										value={comment}
										onChange={(e) => setComment(e.target.value)}
										error={!!formErrors.comment}
										helperText={
											formErrors.comment ||
											`${comment.length}/500 characters (minimum 10 required)`
										}
										sx={{
											"& .MuiOutlinedInput-root": {
												"&.Mui-focused fieldset": {
													borderColor: "#287068",
												},
											},
										}}
									/>
								</Box>

								{/* Privacy Setting */}
								<Box>
									<FormControlLabel
										control={
											<Checkbox
												checked={isPublic}
												onChange={(e) => setIsPublic(e.target.checked)}
												sx={{
													color: "#287068",
													"&.Mui-checked": {
														color: "#287068",
													},
												}}
											/>
										}
										label={
											<Box>
												<Typography variant="body2" sx={{ fontWeight: 500 }}>
													Make this feedback public
												</Typography>
												<Typography variant="caption" color="text.secondary">
													Public feedback helps other donors make informed
													decisions
												</Typography>
											</Box>
										}
									/>
								</Box>

								{/* Donation Context */}
								<Box
									sx={{
										backgroundColor: "#f8f9fa",
										borderRadius: 2,
										p: 2,
										border: "1px solid #e9ecef",
									}}
								>
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ mb: 1, display: "block" }}
									>
										This feedback is for:
									</Typography>
									<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
										<Chip
											label={donation.cause.title}
											size="small"
											sx={{ backgroundColor: "#287068", color: "white" }}
										/>
										{donation.campaign && (
											<Chip
												label={donation.campaign.title}
												size="small"
												variant="outlined"
												sx={{ borderColor: "#287068", color: "#287068" }}
											/>
										)}
									</Box>
								</Box>
							</Stack>
						</DialogContent>

						<DialogActions sx={{ p: 3, pt: 0 }}>
							<Box sx={{ display: "flex", gap: 2, width: "100%" }}>
								<Button
									variant="outlined"
									onClick={() => setStep("prompt")}
									sx={{
										borderColor: "#287068",
										color: "#287068",
										"&:hover": {
											borderColor: "#1f5a52",
											backgroundColor: "rgba(40, 112, 104, 0.04)",
										},
									}}
								>
									Back
								</Button>
								<Button
									variant="contained"
									fullWidth
									onClick={handleSubmitFeedback}
									disabled={isLoading}
									startIcon={
										isLoading ? (
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<motion.div
													animate={{ rotate: 360 }}
													transition={{
														duration: 1,
														repeat: Infinity,
														ease: "linear",
													}}
												>
													<Star size={16} />
												</motion.div>
											</Box>
										) : (
											<Send />
										)
									}
									sx={{
										backgroundColor: "#287068",
										"&:hover": { backgroundColor: "#1f5a52" },
										py: 1.5,
										fontWeight: 600,
									}}
								>
									{isLoading ? "Submitting..." : "Submit Feedback"}
								</Button>
							</Box>
						</DialogActions>
					</motion.div>
				)}

				{step === "success" && (
					<motion.div
						key="success"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.3 }}
					>
						<Box
							sx={{
								textAlign: "center",
								p: 4,
								background: "linear-gradient(135deg, #287068 0%, #2f8077 100%)",
								color: "white",
								position: "relative",
								overflow: "hidden",
							}}
						>
							{/* Success Animation Background */}
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								style={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									width: 200,
									height: 200,
									borderRadius: "50%",
									background: "rgba(255,255,255,0.1)",
									zIndex: 0,
								}}
							/>

							<Box sx={{ position: "relative", zIndex: 1 }}>
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
								>
									<Avatar
										sx={{
											backgroundColor: "rgba(255,255,255,0.2)",
											width: 80,
											height: 80,
											mx: "auto",
											mb: 2,
										}}
									>
										<CheckCircle size={40} />
									</Avatar>
								</motion.div>

								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.3 }}
								>
									<Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
										Thank You! 🎉
									</Typography>
									<Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
										Your feedback has been submitted successfully and will help
										improve the donation experience for everyone.
									</Typography>

									<Button
										variant="contained"
										onClick={handleSuccessComplete}
										sx={{
											backgroundColor: "white",
											color: "#287068",
											fontWeight: 600,
											px: 4,
											py: 1.5,
											"&:hover": {
												backgroundColor: "#f8f9fa",
											},
										}}
									>
										Continue
									</Button>
								</motion.div>
							</Box>
						</Box>
					</motion.div>
				)}
			</AnimatePresence>
		</Dialog>
	);
};

export default FeedbackPromptModal;
