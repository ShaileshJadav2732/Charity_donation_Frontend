"use client";

import { useMessage } from "@/contexts/MessageContext";
import { RootState } from "@/store/store";
import { Conversation } from "@/types/message";
import {
	Avatar,
	Badge,
	Box,
	CircularProgress,
	IconButton,
	InputAdornment,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Menu,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import {
	Archive,
	Delete,
	MessageCircle,
	MoreVertical,
	Search,
} from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";

interface ConversationListProps {
	conversations: Conversation[];
	selectedConversation: Conversation | null;
	onConversationSelect: (conversation: Conversation) => void;
	isLoading: boolean;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	lastReadUpdate?: number; // Timestamp to trigger re-renders when read status changes
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
	const [, setSelectedConvForMenu] = useState<Conversation | null>(null);

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		conversation: Conversation
	) => {
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
		// Check if this conversation is currently selected (should have 0 unread)
		if (selectedConversation?._id === conversation._id) {
			return 0;
		}

		// If no last message, no unread count
		if (!conversation.lastMessage) return 0;

		// Find current user's participant data
		const currentUserParticipant = conversation.participants.find(
			(p) => p.user._id === user?.id
		);

		// If no participant data or no lastReadAt, consider it unread
		if (!currentUserParticipant?.lastReadAt) return 1;

		// Compare timestamps
		const lastReadTime = new Date(currentUserParticipant.lastReadAt);
		const lastMessageTime = new Date(conversation.lastMessage.createdAt);

		// If last message is newer than last read time, it's unread
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
			<Box
				sx={{
					p: 3,
					borderBottom: "1px solid rgba(44, 122, 114, 0.1)",
					background:
						"linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,249,255,0.98) 100%)",
					backdropFilter: "blur(20px)",
				}}
			>
				<TextField
					fullWidth
					size="medium"
					placeholder="Search conversations..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position="start">
									<Box sx={{ color: "#2c7a72" }}>
										<Search size={20} />
									</Box>
								</InputAdornment>
							),
						},
					}}
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
			</Box>

			{/* Conversation List */}
			<Box
				sx={{
					flex: 1,
					overflow: "auto",
					// Hide scrollbar
					"&::-webkit-scrollbar": {
						display: "none",
					},
					msOverflowStyle: "none", // IE and Edge
					scrollbarWidth: "none", // Firefox
				}}
			>
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
							const isOnline = otherParticipant
								? isUserOnline(otherParticipant.user._id)
								: false;

							if (!otherParticipant) return null;

							return (
								<ListItem
									key={conversation._id}
									onClick={() => onConversationSelect(conversation)}
									sx={{
										cursor: "pointer",
										backgroundColor: isSelected
											? "linear-gradient(135deg, rgba(44, 122, 114, 0.1) 0%, rgba(30, 90, 84, 0.1) 100%)"
											: "transparent",
										borderLeft: isSelected ? 4 : 0,
										borderColor: "#2c7a72",
										borderRadius: isSelected ? "0 12px 12px 0" : 0,
										mx: isSelected ? 1 : 0,
										my: 0.5,
										"&:hover": {
											backgroundColor: isSelected
												? "linear-gradient(135deg, rgba(44, 122, 114, 0.15) 0%, rgba(30, 90, 84, 0.15) 100%)"
												: "linear-gradient(135deg, rgba(44, 122, 114, 0.05) 0%, rgba(30, 90, 84, 0.05) 100%)",
											borderRadius: "0 12px 12px 0",
											mx: 1,
											transform: "translateX(2px)",
										},
										py: 2.5,
										px: 2,
										transition: "all 0.2s ease-in-out",
										boxShadow: isSelected
											? "0 4px 20px rgba(44, 122, 114, 0.1)"
											: "none",
									}}
								>
									<ListItemAvatar>
										<Box sx={{ position: "relative" }}>
											<Avatar
												src={otherParticipant.user.profileImage}
												sx={{
													width: 52,
													height: 52,
													border: "3px solid",
													borderColor: isOnline
														? "#4caf50"
														: "rgba(44, 122, 114, 0.2)",
													boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
													background:
														"linear-gradient(135deg, #2c7a72 0%, #1e5a54 100%)",
													color: "white",
													fontSize: "1.2rem",
													fontWeight: 600,
													transition: "all 0.2s ease-in-out",
												}}
											>
												{otherParticipant.user.name.charAt(0).toUpperCase()}
											</Avatar>
											{isOnline && (
												<Box
													sx={{
														position: "absolute",
														bottom: 2,
														right: 2,
														width: 14,
														height: 14,
														borderRadius: "50%",
														backgroundColor: "#4caf50",
														border: "3px solid white",
														boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
													}}
												/>
											)}
											{unreadCount > 0 && (
												<Box
													sx={{
														position: "absolute",
														top: -2,
														right: -2,
														minWidth: 20,
														height: 20,
														borderRadius: "50%",
														backgroundColor: "#ff4757",
														color: "white",
														fontSize: "0.75rem",
														fontWeight: 600,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														border: "2px solid white",
														boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
													}}
												>
													{unreadCount > 9 ? "9+" : unreadCount}
												</Box>
											)}
										</Box>
									</ListItemAvatar>

									<ListItemText
										primary={
											<Box
												component="span"
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													mb: 0.5,
												}}
											>
												<Typography
													component="span"
													variant="subtitle1"
													sx={{
														fontWeight: unreadCount > 0 ? 600 : 400,
														color:
															unreadCount > 0 ? "text.primary" : "text.primary",
													}}
												>
													{otherParticipant.user.name}
												</Typography>
												<Box
													sx={{ display: "flex", alignItems: "center", gap: 1 }}
												>
													{conversation.lastMessage && (
														<Typography
															component="span"
															variant="caption"
															color="text.secondary"
															sx={{ fontSize: "0.75rem" }}
														>
															{formatLastMessageTime(
																conversation.lastMessage.createdAt
															)}
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
											<Box component="span">
												<Box
													component="span"
													sx={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														mb: 0.5,
													}}
												>
													<Typography
														component="span"
														variant="body2"
														color="text.secondary"
														sx={{
															fontWeight: unreadCount > 0 ? 500 : 400,
														}}
													>
														{conversation.lastMessage
															? truncateMessage(
																	conversation.lastMessage.content
															  )
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

												{/* Related context - Text only to avoid nesting issues */}
												<Box
													component="span"
													sx={{
														display: "flex",
														gap: 1,
														mt: 0.5,
														flexWrap: "wrap",
													}}
												>
													{conversation.relatedDonation && (
														<Typography
															component="span"
															variant="caption"
															sx={{
																fontSize: "0.7rem",
																color: "primary.main",
																fontWeight: 500,
															}}
														>
															💰 {conversation.relatedDonation.cause}
														</Typography>
													)}
													{conversation.relatedCause && (
														<Typography
															component="span"
															variant="caption"
															sx={{
																fontSize: "0.7rem",
																color: "primary.main",
																fontWeight: 500,
															}}
														>
															❤️ {conversation.relatedCause.title}
														</Typography>
													)}
													<Typography
														component="span"
														variant="caption"
														sx={{
															fontSize: "0.7rem",
															color:
																otherParticipant.user.role === "organization"
																	? "primary.main"
																	: "secondary.main",
															fontWeight: 500,
															textTransform: "capitalize",
														}}
													>
														👤 {otherParticipant.user.role}
													</Typography>
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
				<MenuItem
					onClick={() => {
						// Handle archive action for selectedConvForMenu
						// TODO: Implement archive functionality
						handleMenuClose();
					}}
				>
					<Archive size={16} style={{ marginRight: 8 }} />
					Archive
				</MenuItem>
				<MenuItem
					onClick={() => {
						// Handle delete action for selectedConvForMenu
						// TODO: Implement delete functionality
						handleMenuClose();
					}}
				>
					<Delete size={16} style={{ marginRight: 8 }} />
					Delete
				</MenuItem>
			</Menu>
		</Box>
	);
};

export default ConversationList;
