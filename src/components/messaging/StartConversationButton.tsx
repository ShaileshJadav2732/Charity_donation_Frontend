"use client";

import React, { useState } from "react";
import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Typography,
	Box,
	CircularProgress,
} from "@mui/material";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	useCreateConversationMutation,
	useResolveParticipantIdQuery,
} from "@/store/api/messageApi";
import { useGetOrganizationByCauseIdQuery } from "@/store/api/organizationApi";
import toast from "react-hot-toast";

interface StartConversationButtonProps {
	recipientId: string; // Any ID - will be resolved to User ID
	recipientType?: "user" | "organization" | "cause"; // Hint about what type of ID this is
	recipientName: string;
	recipientRole?: "donor" | "organization";
	relatedDonation?: string;
	relatedCause?: string;
	variant?: "button" | "icon";
	size?: "small" | "medium" | "large";
	fullWidth?: boolean;
}

const StartConversationButton: React.FC<StartConversationButtonProps> = ({
	recipientId,
	recipientType,
	recipientName,
	recipientRole,
	relatedDonation,
	relatedCause,
	variant = "button",
	size = "medium",
	fullWidth = false,
}) => {
	const router = useRouter();
	const { user, token } = useSelector((state: RootState) => state.auth);
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");

	const [createConversation, { isLoading }] = useCreateConversationMutation();

	// Use specific API for cause IDs to get organization data
	const {
		data: organizationData,
		isLoading: loadingOrg,
		error: orgError,
	} = useGetOrganizationByCauseIdQuery(recipientId, {
		skip: !recipientId || recipientType !== "cause",
	});

	// Fallback: Use universal resolver for other ID types
	const {
		data: participantData,
		isLoading: resolving,
		error: resolveError,
	} = useResolveParticipantIdQuery(recipientId, {
		skip: !recipientId || recipientType === "cause",
	});

	// Determine the final participant User ID
	let finalParticipantId: string | null = null;
	let isLoading_final = false;
	let hasError = false;

	if (recipientType === "cause") {
		isLoading_final = loadingOrg;
		hasError = !!orgError;
		if (organizationData?.organization?.userId) {
			finalParticipantId = organizationData.organization.userId;
		}
	} else {
		isLoading_final = resolving;
		hasError = !!resolveError;
		if (participantData?.data?.participantId) {
			finalParticipantId = participantData.data.participantId;
		}
	}

	// Only hide if no user, no token, or no recipientId
	if (!user || !token || !recipientId) {
		return null;
	}

	// Don't show if trying to message yourself (only if we successfully resolved the ID)
	if (finalParticipantId && user?.id === finalParticipantId) {
		return null;
	}

	const handleOpen = () => {
		setOpen(true);
		// Set default message based on context
		if (relatedDonation) {
			setMessage(`Hi ${recipientName}, I'd like to discuss the donation...`);
		} else if (relatedCause) {
			setMessage(
				`Hi ${recipientName}, I'm interested in your cause and would like to know more...`
			);
		} else {
			setMessage(`Hi ${recipientName}, `);
		}
	};

	const handleClose = () => {
		setOpen(false);
		setMessage("");
	};

	const handleSendMessage = async () => {
		if (!message.trim()) {
			toast.error("Please enter a message");
			return;
		}

		if (!user) {
			toast.error("Please log in to send messages");
			return;
		}

		// If we couldn't resolve the participant ID, try using the original recipient ID
		const participantIdToUse = finalParticipantId || recipientId;

		try {
			const result = await createConversation({
				participantId: participantIdToUse,
				initialMessage: message.trim(),
				relatedDonation,
				relatedCause,
			}).unwrap();

			toast.success("Conversation started!");
			handleClose();

			// Navigate to the new conversation
			router.push(`/dashboard/messages/${result.data._id}`);
		} catch (error) {
			// Handle the case where conversation already exists
			if (
				error &&
				typeof error === "object" &&
				"status" in error &&
				error.status === 400 &&
				"data" in error
			) {
				const errorData = error.data as {
					message?: string;
					data?: { conversationId?: string };
				};

				if (
					errorData.message?.includes("already exists") &&
					errorData.data?.conversationId
				) {
					// Show yellow warning toast and redirect to existing conversation
					toast.success(
						"Conversation already exists! Redirecting to existing conversation..."
					);
					handleClose();
					router.push(`/dashboard/messages/${errorData.data.conversationId}`);
					return;
				}
			}
		}
	};

	// Determine button color and tooltip based on state
	let buttonColor: "primary" | "warning" | "error" | "success" = "primary";
	let tooltipText = "Send message";

	if (isLoading_final) {
		buttonColor = "warning";
		tooltipText = "Loading recipient info...";
	} else if (hasError) {
		buttonColor = "error";
		tooltipText = "Error loading recipient (click to try anyway)";
	} else if (!finalParticipantId) {
		buttonColor = "warning";
		tooltipText = "Recipient not resolved (click to try anyway)";
	} else {
		buttonColor = "success";
		tooltipText = "Send message";
	}

	const buttonContent =
		variant === "icon" ? (
			<MessageCircle
				size={size === "small" ? 16 : size === "large" ? 24 : 20}
			/>
		) : (
			<>
				<MessageCircle size={16} style={{ marginRight: 8 }} />
				Message {recipientRole === "organization" ? "Organization" : "Donor"}
			</>
		);

	return (
		<>
			<Button
				variant={variant === "icon" ? "outlined" : "contained"}
				color={buttonColor}
				size={size}
				fullWidth={fullWidth}
				onClick={handleOpen}
				title={tooltipText}
				sx={{
					cursor: "pointer",
					...(variant === "icon" && {
						minWidth: "auto",
						width: size === "small" ? 32 : size === "large" ? 48 : 40,
						height: size === "small" ? 32 : size === "large" ? 48 : 40,
						borderRadius: "50%",
					}),
				}}
			>
				{buttonContent}
			</Button>

			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				sx={{
					"& .MuiDialog-paper": {
						borderRadius: 2,
					},
				}}
			>
				<DialogTitle>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<MessageCircle size={24} />
						<Typography variant="h6">
							Start Conversation with {recipientName}
						</Typography>
					</Box>
				</DialogTitle>

				<DialogContent>
					<Box sx={{ mb: 2 }}>
						<Typography variant="body2" color="text.secondary">
							Send a message to {recipientName} ({recipientRole})
							{relatedDonation && " about this donation"}
							{relatedCause && " about this cause"}
						</Typography>
					</Box>

					<TextField
						fullWidth
						multiline
						rows={4}
						label="Your message"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder={`Type your message to ${recipientName}...`}
						disabled={isLoading}
						sx={{
							"& .MuiOutlinedInput-root": {
								borderRadius: 2,
							},
						}}
					/>

					{(relatedDonation || relatedCause) && (
						<Box
							sx={{
								mt: 2,
								p: 2,
								backgroundColor: "primary.50",
								borderRadius: 1,
								border: 1,
								borderColor: "primary.200",
							}}
						>
							<Typography
								variant="caption"
								color="primary.main"
								sx={{ fontWeight: 600 }}
							>
								Context:
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{relatedDonation &&
									"This conversation is related to a donation"}
								{relatedCause && "This conversation is related to a cause"}
							</Typography>
						</Box>
					)}
				</DialogContent>

				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Button onClick={handleClose} disabled={isLoading} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={handleSendMessage}
						disabled={isLoading || !message.trim()}
						variant="contained"
						startIcon={
							isLoading ? (
								<CircularProgress size={16} color="inherit" />
							) : (
								<MessageCircle size={16} />
							)
						}
					>
						{isLoading ? "Sending..." : "Send Message"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default StartConversationButton;
