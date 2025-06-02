"use client";

import React, { useState } from "react";
import {
	Box,
	Typography,
	Avatar,
	IconButton,
	Menu,
	MenuItem,
	Paper,
	Chip,
	Link,
} from "@mui/material";
import {
	MoreVertical,
	Reply,
	Edit,
	Delete,
	Copy,
	Check,
	CheckCheck,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	useDeleteMessageMutation,
	useEditMessageMutation,
} from "@/store/api/messageApi";
import { Message } from "@/types/message";
import toast from "react-hot-toast";

interface MessageBubbleProps {
	message: Message;
	isOwn: boolean;
	showAvatar: boolean;
	onMessageUpdate: (message: Message) => void;
	onReply?: (message: Message) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
	message,
	isOwn,
	showAvatar,
	onMessageUpdate,
	onReply,
}) => {
	const { user } = useSelector((state: RootState) => state.auth);
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(message.content);

	const [deleteMessage] = useDeleteMessageMutation();
	const [editMessage] = useEditMessageMutation();

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		setMenuAnchor(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
	};

	const handleCopyMessage = () => {
		navigator.clipboard.writeText(message.content);
		toast.success("Message copied to clipboard");
		handleMenuClose();
	};

	const handleDeleteMessage = async () => {
		try {
			await deleteMessage({
				messageId: message._id,
				conversationId: message.conversationId,
			}).unwrap();
			toast.success("Message deleted");
		} catch (error) {
			toast.error("Failed to delete message");
		}
		handleMenuClose();
	};

	const handleEditMessage = async () => {
		if (editContent.trim() === message.content) {
			setIsEditing(false);
			return;
		}

		try {
			const result = await editMessage({
				messageId: message._id,
				content: editContent.trim(),
				conversationId: message.conversationId,
			}).unwrap();

			onMessageUpdate(result.data);
			toast.success("Message updated");
			setIsEditing(false);
		} catch (error) {
			toast.error("Failed to update message");
		}
		handleMenuClose();
	};

	const handleStartEdit = () => {
		setIsEditing(true);
		handleMenuClose();
	};

	const formatMessageTime = (timestamp: string) => {
		const messageDate = new Date(timestamp);
		const now = new Date();
		const diffInHours =
			(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return format(messageDate, "HH:mm");
		} else if (diffInHours < 168) {
			// 7 days
			return format(messageDate, "EEE HH:mm");
		} else {
			return format(messageDate, "MMM dd, HH:mm");
		}
	};

	const renderMessageContent = () => {
		if (message.messageType === "system") {
			return (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						my: 2,
					}}
				>
					<Chip
						label={message.content}
						size="small"
						variant="outlined"
						sx={{
							backgroundColor: "background.paper",
							fontSize: "0.75rem",
						}}
					/>
				</Box>
			);
		}

		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: isOwn ? "row-reverse" : "row",
					alignItems: "flex-end",
					gap: 1,
					mb: 1,
				}}
			>
				{/* Avatar */}
				{showAvatar && !isOwn && (
					<Avatar
						src={message.sender.profileImage}
						sx={{ width: 32, height: 32 }}
					>
						{message.sender.name.charAt(0).toUpperCase()}
					</Avatar>
				)}

				{/* Message Bubble */}
				<Box
					sx={{
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: isOwn ? "flex-end" : "flex-start",
					}}
				>
					{/* Reply context */}
					{message.replyTo && (
						<Paper
							sx={{
								p: 1,
								mb: 1,
								backgroundColor: "grey.100",
								borderLeft: 3,
								borderColor: "primary.main",
								maxWidth: "100%",
							}}
						>
							<Typography variant="caption" color="text.secondary">
								Replying to previous message
							</Typography>
						</Paper>
					)}

					{/* Message Content */}
					<Paper
						elevation={1}
						sx={{
							p: 2.5,
							backgroundColor: isOwn ? "#2c7a72" : "background.paper",
							color: isOwn ? "white" : "text.primary",
							borderRadius: 3,
							borderTopLeftRadius: !isOwn && showAvatar ? 0 : 3,
							borderTopRightRadius: isOwn && showAvatar ? 0 : 3,
							position: "relative",
							maxWidth: "85%",
							width: "fit-content",
							minWidth: "200px",
							boxShadow: isOwn
								? "0 4px 20px rgba(44, 122, 114, 0.2)"
								: "0 2px 12px rgba(0, 0, 0, 0.08)",
							"&:hover .message-actions": {
								opacity: 1,
							},
							"&:hover": {
								transform: "translateY(-1px)",
								boxShadow: isOwn
									? "0 6px 25px rgba(44, 122, 114, 0.25)"
									: "0 4px 16px rgba(0, 0, 0, 0.12)",
							},
							transition: "all 0.2s ease-in-out",
						}}
					>
						{isEditing ? (
							<Box>
								<textarea
									value={editContent}
									onChange={(e) => setEditContent(e.target.value)}
									style={{
										width: "100%",
										minHeight: "60px",
										border: "none",
										outline: "none",
										resize: "vertical",
										backgroundColor: "transparent",
										color: "inherit",
										fontFamily: "inherit",
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleEditMessage();
										}
										if (e.key === "Escape") {
											setIsEditing(false);
											setEditContent(message.content);
										}
									}}
									autoFocus
								/>
								<Box sx={{ display: "flex", gap: 1, mt: 1 }}>
									<Typography
										variant="caption"
										sx={{ cursor: "pointer", color: "primary.light" }}
										onClick={handleEditMessage}
									>
										Save
									</Typography>
									<Typography
										variant="caption"
										sx={{ cursor: "pointer", color: "text.secondary" }}
										onClick={() => {
											setIsEditing(false);
											setEditContent(message.content);
										}}
									>
										Cancel
									</Typography>
								</Box>
							</Box>
						) : (
							<>
								<Typography variant="body1" sx={{ wordBreak: "break-word" }}>
									{message.content}
								</Typography>

								{/* File attachments removed for simplicity */}

								{/* Message Actions */}
								<IconButton
									className="message-actions"
									size="small"
									onClick={handleMenuOpen}
									sx={{
										position: "absolute",
										top: -8,
										right: isOwn ? -8 : "auto",
										left: isOwn ? "auto" : -8,
										opacity: 0,
										transition: "opacity 0.2s",
										backgroundColor: "background.paper",
										"&:hover": {
											backgroundColor: "action.hover",
										},
									}}
								>
									<MoreVertical size={16} />
								</IconButton>
							</>
						)}
					</Paper>

					{/* Message Info */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							mt: 0.5,
							px: 1,
						}}
					>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontSize: "0.7rem" }}
						>
							{formatMessageTime(message.createdAt)}
						</Typography>

						{message.editedAt && (
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ fontSize: "0.7rem" }}
							>
								(edited)
							</Typography>
						)}

						{/* Read status for own messages */}
						{isOwn && (
							<Box sx={{ display: "flex", alignItems: "center" }}>
								{message.isRead ? (
									<CheckCheck size={12} color="#4caf50" />
								) : (
									<Check size={12} color="#9e9e9e" />
								)}
							</Box>
						)}
					</Box>
				</Box>
			</Box>
		);
	};

	return (
		<>
			{renderMessageContent()}

			{/* Context Menu */}
			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
				onClose={handleMenuClose}
				PaperProps={{
					sx: { minWidth: 150 },
				}}
			>
				<MenuItem onClick={handleCopyMessage}>
					<Copy size={16} style={{ marginRight: 8 }} />
					Copy
				</MenuItem>

				<MenuItem onClick={() => console.log("Reply to message")}>
					<Reply size={16} style={{ marginRight: 8 }} />
					Reply
				</MenuItem>

				{isOwn && (
					<MenuItem onClick={handleStartEdit}>
						<Edit size={16} style={{ marginRight: 8 }} />
						Edit
					</MenuItem>
				)}

				{isOwn && (
					<MenuItem onClick={handleDeleteMessage} sx={{ color: "error.main" }}>
						<Delete size={16} style={{ marginRight: 8 }} />
						Delete
					</MenuItem>
				)}
			</Menu>
		</>
	);
};

export default MessageBubble;
