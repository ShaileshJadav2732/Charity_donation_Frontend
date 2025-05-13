import React from "react";
import {
	List,
	ListItem,
	ListItemText,
	Typography,
	Box,
	IconButton,
} from "@mui/material";
import { NotificationsOutlined } from "@mui/icons-material";
import { useGetUserNotificationsQuery } from "@/store/api/notificationApi";
import { formatDistanceToNow } from "date-fns";

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
	const { data, isLoading } = useGetUserNotificationsQuery({
		limit: 5,
		unreadOnly: true,
	});

	if (isLoading) {
		return <Typography>Loading notifications...</Typography>;
	}

	const notifications = data?.data || [];

	return (
		<Box sx={{ width: 300, maxHeight: 400, overflow: "auto" }}>
			<List>
				{notifications.map((notification: Notification) => (
					<ListItem
						key={notification.id}
						sx={{
							bgcolor: notification.isRead ? "transparent" : "action.hover",
							"&:hover": { bgcolor: "action.hover" },
						}}
					>
						<ListItemText
							primary={notification.title}
							secondary={
								<>
									<Typography variant="body2" color="text.secondary">
										{notification.message}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{formatDistanceToNow(new Date(notification.createdAt), {
											addSuffix: true,
										})}
									</Typography>
								</>
							}
						/>
						<IconButton size="small" onClick={onClose}>
							<NotificationsOutlined />
						</IconButton>
					</ListItem>
				))}
				{notifications.length === 0 && (
					<ListItem>
						<ListItemText primary="No new notifications" />
					</ListItem>
				)}
			</List>
		</Box>
	);
};

export default NotificationList;
