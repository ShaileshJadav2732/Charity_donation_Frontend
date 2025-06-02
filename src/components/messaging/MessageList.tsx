"use client";

import React, { useState, useEffect, useRef } from "react";
import {
	Box,
	Typography,
	CircularProgress,
	Alert,
	Paper,
	Avatar,
	IconButton,
	Chip,
} from "@mui/material";
import { Info } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	useGetMessagesQuery,
	useMarkConversationAsReadMutation,
} from "@/store/api/messageApi";
import { useMessage } from "@/contexts/MessageContext";
import { Conversation, Message } from "@/types/message";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

interface MessageListProps {
	conversation: Conversation;
	onConversationUpdate: (conversation: Conversation) => void;
	onMarkAsRead?: () => void; // Optional callback for when conversation is marked as read
}

const MessageList: React.FC<MessageListProps> = ({
	conversation,
	onConversationUpdate,
	onMarkAsRead,
}) => {
	const { user } = useSelector((state: RootState) => state.auth);
	const { onNewMessage, typingUsers, onlineUsers } = useMessage();

	// State
	const [messages, setMessages] = useState<Message[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

	// Refs
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	// API
	const {
		data: messagesData,
		isLoading,
		error,
		refetch,
	} = useGetMessagesQuery({
		conversationId: conversation._id,
		page,
		limit: 50,
	});

	const [markAsRead] = useMarkConversationAsReadMutation();

	// Get other participant
	const otherParticipant = conversation.participants.find(
		(p) => p.user._id !== user?.id
	);

	// Check if other user is online
	const isOtherUserOnline = otherParticipant
		? onlineUsers.get(otherParticipant.user._id)?.isOnline || false
		: false;

	// Debug online status
	console.log("🔍 MessageList Online Status Debug:", {
		currentUserId: user?.id,
		otherParticipantId: otherParticipant?.user._id,
		otherParticipantName: otherParticipant?.user.name,
		isOtherUserOnline,
		onlineUsersMap: Array.from(onlineUsers.entries()),
		otherUserStatus: otherParticipant
			? onlineUsers.get(otherParticipant.user._id)
			: null,
	});

	// Check if other user is typing
	const isOtherUserTyping = Array.from(typingUsers.values()).some(
		(indicator) =>
			indicator.conversationId === conversation._id &&
			indicator.userId !== user?.id &&
			indicator.isTyping
	);

	// Helper function to deduplicate messages
	const deduplicateMessages = (messages: Message[]) => {
		const seen = new Set();
		const duplicates: string[] = [];

		const filtered = messages.filter((message) => {
			if (seen.has(message._id)) {
				duplicates.push(message._id);
				return false;
			}
			seen.add(message._id);
			return true;
		});

		if (duplicates.length > 0) {
			console.warn(
				`🔄 Removed ${duplicates.length} duplicate messages:`,
				duplicates
			);
		}

		return filtered;
	};

	// Load messages
	useEffect(() => {
		if (messagesData?.data) {
			if (page === 1) {
				setMessages(deduplicateMessages(messagesData.data));
			} else {
				setMessages((prev) =>
					deduplicateMessages([...messagesData.data, ...prev])
				);
			}
			setHasMore(messagesData.pagination.hasMore);
		}
	}, [messagesData, page]);

	// Handle new messages
	useEffect(() => {
		const handleNewMessage = (message: Message) => {
			if (message.conversationId === conversation._id) {
				setMessages((prev) => {
					// Check if message already exists
					const exists = prev.some((m) => m._id === message._id);
					if (exists) {
						console.warn(
							`🔄 Skipping duplicate real-time message: ${message._id}`
						);
						return prev;
					}
					return deduplicateMessages([...prev, message]);
				});
				scrollToBottom();
			}
		};

		onNewMessage(handleNewMessage);
	}, [conversation._id, onNewMessage]);

	// Mark conversation as read when opened
	useEffect(() => {
		const markConversationAsRead = async () => {
			try {
				await markAsRead(conversation._id);
				// Call the callback immediately - RTK Query will handle the cache update
				if (onMarkAsRead) {
					onMarkAsRead();
				}
			} catch (error) {
				console.error("Failed to mark conversation as read:", error);
			}
		};

		markConversationAsRead();
	}, [conversation._id, markAsRead, onMarkAsRead]);

	// Scroll to bottom when conversation changes (initial load)
	useEffect(() => {
		// Reset page to 1 when conversation changes
		setPage(1);
		setMessages([]);

		// Scroll to bottom after a delay to ensure messages are loaded
		const timeouts = [
			setTimeout(() => scrollToBottom(false), 100),
			setTimeout(() => scrollToBottom(false), 300),
			setTimeout(() => scrollToBottom(false), 500), // Multiple attempts
		];

		return () => {
			timeouts.forEach((timeout) => clearTimeout(timeout));
		};
	}, [conversation._id]); // Trigger when conversation changes

	// Also scroll when messages are first loaded
	useEffect(() => {
		if (messages.length > 0 && !isLoading) {
			// Delay to ensure all messages are rendered
			setTimeout(() => {
				scrollToBottom(false);
			}, 200);
		}
	}, [messages.length, isLoading]);

	// Scroll to bottom on new messages or typing indicator changes
	useEffect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	}, [messages, isOtherUserTyping]);

	const scrollToBottom = (smooth: boolean = true) => {
		// Primary method: scroll the container directly
		if (messagesContainerRef.current) {
			const container = messagesContainerRef.current;
			const scrollHeight = container.scrollHeight;
			const clientHeight = container.clientHeight;
			const maxScrollTop = scrollHeight - clientHeight;

			if (smooth) {
				container.scrollTo({
					top: maxScrollTop,
					behavior: "smooth",
				});
			} else {
				container.scrollTop = maxScrollTop;
			}
		}

		// Fallback method: use scroll anchor
		if (messagesEndRef.current) {
			try {
				messagesEndRef.current.scrollIntoView({
					behavior: smooth ? "smooth" : "auto",
					block: "end",
					inline: "nearest",
				});
			} catch (error) {
				console.warn("ScrollIntoView failed:", error);
			}
		}
	};

	const handleLoadMore = () => {
		if (hasMore && !isLoading) {
			setPage((prev) => prev + 1);
		}
	};

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop } = e.currentTarget;
		if (scrollTop === 0 && hasMore && !isLoading) {
			handleLoadMore();
		}
	};

	const handleMessageSent = (message: Message) => {
		setMessages((prev) => {
			// Check if message already exists
			const exists = prev.some((m) => m._id === message._id);
			if (exists) {
				console.warn(`🔄 Skipping duplicate sent message: ${message._id}`);
				return prev;
			}
			return deduplicateMessages([...prev, message]);
		});
		scrollToBottom();
		onConversationUpdate({
			...conversation,
			lastMessage: message,
		});
	};

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">
					Failed to load messages. Please try again.
				</Alert>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden", // Prevent whole component from scrolling
				position: "relative",
			}}
		>
			{/* Chat Header - Fixed Top */}
			<Paper
				elevation={0}
				sx={{
					p: 3,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderRadius: 0,
					borderBottom: "1px solid rgba(44, 122, 114, 0.1)",
					background: "#2c7a72",
					color: "white",
					boxShadow: "0 2px 20px rgba(44, 122, 114, 0.3)",
					flexShrink: 0, // Prevent header from shrinking
					zIndex: 10, // Above messages but below main header
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
					<Box sx={{ position: "relative" }}>
						<Avatar
							src={otherParticipant?.user.profileImage}
							sx={{
								width: 48,
								height: 48,
								border: "3px solid",
								borderColor: isOtherUserOnline
									? "#4caf50"
									: "rgba(255,255,255,0.3)",
								boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
								background: "linear-gradient(135deg, #2c7a72 0%, #1e5a54 100%)",
								color: "white",
								fontSize: "1.2rem",
								fontWeight: 600,
							}}
						>
							{otherParticipant?.user.name.charAt(0).toUpperCase()}
						</Avatar>
						{isOtherUserOnline && (
							<Box
								sx={{
									position: "absolute",
									bottom: 2,
									right: 2,
									width: 12,
									height: 12,
									borderRadius: "50%",
									backgroundColor: "#4caf50",
									border: "2px solid white",
									boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
								}}
							/>
						)}
					</Box>
					<Box>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 700,
								color: "white",
								mb: 0.5,
							}}
						>
							{otherParticipant?.user.name || "Unknown User"}
						</Typography>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							{/* Show typing indicator in header if user is typing */}
							{isOtherUserTyping ? (
								<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
									<Typography
										variant="caption"
										sx={{
											fontStyle: "italic",
											fontWeight: 500,
											color: "rgba(255,255,255,0.9)",
										}}
									>
										typing
									</Typography>
									{/* Animated dots in header */}
									<Box
										sx={{
											display: "flex",
											gap: 0.2,
											"& > span": {
												width: 3,
												height: 3,
												borderRadius: "50%",
												backgroundColor: "rgba(255,255,255,0.8)",
												animation: "headerTypingDots 1.4s infinite ease-in-out",
												"&:nth-of-type(1)": { animationDelay: "0s" },
												"&:nth-of-type(2)": { animationDelay: "0.2s" },
												"&:nth-of-type(3)": { animationDelay: "0.4s" },
											},
											"@keyframes headerTypingDots": {
												"0%, 80%, 100%": {
													opacity: 0.3,
													transform: "scale(0.8)",
												},
												"40%": { opacity: 1, transform: "scale(1)" },
											},
										}}
									>
										<span />
										<span />
										<span />
									</Box>
								</Box>
							) : (
								<Typography
									variant="caption"
									sx={{
										color: isOtherUserOnline
											? "#4caf50"
											: "rgba(255,255,255,0.7)",
									}}
								>
									{isOtherUserOnline ? "Online" : "Offline"}
								</Typography>
							)}
							<Chip
								label={otherParticipant?.user.role || "Unknown"}
								size="small"
								color={
									otherParticipant?.user.role === "organization"
										? "primary"
										: "secondary"
								}
								sx={{ fontSize: "0.7rem", height: 20 }}
							/>
						</Box>
					</Box>
				</Box>
			</Paper>

			{/* Context Information - More Compact */}
			{(conversation.relatedDonation || conversation.relatedCause) && (
				<Box
					sx={{
						px: 1.5,
						py: 0.5,
						mx: 2,
						borderRadius: 1,
						background: "rgba(102, 126, 234, 0.05)",
						border: "1px solid rgba(102, 126, 234, 0.15)",
						display: "flex",
						alignItems: "center",
						gap: 0.5,
						flexWrap: "wrap",
						flexShrink: 0, // Prevent from shrinking
					}}
				>
					<Info size={12} color="#667eea" />
					{conversation.relatedDonation && (
						<Typography
							variant="caption"
							sx={{
								fontWeight: 500,
								color: "#667eea",
								fontSize: "0.7rem",
							}}
						>
							💰 Donation: {conversation.relatedDonation.cause}
							{conversation.relatedDonation.amount &&
								` (₹${conversation.relatedDonation.amount})`}
						</Typography>
					)}
					{conversation.relatedDonation && conversation.relatedCause && (
						<Typography variant="caption" sx={{ color: "#667eea", mx: 0.3 }}>
							•
						</Typography>
					)}
					{conversation.relatedCause && (
						<Typography
							variant="caption"
							sx={{
								fontWeight: 500,
								color: "#667eea",
								fontSize: "0.7rem",
							}}
						>
							❤️ Cause: {conversation.relatedCause.title}
						</Typography>
					)}
				</Box>
			)}

			{/* Messages Container - Scrollable Middle Area */}
			<Box
				ref={messagesContainerRef}
				onScroll={handleScroll}
				sx={{
					flex: 1,
					overflow: "auto",
					p: 3,
					pb: 4, // Extra bottom padding for typing indicator
					display: "flex",
					flexDirection: "column",
					gap: 2,
					background:
						"linear-gradient(135deg, rgba(240,249,255,0.5) 0%, rgba(255,255,255,0.8) 100%)",
					backgroundImage: `
						radial-gradient(circle at 20% 80%, rgba(44, 122, 114, 0.03) 0%, transparent 50%),
						radial-gradient(circle at 80% 20%, rgba(30, 90, 84, 0.03) 0%, transparent 50%),
						radial-gradient(circle at 40% 40%, rgba(44, 122, 114, 0.02) 0%, transparent 50%)
					`,
					// Hide scrollbar
					"&::-webkit-scrollbar": {
						display: "none",
					},
					msOverflowStyle: "none", // IE and Edge
					scrollbarWidth: "none", // Firefox
					minHeight: 0, // Allow flex item to shrink
				}}
			>
				{/* Load More Indicator */}
				{isLoading && page > 1 && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
						<CircularProgress size={24} />
					</Box>
				)}

				{/* Initial Loading */}
				{isLoading && page === 1 ? (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "100%",
						}}
					>
						<CircularProgress />
					</Box>
				) : (
					<>
						{/* Messages */}
						{deduplicateMessages(messages).map((message, index) => {
							const isOwn = message.sender._id === user?.id;
							const showAvatar =
								index === messages.length - 1 ||
								messages[index + 1]?.sender._id !== message.sender._id;

							// Use message ID as key - it should be unique after deduplication
							return (
								<MessageBubble
									key={message._id}
									message={message}
									isOwn={isOwn}
									showAvatar={showAvatar}
									onMessageUpdate={(updatedMessage) => {
										setMessages((prev) =>
											prev.map((m) =>
												m._id === updatedMessage._id ? updatedMessage : m
											)
										);
									}}
									onReply={(message) => setReplyToMessage(message)}
								/>
							);
						})}

						{/* Typing Indicator */}
						{isOtherUserTyping && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
									p: 1.5,
									ml: 1,
									mb: 1,
									backgroundColor: "grey.50",
									borderRadius: 2,
									border: "1px solid",
									borderColor: "grey.200",
									animation: "fadeIn 0.3s ease-in-out",
									"@keyframes fadeIn": {
										from: { opacity: 0, transform: "translateY(10px)" },
										to: { opacity: 1, transform: "translateY(0)" },
									},
								}}
							>
								<Avatar
									src={otherParticipant?.user.profileImage}
									sx={{ width: 24, height: 24 }}
								>
									{otherParticipant?.user.name.charAt(0).toUpperCase()}
								</Avatar>
								<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ fontStyle: "italic" }}
									>
										{otherParticipant?.user.name} is typing
									</Typography>
									{/* Animated dots */}
									<Box
										sx={{
											display: "flex",
											gap: 0.3,
											"& > span": {
												width: 4,
												height: 4,
												borderRadius: "50%",
												backgroundColor: "text.secondary",
												animation: "typingDots 1.4s infinite ease-in-out",
												"&:nth-of-type(1)": { animationDelay: "0s" },
												"&:nth-of-type(2)": { animationDelay: "0.2s" },
												"&:nth-of-type(3)": { animationDelay: "0.4s" },
											},
											"@keyframes typingDots": {
												"0%, 80%, 100%": {
													opacity: 0.3,
													transform: "scale(0.8)",
												},
												"40%": { opacity: 1, transform: "scale(1)" },
											},
										}}
									>
										<span />
										<span />
										<span />
									</Box>
								</Box>
							</Box>
						)}

						{/* Scroll anchor */}
						<div
							ref={messagesEndRef}
							style={{
								height: "1px",
								width: "100%",
								marginTop: "8px", // Small margin to ensure it's visible
							}}
						/>
					</>
				)}
			</Box>

			{/* Message Input - Sticky Bottom */}
			<Box
				sx={{
					flexShrink: 0, // Prevent input from shrinking
					borderTop: "1px solid rgba(44, 122, 114, 0.1)",
					background: "rgba(255,255,255,0.98)",
					backdropFilter: "blur(20px)",
				}}
			>
				<MessageInput
					conversation={conversation}
					onMessageSent={handleMessageSent}
					replyToMessage={replyToMessage}
					onCancelReply={() => setReplyToMessage(null)}
				/>
			</Box>
		</Box>
	);
};

export default MessageList;
