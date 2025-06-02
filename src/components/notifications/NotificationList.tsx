import React, { useState, useEffect } from "react";
import {
	List,
	ListItem,
	ListItemText,
	Typography,
	Box,
	IconButton,
	Card,
	CardContent,
	Badge,
	Divider,
	useTheme,
} from "@mui/material";
import {
	useGetNotificationsQuery,
	useMarkNotificationAsReadMutation,
	useDismissNotificationMutation,
} from "@/store/api/notificationApi";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	Bell as BellIcon,
	CheckCircle2 as CheckIcon,
	Trash2 as DeleteIcon,
	X as CloseIcon,
	AlertCircle as ErrorIcon,
	CheckCircle2 as SuccessIcon,
} from "lucide-react";

interface Notification {
	id: string;
	title: string;
	message: string;
	isRead: boolean;
	createdAt: string;
}

interface NotificationListProps {
	onClose?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
	const theme = useTheme();
	const { user } = useSelector((state: RootState) => state.auth);
	const [isAuthLoaded, setIsAuthLoaded] = useState(false);
	const userId = user?.id || "";

	useEffect(() => {
		if (user !== undefined) {
			setIsAuthLoaded(true);
		}
	}, [user]);

	const { data, isLoading, isError, error } = useGetNotificationsQuery(
		{ userId, limit: 5, unreadOnly: true },
		{ skip: !userId || !isAuthLoaded }
	);

	const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
	const [dismissNotification] = useDismissNotificationMutation();
	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			await markNotificationAsRead(notificationId).unwrap();
			setToast({ message: "Notification marked as read", type: "success" });
		} catch (err) {
			setToast({
				message: "Failed to mark notification as read",
				type: "error",
			});
		}
	};

	const handleDismiss = async (notificationId: string) => {
		try {
			await dismissNotification(notificationId).unwrap();
			setToast({ message: "Notification dismissed", type: "success" });
		} catch (err) {
			setToast({ message: "Failed to dismiss notification", type: "error" });
		}
	};

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	const notifications: Notification[] = data?.notifications || [];

	if (!isAuthLoaded) {
		return (
			<Card sx={{ width: 360, maxHeight: 500, boxShadow: 3 }}>
				<CardContent sx={{ textAlign: "center", py: 4 }}>
					<Typography variant="body1" fontFamily="'Inter', sans-serif">
						Loading authentication...
					</Typography>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			sx={{ width: 360, maxHeight: 500, boxShadow: 3, position: "relative" }}
		>
			<Box
				sx={{
					p: 2,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					borderBottom: `1px solid ${theme.palette.divider}`,
				}}
			>
				<Typography
					variant="h6"
					fontFamily="'Inter', sans-serif"
					fontWeight={600}
				>
					Notifications
				</Typography>
				<IconButton onClick={onClose} size="small">
					<CloseIcon size={20} />
				</IconButton>
			</Box>

			{toast && (
				<Box
					sx={{
						position: "absolute",
						top: 16,
						left: "50%",
						transform: "translateX(-50%)",
						px: 3,
						py: 1.5,
						borderRadius: 2,
						bgcolor: toast.type === "success" ? "success.light" : "error.light",
						color:
							toast.type === "success"
								? "success.contrastText"
								: "error.contrastText",
						boxShadow: 3,
						zIndex: 1000,
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					{toast.type === "success" ? (
						<SuccessIcon size={18} />
					) : (
						<ErrorIcon size={18} />
					)}
					<Typography variant="body2" fontFamily="'Inter', sans-serif">
						{toast.message}
					</Typography>
				</Box>
			)}

			<Box sx={{ maxHeight: 400, overflow: "auto" }}>
				{isLoading && (
					<Box sx={{ p: 3, textAlign: "center" }}>
						<Typography variant="body1" fontFamily="'Inter', sans-serif">
							Loading notifications...
						</Typography>
					</Box>
				)}

				{isError && (
					<Box sx={{ p: 3, textAlign: "center" }}>
						<Typography
							variant="body1"
							color="error.main"
							fontFamily="'Inter', sans-serif"
						>
							Error loading notifications
						</Typography>
					</Box>
				)}

				{!isLoading && !isError && (
					<List sx={{ py: 0 }}>
						{notifications.length === 0 ? (
							<ListItem>
								<ListItemText
									primary={
										<Typography
											variant="body1"
											textAlign="center"
											fontFamily="'Inter', sans-serif"
											sx={{ py: 2 }}
										>
											No new notifications
										</Typography>
									}
								/>
							</ListItem>
						) : (
							notifications.map((notification) => (
								<React.Fragment key={notification.id}>
									<ListItem
										sx={{
											py: 2,
											px: 2.5,
											bgcolor: notification.isRead
												? "transparent"
												: "action.selected",
											"&:hover": { bgcolor: "action.hover" },
											transition: "background-color 0.2s ease",
										}}
									>
										<ListItemText
											primary={
												<Typography
													variant="subtitle1"
													fontWeight={600}
													fontFamily="'Inter', sans-serif"
													sx={{ mb: 0.5 }}
												>
													{notification.title}
												</Typography>
											}
											secondary={
												<Box component="span">
													<Typography
														component="span"
														variant="body1"
														color="text.secondary"
														fontFamily="'Inter', sans-serif"
														sx={{ mb: 1, display: "block" }}
													>
														{notification.message}
													</Typography>
													<Typography
														component="span"
														variant="caption"
														color="text.secondary"
														fontFamily="'Inter', sans-serif"
														sx={{ display: "block" }}
													>
														{formatDistanceToNow(
															new Date(notification.createdAt),
															{
																addSuffix: true,
															}
														)}
													</Typography>
												</Box>
											}
											sx={{ my: 0 }}
										/>
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
												gap: 0.5,
											}}
										>
											{!notification.isRead && (
												<IconButton
													size="small"
													onClick={() => handleMarkAsRead(notification.id)}
													title="Mark as read"
													sx={{ color: theme.palette.primary.main }}
												>
													<CheckIcon size={18} />
												</IconButton>
											)}
											<IconButton
												size="small"
												onClick={() => handleDismiss(notification.id)}
												title="Dismiss"
												sx={{ color: theme.palette.error.main }}
											>
												<DeleteIcon size={18} />
											</IconButton>
										</Box>
									</ListItem>
									<Divider />
								</React.Fragment>
							))
						)}
					</List>
				)}
			</Box>

			{notifications.length > 0 && (
				<Box
					sx={{
						p: 1.5,
						textAlign: "center",
						borderTop: `1px solid ${theme.palette.divider}`,
					}}
				>
					<Typography
						variant="body2"
						color="primary.main"
						fontFamily="'Inter', sans-serif"
						sx={{
							cursor: "pointer",
							"&:hover": { textDecoration: "underline" },
						}}
					>
						View all notifications
					</Typography>
				</Box>
			)}
		</Card>
	);
};

export default NotificationList;
