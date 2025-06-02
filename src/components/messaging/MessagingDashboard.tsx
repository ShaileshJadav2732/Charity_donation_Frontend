"use client";

import React, { useState, useEffect } from "react";
import {
	Box,
	Grid,
	Paper,
	Typography,
	IconButton,
	Badge,
	useTheme,
	useMediaQuery,
	Drawer,
} from "@mui/material";
import {
	MessageCircle,
	Users,
	Search,
	Menu,
	X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useGetConversationsQuery, useGetUnreadCountQuery } from "@/store/api/messageApi";
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
	const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// API queries
	const {
		data: conversationsData,
		isLoading: conversationsLoading,
		refetch: refetchConversations,
	} = useGetConversationsQuery({
		page: 1,
		limit: 50,
		search: searchQuery || undefined,
	});

	const { data: unreadCountData } = useGetUnreadCountQuery();

	// Message context
	const { onNewMessage, joinConversation, leaveConversation } = useMessage();

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

	// Handle new messages
	useEffect(() => {
		const handleNewMessage = () => {
			refetchConversations();
		};

		onNewMessage(handleNewMessage);
	}, [onNewMessage, refetchConversations]);

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
								? selectedConversation.participants
									.find((p) => p.user._id !== user?.id)?.user.name || "Unknown"
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
								refetchConversations();
							}}
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
					PaperProps={{
						sx: { width: "80%", maxWidth: 400 },
					}}
				>
					{conversationListContent}
				</Drawer>
			</Box>
		);
	}

	// Desktop Layout
	return (
		<Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
			{/* Desktop Header */}
			<Paper
				elevation={1}
				sx={{
					p: 3,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderRadius: 0,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<MessageCircle size={24} color={theme.palette.primary.main} />
					<Typography variant="h5" sx={{ fontWeight: 600 }}>
						Messages
					</Typography>
				</Box>
				
				<Badge badgeContent={unreadCountData?.count || 0} color="error">
					<Users size={24} color={theme.palette.grey[600]} />
				</Badge>
			</Paper>

			{/* Desktop Content */}
			<Grid container sx={{ flex: 1, overflow: "hidden" }}>
				{/* Conversation List */}
				<Grid item xs={4} sx={{ borderRight: 1, borderColor: "divider" }}>
					{conversationListContent}
				</Grid>

				{/* Message Area */}
				<Grid item xs={8}>
					{selectedConversation ? (
						<MessageList
							conversation={selectedConversation}
							onConversationUpdate={(updated) => {
								setSelectedConversation(updated);
								refetchConversations();
							}}
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
							}}
						>
							<MessageCircle size={80} color={theme.palette.grey[400]} />
							<Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
								Welcome to Messages
							</Typography>
							<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
								Select a conversation from the list to start messaging with donors and organizations.
							</Typography>
							<Typography variant="body2" color="text.secondary">
								You can discuss donations, ask questions, and coordinate pickups directly here.
							</Typography>
						</Box>
					)}
				</Grid>
			</Grid>
		</Box>
	);
};

export default MessagingDashboard;
