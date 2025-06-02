"use client";

import React, { useState, useRef, useCallback } from "react";
import {
	Box,
	TextField,
	IconButton,
	Paper,
	Typography,
	CircularProgress,
} from "@mui/material";
import { Send, Smile, X } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSendMessageMutation } from "@/store/api/messageApi";
import { useMessage } from "@/contexts/MessageContext";
import { Conversation, Message } from "@/types/message";
import toast from "react-hot-toast";

interface MessageInputProps {
	conversation: Conversation;
	onMessageSent: (message: Message) => void;
	replyToMessage?: Message | null;
	onCancelReply?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
	conversation,
	onMessageSent,
	replyToMessage,
	onCancelReply,
}) => {
	const { user } = useSelector((state: RootState) => state.auth);
	const { sendTypingIndicator } = useMessage();

	// State
	const [message, setMessage] = useState("");
	const [isTyping, setIsTyping] = useState(false);

	// Refs
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// API
	const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

	// Get other participant
	const otherParticipant = conversation.participants.find(
		(p) => p.user._id !== user?.id
	);

	// Handle typing indicators
	const handleTypingStart = useCallback(() => {
		if (!isTyping) {
			setIsTyping(true);
			sendTypingIndicator(conversation._id, true);
		}

		// Clear existing timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		// Set new timeout to stop typing indicator
		typingTimeoutRef.current = setTimeout(() => {
			setIsTyping(false);
			sendTypingIndicator(conversation._id, false);
		}, 2000);
	}, [isTyping, sendTypingIndicator, conversation._id]);

	const handleTypingStop = useCallback(() => {
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}
		if (isTyping) {
			setIsTyping(false);
			sendTypingIndicator(conversation._id, false);
		}
	}, [isTyping, sendTypingIndicator, conversation._id]);

	// Handle message input change
	const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessage(e.target.value);

		if (e.target.value.trim()) {
			handleTypingStart();
		} else {
			handleTypingStop();
		}
	};

	// File upload functionality removed for simplicity

	// Send message
	const handleSendMessage = async () => {
		const trimmedMessage = message.trim();

		if (!trimmedMessage) {
			return;
		}

		if (!otherParticipant) {
			toast.error("Cannot send message: recipient not found");
			return;
		}

		try {
			handleTypingStop();

			const result = await sendMessage({
				conversationId: conversation._id,
				recipientId: otherParticipant.user._id,
				content: trimmedMessage,
				messageType: "text",
				replyTo: replyToMessage?._id,
			}).unwrap();

			// Clear input
			setMessage("");

			// Clear reply
			if (onCancelReply) {
				onCancelReply();
			}

			// Notify parent component
			onMessageSent(result.data);
		} catch (error: any) {
			const errorMessage =
				error?.data?.message || error?.message || "Failed to send message";
			toast.error(errorMessage);
		}
	};

	// Handle key press
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// File functionality removed

	return (
		<Box
			sx={{
				p: 3,
				borderRadius: 0,
				background: "transparent", // Remove background since parent handles it
			}}
		>
			{/* Reply Preview */}
			{replyToMessage && (
				<Box
					sx={{
						mb: 2,
						p: 2,
						borderRadius: 2,
						background: "rgba(102, 126, 234, 0.1)",
						border: "1px solid rgba(102, 126, 234, 0.2)",
						borderLeft: "4px solid #667eea",
					}}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
							mb: 1,
						}}
					>
						<Typography
							variant="caption"
							color="primary"
							sx={{ fontWeight: 600 }}
						>
							Replying to {replyToMessage.sender.name}
						</Typography>
						<IconButton size="small" onClick={onCancelReply} sx={{ p: 0.5 }}>
							<X size={16} />
						</IconButton>
					</Box>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{
							overflow: "hidden",
							textOverflow: "ellipsis",
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
						}}
					>
						{replyToMessage.content}
					</Typography>
				</Box>
			)}

			{/* File attachments removed for simplicity */}

			{/* Message Input */}
			<Box
				sx={{
					display: "flex",
					alignItems: "flex-end",
					gap: 2,
					p: 2,
					borderRadius: 3,
					background: "rgba(255,255,255,0.8)",
					border: "1px solid rgba(44, 122, 114, 0.1)",
					boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
				}}
			>
				{/* File upload buttons removed for simplicity */}

				{/* Message Text Field */}
				<TextField
					fullWidth
					multiline
					maxRows={4}
					placeholder={`Message ${
						otherParticipant?.user.name || "recipient"
					}...`}
					value={message}
					onChange={handleMessageChange}
					onKeyPress={handleKeyPress}
					disabled={isSending}
					variant="outlined"
					size="medium"
					sx={{
						"& .MuiOutlinedInput-root": {
							borderRadius: 3,
							background: "rgba(255,255,255,0.9)",
							border: "1px solid rgba(44, 122, 114, 0.2)",
							"&:hover": {
								borderColor: "#2c7a72",
							},
							"&.Mui-focused": {
								borderColor: "#2c7a72",
								boxShadow: "0 0 0 3px rgba(44, 122, 114, 0.1)",
							},
							"& fieldset": {
								border: "none",
							},
						},
						"& .MuiInputBase-input": {
							fontSize: "1rem",
							fontWeight: 400,
							"&::placeholder": {
								color: "rgba(44, 122, 114, 0.6)",
								opacity: 1,
							},
						},
					}}
				/>

				{/* Emoji Button */}
				<IconButton
					size="small"
					disabled={isSending}
					sx={{
						p: 1.5,
						borderRadius: 2,
						background:
							"linear-gradient(135deg, rgba(44, 122, 114, 0.1) 0%, rgba(30, 90, 84, 0.1) 100%)",
						border: "1px solid rgba(44, 122, 114, 0.2)",
						color: "#2c7a72",
						"&:hover": {
							background:
								"linear-gradient(135deg, rgba(44, 122, 114, 0.2) 0%, rgba(30, 90, 84, 0.2) 100%)",
							transform: "translateY(-1px)",
							boxShadow: "0 4px 12px rgba(44, 122, 114, 0.3)",
						},
						"&:disabled": {
							opacity: 0.5,
							transform: "none",
						},
						transition: "all 0.2s ease-in-out",
					}}
				>
					<Smile size={18} />
				</IconButton>

				{/* Send Button */}
				<IconButton
					onClick={handleSendMessage}
					disabled={isSending || !message.trim()}
					sx={{
						p: 1.5,
						borderRadius: 2,
						background: "linear-gradient(135deg, #2c7a72 0%, #1e5a54 100%)",
						color: "white",
						"&:hover": {
							background: "linear-gradient(135deg, #236b63 0%, #1a4f4a 100%)",
							transform: "translateY(-1px)",
							boxShadow: "0 6px 20px rgba(44, 122, 114, 0.4)",
						},
						"&:disabled": {
							background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)",
							color: "#a0aec0",
							transform: "none",
							boxShadow: "none",
						},
						transition: "all 0.2s ease-in-out",
					}}
				>
					{isSending ? (
						<CircularProgress size={18} color="inherit" />
					) : (
						<Send size={18} />
					)}
				</IconButton>
			</Box>

			{/* File inputs removed for simplicity */}

			{/* Note: Typing indicator is now shown in the header and message area */}
		</Box>
	);
};

export default MessageInput;
