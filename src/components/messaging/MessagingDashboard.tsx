"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	IconButton,
	Typography,
	Paper,
	Badge,
	useTheme,
	useMediaQuery,
	Drawer,
} from "@mui/material";
import { Menu, X, MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	useGetConversationsQuery,
	useGetUnreadCountQuery,
} from "@/store/api/messageApi";
import { useMessage } from "@/contexts/MessageContext";
import ConversationList from "./ConversationList";
import MessageList from "./MessageList";
import { Conversation } from "@/types/message";

interface MessagingDashboardProps {
	initialConversationId?: string;
}

const MessagingDashboard: React.FC<MessagingDashboardProps> = ({
	initialConversationId,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const { user } = useSelector((state: RootState) => state.auth);

	// State
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [lastReadUpdate, setLastReadUpdate] = useState(0);

	// API queries
	const { data: conversationsData, isLoading: conversationsLoading } =
		useGetConversationsQuery({
			page: 1,
			limit: 50,
			search: searchQuery || undefined,
		});

	const { data: unreadCountData } = useGetUnreadCountQuery();

	// Message context
	const { onNewMessage, joinConversation, leaveConversation } = useMessage();

	// Function to trigger conversation list re-render when read status changes
	const triggerConversationUpdate = useCallback(() => {
		setLastReadUpdate(Date.now());
	}, []);

	// Set initial conversation
	useEffect(() => {
		if (initialConversationId && conversationsData?.data) {
			const conversation = conversationsData.data.find(
				(conv) => conv._id === initialConversationId
			);
			if (conversation) {
				setSelectedConversation(conversation);
			}
		}
	}, [initialConversationId, conversationsData]);

	// Handle new messages - RTK Query will automatically update the cache
	useEffect(() => {
		const handleNewMessage = () => {
			// No need to manually refetch - RTK Query handles cache updates automatically
			// The conversation list will update automatically when new messages arrive
		};

		onNewMessage(handleNewMessage);
	}, [onNewMessage]);

	// Join/leave conversation rooms
	useEffect(() => {
		if (selectedConversation) {
			joinConversation(selectedConversation._id);
			return () => leaveConversation(selectedConversation._id);
		}
	}, [selectedConversation, joinConversation, leaveConversation]);

	const handleConversationSelect = (conversation: Conversation) => {
		setSelectedConversation(conversation);
		if (isMobile) {
			setMobileDrawerOpen(false);
		}
	};

	const handleBackToList = () => {
		setSelectedConversation(null);
		if (isMobile) {
			setMobileDrawerOpen(true);
		}
	};

	const conversationListContent = (
		<ConversationList
			conversations={conversationsData?.data || []}
			selectedConversation={selectedConversation}
			onConversationSelect={handleConversationSelect}
			isLoading={conversationsLoading}
			searchQuery={searchQuery}
			onSearchChange={setSearchQuery}
			lastReadUpdate={lastReadUpdate}
		/>
	);

	if (isMobile) {
		return (
			<Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
				{/* Mobile Header */}
				<Paper
					elevation={1}
					sx={{
						p: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						borderRadius: 0,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						{selectedConversation && (
							<IconButton onClick={handleBackToList} size="small">
								<X size={20} />
							</IconButton>
						)}
						<Typography variant="h6" sx={{ fontWeight: 600 }}>
							{selectedConversation
								? selectedConversation.participants.find(
										(p) => p.user._id !== user?.id
								  )?.user.name || "Unknown"
								: "Messages"}
						</Typography>
					</Box>

					{!selectedConversation && (
						<Badge badgeContent={unreadCountData?.count || 0} color="error">
							<IconButton
								onClick={() => setMobileDrawerOpen(true)}
								size="small"
							>
								<Menu size={20} />
							</IconButton>
						</Badge>
					)}
				</Paper>

				{/* Mobile Content */}
				<Box sx={{ flex: 1, overflow: "hidden" }}>
					{selectedConversation ? (
						<MessageList
							conversation={selectedConversation}
							onConversationUpdate={(updated) => {
								setSelectedConversation(updated);
								// RTK Query will handle cache updates automatically
							}}
							onMarkAsRead={triggerConversationUpdate}
						/>
					) : (
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								height: "100%",
								p: 3,
								textAlign: "center",
							}}
						>
							<MessageCircle size={64} color={theme.palette.grey[400]} />
							<Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
								Select a conversation
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Choose a conversation from your message list to start chatting
							</Typography>
						</Box>
					)}
				</Box>

				{/* Mobile Drawer for Conversation List */}
				<Drawer
					anchor="left"
					open={mobileDrawerOpen}
					onClose={() => setMobileDrawerOpen(false)}
					slotProps={{
						paper: {
							sx: { width: "80%", maxWidth: 400 },
						},
					}}
				>
					{conversationListContent}
				</Drawer>
			</Box>
		);
	}

	// Desktop Layout
	return (
		<Box
			sx={{
				height: "calc(100vh - 90px)", // Account for main header
				display: "flex",
				background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
				overflow: "hidden", // Prevent any scrolling at this level
			}}
		>
			{/* Conversation List - Always Visible and Fixed */}
			<Box
				sx={{
					width: "350px",
					minWidth: "350px",
					maxWidth: "350px",
					borderRight: "1px solid rgba(44, 122, 114, 0.1)",
					background: "rgba(255,255,255,0.95)",
					backdropFilter: "blur(20px)",
					boxShadow: "inset -1px 0 0 rgba(44, 122, 114, 0.1)",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden", // Prevent sidebar from scrolling with content
				}}
			>
				{conversationListContent}
			</Box>

			{/* Message Area - Takes Remaining Space */}
			<Box
				sx={{
					flex: 1,
					background: "rgba(255,255,255,0.98)",
					backdropFilter: "blur(20px)",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden", // Prevent message area from scrolling as a whole
				}}
			>
				{selectedConversation ? (
					<MessageList
						conversation={selectedConversation}
						onConversationUpdate={(updated) => {
							setSelectedConversation(updated);
							// RTK Query will handle cache updates automatically
						}}
						onMarkAsRead={triggerConversationUpdate}
					/>
				) : (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							height: "100%",
							p: 4,
							textAlign: "center",
							background:
								"linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.95) 100%)",
						}}
					>
						<Box
							sx={{
								p: 4,
								borderRadius: 4,
								background: "linear-gradient(135deg, #2c7a72 0%, #1e5a54 100%)",
								color: "white",
								mb: 3,
								boxShadow: "0 8px 32px rgba(44, 122, 114, 0.3)",
							}}
						>
							<MessageCircle size={64} />
						</Box>
						<Typography
							variant="h4"
							sx={{
								mt: 2,
								mb: 2,
								fontWeight: 700,
								background: "linear-gradient(135deg, #2c7a72 0%, #1e5a54 100%)",
								backgroundClip: "text",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}
						>
							Welcome to Messages
						</Typography>
						<Typography
							variant="h6"
							color="text.secondary"
							sx={{ mb: 3, fontWeight: 400, maxWidth: 400 }}
						>
							Select a conversation from the list to start messaging with donors
							and organizations.
						</Typography>
						<Box
							sx={{
								p: 3,
								borderRadius: 3,
								background:
									"linear-gradient(135deg, rgba(44, 122, 114, 0.1) 0%, rgba(30, 90, 84, 0.1) 100%)",
								border: "1px solid rgba(44, 122, 114, 0.2)",
							}}
						>
							<Typography
								variant="body1"
								color="text.secondary"
								sx={{ fontWeight: 500 }}
							>
								💬 Discuss donations • ❓ Ask questions • 📦 Coordinate pickups
							</Typography>
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default MessagingDashboard;
