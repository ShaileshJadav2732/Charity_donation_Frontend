"use client";

import React, { useState } from "react";
import {
	Box,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Avatar,
	Typography,
	TextField,
	InputAdornment,
	Badge,
	Chip,
	CircularProgress,
	IconButton,
	Menu,
	MenuItem,
} from "@mui/material";
import {
	Search,
	MessageCircle,
	MoreVertical,
	Archive,
	Delete,
	Circle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useMessage } from "@/contexts/MessageContext";
import { Conversation } from "@/types/message";

interface ConversationListProps {
	conversations: Conversation[];
	selectedConversation: Conversation | null;
	onConversationSelect: (conversation: Conversation) => void;
	isLoading: boolean;
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
	conversations,
	selectedConversation,
	onConversationSelect,
	isLoading,
	searchQuery,
	onSearchChange,
}) => {
	const { user } = useSelector((state: RootState) => state.auth);
	const { onlineUsers } = useMessage();
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const [selectedConvForMenu, setSelectedConvForMenu] = useState<Conversation | null>(null);

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, conversation: Conversation) => {
		event.stopPropagation();
		setMenuAnchor(event.currentTarget);
		setSelectedConvForMenu(conversation);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
		setSelectedConvForMenu(null);
	};

	const getOtherParticipant = (conversation: Conversation) => {
		return conversation.participants.find((p) => p.user._id !== user?.id);
	};

	const isUserOnline = (userId: string) => {
		const userStatus = onlineUsers.get(userId);
		return userStatus?.isOnline || false;
	};

	const getUnreadCount = (conversation: Conversation) => {
		// This would typically come from the API
		// For now, we'll use a simple check based on lastMessage
		if (!conversation.lastMessage) return 0;
		
		const currentUserParticipant = conversation.participants.find(
			(p) => p.user._id === user?.id
		);
		
		if (!currentUserParticipant?.lastReadAt) return 1;
		
		const lastReadTime = new Date(currentUserParticipant.lastReadAt);
		const lastMessageTime = new Date(conversation.lastMessage.createdAt);
		
		return lastMessageTime > lastReadTime ? 1 : 0;
	};

	const formatLastMessageTime = (timestamp: string) => {
		try {
			return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
		} catch {
			return "";
		}
	};

	const truncateMessage = (message: string, maxLength: number = 50) => {
		if (message.length <= maxLength) return message;
		return message.substring(0, maxLength) + "...";
	};

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: 200,
				}}
			>
				<CircularProgress size={40} />
			</Box>
		);
	}

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			{/* Search Bar */}
			<Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
				<TextField
					fullWidth
					size="small"
					placeholder="Search conversations..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search size={20} />
							</InputAdornment>
						),
					}}
					sx={{
						"& .MuiOutlinedInput-root": {
							borderRadius: 3,
						},
					}}
				/>
			</Box>

			{/* Conversation List */}
			<Box sx={{ flex: 1, overflow: "auto" }}>
				{conversations.length === 0 ? (
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
						<MessageCircle size={48} color="#ccc" />
						<Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
							No conversations yet
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Start a conversation by messaging a donor or organization
						</Typography>
					</Box>
				) : (
					<List sx={{ p: 0 }}>
						{conversations.map((conversation) => {
							const otherParticipant = getOtherParticipant(conversation);
							const unreadCount = getUnreadCount(conversation);
							const isSelected = selectedConversation?._id === conversation._id;
							const isOnline = otherParticipant ? isUserOnline(otherParticipant.user._id) : false;

							if (!otherParticipant) return null;

							return (
								<ListItem
									key={conversation._id}
									onClick={() => onConversationSelect(conversation)}
									sx={{
										cursor: "pointer",
										backgroundColor: isSelected ? "action.selected" : "transparent",
										borderLeft: isSelected ? 3 : 0,
										borderColor: "primary.main",
										"&:hover": {
											backgroundColor: "action.hover",
										},
										py: 2,
									}}
								>
									<ListItemAvatar>
										<Badge
											overlap="circular"
											anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
											badgeContent={
												isOnline ? (
													<Circle
														size={12}
														fill="#4caf50"
														color="#4caf50"
													/>
												) : null
											}
										>
											<Avatar
												src={otherParticipant.user.profileImage}
												sx={{
													width: 48,
													height: 48,
													bgcolor: "primary.main",
												}}
											>
												{otherParticipant.user.name.charAt(0).toUpperCase()}
											</Avatar>
										</Badge>
									</ListItemAvatar>

									<ListItemText
										primary={
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													mb: 0.5,
												}}
											>
												<Typography
													variant="subtitle1"
													sx={{
														fontWeight: unreadCount > 0 ? 600 : 400,
														color: unreadCount > 0 ? "text.primary" : "text.primary",
													}}
												>
													{otherParticipant.user.name}
												</Typography>
												<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
													{conversation.lastMessage && (
														<Typography
															variant="caption"
															color="text.secondary"
															sx={{ fontSize: "0.75rem" }}
														>
															{formatLastMessageTime(conversation.lastMessage.createdAt)}
														</Typography>
													)}
													<IconButton
														size="small"
														onClick={(e) => handleMenuOpen(e, conversation)}
														sx={{ opacity: 0.7 }}
													>
														<MoreVertical size={16} />
													</IconButton>
												</Box>
											</Box>
										}
										secondary={
											<Box>
												<Box
													sx={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														mb: 0.5,
													}}
												>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{
															fontWeight: unreadCount > 0 ? 500 : 400,
														}}
													>
														{conversation.lastMessage
															? truncateMessage(conversation.lastMessage.content)
															: "No messages yet"}
													</Typography>
													{unreadCount > 0 && (
														<Badge
															badgeContent={unreadCount}
															color="primary"
															sx={{
																"& .MuiBadge-badge": {
																	fontSize: "0.75rem",
																	minWidth: 20,
																	height: 20,
																},
															}}
														/>
													)}
												</Box>
												
												{/* Related context chips */}
												<Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
													{conversation.relatedDonation && (
														<Chip
															label={`Donation: ${conversation.relatedDonation.cause}`}
															size="small"
															variant="outlined"
															sx={{ fontSize: "0.7rem", height: 20 }}
														/>
													)}
													{conversation.relatedCause && (
														<Chip
															label={`Cause: ${conversation.relatedCause.title}`}
															size="small"
															variant="outlined"
															sx={{ fontSize: "0.7rem", height: 20 }}
														/>
													)}
													<Chip
														label={otherParticipant.user.role}
														size="small"
														color={otherParticipant.user.role === "organization" ? "primary" : "secondary"}
														sx={{ fontSize: "0.7rem", height: 20 }}
													/>
												</Box>
											</Box>
										}
									/>
								</ListItem>
							);
						})}
					</List>
				)}
			</Box>

			{/* Context Menu */}
			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleMenuClose}>
					<Archive size={16} style={{ marginRight: 8 }} />
					Archive
				</MenuItem>
				<MenuItem onClick={handleMenuClose}>
					<Delete size={16} style={{ marginRight: 8 }} />
					Delete
				</MenuItem>
			</Menu>
		</Box>
	);
};

export default ConversationList;
