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
import { Phone, Video, MoreVertical, Info } from "lucide-react";
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
}

const MessageList: React.FC<MessageListProps> = ({
	conversation,
	onConversationUpdate,
}) => {
	const { user } = useSelector((state: RootState) => state.auth);
	const { onNewMessage, typingUsers, onlineUsers } = useMessage();

	// State
	const [messages, setMessages] = useState<Message[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

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
	console.log('🔍 MessageList Online Status Debug:', {
		currentUserId: user?.id,
		otherParticipantId: otherParticipant?.user._id,
		otherParticipantName: otherParticipant?.user.name,
		isOtherUserOnline,
		onlineUsersMap: Array.from(onlineUsers.entries()),
		otherUserStatus: otherParticipant ? onlineUsers.get(otherParticipant.user._id) : null
	});

	// Check if other user is typing
	const isOtherUserTyping = Array.from(typingUsers.values()).some(
		(indicator) =>
			indicator.conversationId === conversation._id &&
			indicator.userId !== user?.id &&
			indicator.isTyping
	);

	// Load messages
	useEffect(() => {
		if (messagesData?.data) {
			if (page === 1) {
				setMessages(messagesData.data);
			} else {
				setMessages((prev) => [...messagesData.data, ...prev]);
			}
			setHasMore(messagesData.pagination.hasMore);
		}
	}, [messagesData, page]);

	// Handle new messages
	useEffect(() => {
		const handleNewMessage = (message: Message) => {
			if (message.conversationId === conversation._id) {
				setMessages((prev) => [...prev, message]);
				scrollToBottom();
			}
		};

		onNewMessage(handleNewMessage);
	}, [conversation._id, onNewMessage]);

	// Mark conversation as read when opened
	useEffect(() => {
		markAsRead(conversation._id);
	}, [conversation._id, markAsRead]);

	// Scroll to bottom on new messages
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
		setMessages((prev) => [...prev, message]);
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
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			{/* Chat Header */}
			<Paper
				elevation={1}
				sx={{
					p: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderRadius: 0,
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Avatar
						src={otherParticipant?.user.profileImage}
						sx={{ width: 40, height: 40 }}
					>
						{otherParticipant?.user.name.charAt(0).toUpperCase()}
					</Avatar>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 600 }}>
							{otherParticipant?.user.name || "Unknown User"}
						</Typography>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Typography
								variant="caption"
								color={isOtherUserOnline ? "success.main" : "text.secondary"}
							>
								{isOtherUserOnline ? "Online" : "Offline"}
							</Typography>
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

				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<IconButton size="small">
						<Phone size={20} />
					</IconButton>
					<IconButton size="small">
						<Video size={20} />
					</IconButton>
					<IconButton size="small">
						<Info size={20} />
					</IconButton>
					<IconButton size="small">
						<MoreVertical size={20} />
					</IconButton>
				</Box>
			</Paper>

			{/* Context Information */}
			{(conversation.relatedDonation || conversation.relatedCause) && (
				<Paper
					sx={{
						p: 2,
						m: 2,
						backgroundColor: "primary.50",
						border: 1,
						borderColor: "primary.200",
					}}
				>
					<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
						Conversation Context
					</Typography>
					{conversation.relatedDonation && (
						<Typography variant="body2" color="text.secondary">
							💰 Related to donation: {conversation.relatedDonation.cause}
							{conversation.relatedDonation.amount &&
								` (₹${conversation.relatedDonation.amount})`}
						</Typography>
					)}
					{conversation.relatedCause && (
						<Typography variant="body2" color="text.secondary">
							❤️ Related to cause: {conversation.relatedCause.title}
						</Typography>
					)}
				</Paper>
			)}

			{/* Messages Container */}
			<Box
				ref={messagesContainerRef}
				onScroll={handleScroll}
				sx={{
					flex: 1,
					overflow: "auto",
					p: 2,
					display: "flex",
					flexDirection: "column",
					gap: 1,
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
						{messages.map((message, index) => {
							const isOwn = message.sender._id === user?.id;
							const showAvatar =
								index === messages.length - 1 ||
								messages[index + 1]?.sender._id !== message.sender._id;

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
									p: 2,
									ml: 1,
								}}
							>
								<Avatar
									src={otherParticipant?.user.profileImage}
									sx={{ width: 24, height: 24 }}
								>
									{otherParticipant?.user.name.charAt(0).toUpperCase()}
								</Avatar>
								<Typography variant="body2" color="text.secondary">
									{otherParticipant?.user.name} is typing...
								</Typography>
							</Box>
						)}

						{/* Scroll anchor */}
						<div ref={messagesEndRef} />
					</>
				)}
			</Box>

			{/* Message Input */}
			<MessageInput
				conversation={conversation}
				onMessageSent={handleMessageSent}
			/>
		</Box>
	);
};

export default MessageList;
