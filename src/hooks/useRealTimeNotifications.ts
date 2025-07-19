"use client";

import { useSocket } from "@/contexts/SocketContext";

export const useRealTimeNotifications = () => {
	const {
		socket,
		isConnected,
		notifications: socketNotifications,
		unreadCount,
		markNotificationAsRead,
	} = useSocket();

	// Use socket notifications directly (already sorted by creation date in context)
	const allNotifications = socketNotifications;

	// Connection status indicator
	const connectionStatus = isConnected ? "connected" : "disconnected";

	// Get recent notifications (last 10)
	const recentNotifications = allNotifications.slice(0, 10);

	// Get unread notifications
	const unreadNotifications = allNotifications.filter((n) => !n.isRead);

	// Mark notification as read (use SocketContext method)
	const markAsRead = (notificationId: string) => {
		markNotificationAsRead(notificationId);
	};

	// Mark all notifications as read (use SocketContext method)
	const markAllAsRead = () => {
		unreadNotifications.forEach((notification) => {
			markNotificationAsRead(notification.id);
		});
	};

	// Get notifications by type
	const getNotificationsByType = (type: string) => {
		return allNotifications.filter((n) => n.type === type);
	};

	// Get notifications from last N days
	const getRecentNotifications = (days: number = 7) => {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);

		return allNotifications.filter((n) => new Date(n.createdAt) >= cutoffDate);
	};

	return {
		// Notifications data
		notifications: allNotifications,
		recentNotifications,
		unreadNotifications,
		unreadCount,

		// Connection status
		isConnected,
		connectionStatus,

		// Actions
		markAsRead,
		markAllAsRead,

		// Utility functions
		getNotificationsByType,
		getRecentNotifications,

		// Socket instance (for advanced usage)
		socket,
	};
};
