"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import NotificationList from "@/components/notifications/NotificationList";

const NotificationsPage = () => {
	return (
		<Box>
			<Typography variant="h4" gutterBottom>
				Notifications
			</Typography>
			<NotificationList />
		</Box>
	);
};

export default NotificationsPage;
