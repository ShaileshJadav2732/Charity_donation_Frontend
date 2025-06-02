"use client";

import React, { useState, useRef, useCallback } from "react";
import {
	Box,
	TextField,
	IconButton,
	Paper,
	Typography,
	Chip,
	CircularProgress,
} from "@mui/material";
import {
	Send,
	Paperclip,
	Image,
	Smile,
	X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSendMessageMutation } from "@/store/api/messageApi";
import { useMessage } from "@/contexts/MessageContext";
import { Conversation, Message } from "@/types/message";
import toast from "react-hot-toast";

interface MessageInputProps {
	conversation: Conversation;
	onMessageSent: (message: Message) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
	conversation,
	onMessageSent,
}) => {
	const { user } = useSelector((state: RootState) => state.auth);
	const { sendTypingIndicator } = useMessage();
	
	// State
	const [message, setMessage] = useState("");
	const [attachments, setAttachments] = useState<File[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	
	// Refs
	const fileInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
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

	// Handle file selection
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const validFiles = files.filter(file => {
			// Check file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				toast.error(`File ${file.name} is too large. Max size is 10MB.`);
				return false;
			}
			return true;
		});

		setAttachments(prev => [...prev, ...validFiles]);
		
		// Reset input
		if (e.target) {
			e.target.value = "";
		}
	};

	// Remove attachment
	const removeAttachment = (index: number) => {
		setAttachments(prev => prev.filter((_, i) => i !== index));
	};

	// Send message
	const handleSendMessage = async () => {
		const trimmedMessage = message.trim();
		
		if (!trimmedMessage && attachments.length === 0) {
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
				messageType: attachments.length > 0 ? "file" : "text",
				attachments: attachments.length > 0 ? attachments : undefined,
			}).unwrap();

			// Clear input
			setMessage("");
			setAttachments([]);
			
			// Notify parent component
			onMessageSent(result.data);
			
		} catch (error: any) {
			toast.error(error?.data?.message || "Failed to send message");
		}
	};

	// Handle key press
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// Format file size
	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	return (
		<Paper
			elevation={1}
			sx={{
				p: 2,
				borderRadius: 0,
				borderTop: 1,
				borderColor: "divider",
			}}
		>
			{/* Attachments Preview */}
			{attachments.length > 0 && (
				<Box sx={{ mb: 2 }}>
					<Typography variant="subtitle2" sx={{ mb: 1 }}>
						Attachments ({attachments.length})
					</Typography>
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
						{attachments.map((file, index) => (
							<Chip
								key={index}
								label={`${file.name} (${formatFileSize(file.size)})`}
								onDelete={() => removeAttachment(index)}
								deleteIcon={<X size={16} />}
								variant="outlined"
								sx={{ maxWidth: 200 }}
							/>
						))}
					</Box>
				</Box>
			)}

			{/* Message Input */}
			<Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
				{/* File Attachments */}
				<IconButton
					size="small"
					onClick={() => fileInputRef.current?.click()}
					disabled={isSending}
				>
					<Paperclip size={20} />
				</IconButton>

				{/* Image Attachments */}
				<IconButton
					size="small"
					onClick={() => imageInputRef.current?.click()}
					disabled={isSending}
				>
					<Image size={20} />
				</IconButton>

				{/* Message Text Field */}
				<TextField
					fullWidth
					multiline
					maxRows={4}
					placeholder={`Message ${otherParticipant?.user.name || "recipient"}...`}
					value={message}
					onChange={handleMessageChange}
					onKeyPress={handleKeyPress}
					disabled={isSending}
					variant="outlined"
					size="small"
					sx={{
						"& .MuiOutlinedInput-root": {
							borderRadius: 3,
						},
					}}
				/>

				{/* Emoji Button */}
				<IconButton size="small" disabled={isSending}>
					<Smile size={20} />
				</IconButton>

				{/* Send Button */}
				<IconButton
					color="primary"
					onClick={handleSendMessage}
					disabled={isSending || (!message.trim() && attachments.length === 0)}
					sx={{
						backgroundColor: "primary.main",
						color: "white",
						"&:hover": {
							backgroundColor: "primary.dark",
						},
						"&:disabled": {
							backgroundColor: "grey.300",
							color: "grey.500",
						},
					}}
				>
					{isSending ? (
						<CircularProgress size={20} color="inherit" />
					) : (
						<Send size={20} />
					)}
				</IconButton>
			</Box>

			{/* Hidden File Inputs */}
			<input
				ref={fileInputRef}
				type="file"
				multiple
				style={{ display: "none" }}
				onChange={handleFileSelect}
				accept="*/*"
			/>
			
			<input
				ref={imageInputRef}
				type="file"
				multiple
				style={{ display: "none" }}
				onChange={handleFileSelect}
				accept="image/*"
			/>

			{/* Typing Indicator */}
			{isTyping && (
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ mt: 1, display: "block" }}
				>
					Typing...
				</Typography>
			)}
		</Paper>
	);
};

export default MessageInput;
