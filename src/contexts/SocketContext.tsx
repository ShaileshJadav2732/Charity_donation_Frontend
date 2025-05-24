"use client";

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import toast from "react-hot-toast";

interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	data?: Record<string, any>;
	isRead: boolean;
	createdAt: string;
}

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	notifications: Notification[];
	unreadCount: number;
	markNotificationAsRead: (notificationId: string) => void;
	clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return context;
};

interface SocketProviderProps {
	children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const { token, user } = useSelector((state: RootState) => state.auth);

	// Sort notifications by creation date (newest first) and calculate unread count
	const sortedNotifications = [...notifications].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
	const unreadCount = notifications.filter((n) => !n.isRead).length;

	// Initialize socket connection
	useEffect(() => {
		if (token && user) {
			const socketUrl =
				process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
				"http://localhost:8080";
			console.log("Connecting to Socket.IO server:", socketUrl);
			console.log("Using token:", token ? "Token present" : "No token");

			const newSocket = io(socketUrl, {
				auth: {
					token: token,
				},
				transports: ["websocket", "polling"],
				forceNew: true,
				reconnection: true,
				timeout: 20000,
			});

			// Connection event handlers
			newSocket.on("connect", () => {
				console.log("Connected to server");
				setIsConnected(true);
			});

			newSocket.on("disconnect", (reason) => {
				console.log("Disconnected from server. Reason:", reason);
				setIsConnected(false);

				if (reason === "io server disconnect") {
					// Server disconnected the socket, reconnect manually
					newSocket.connect();
				}
			});

			newSocket.on("connect_error", (error) => {
				console.error("Socket connection error:", error);
				console.error("Error message:", error.message);
				console.error("Error type:", error.type);
				setIsConnected(false);

				// Show user-friendly error message
				toast.error(`Connection failed: ${error.message}`, {
					duration: 5000,
					position: "top-right",
				});
			});

			newSocket.on("reconnect", (attemptNumber) => {
				console.log("Reconnected to server after", attemptNumber, "attempts");
				setIsConnected(true);
			});

			newSocket.on("reconnect_error", (error) => {
				console.error("Reconnection error:", error);
			});

			// Notification event handlers
			newSocket.on("notification:new", (notification: Notification) => {
				console.log("New notification received:", notification);

				// Add to notifications list
				setNotifications((prev) => [notification, ...prev]);

				// Show toast notification
				toast.success(notification.title, {
					duration: 4000,
					position: "top-right",
					style: {
						background: "#10B981",
						color: "white",
					},
					icon: "🔔",
				});
			});

			newSocket.on("notification:read", (data: { notificationId: string }) => {
				console.log("Notification marked as read:", data.notificationId);
				setNotifications((prev) =>
					prev.map((n) =>
						n.id === data.notificationId ? { ...n, isRead: true } : n
					)
				);
			});

			setSocket(newSocket);

			// Cleanup on unmount
			return () => {
				newSocket.close();
			};
		} else {
			// If no token/user, disconnect socket
			if (socket) {
				socket.close();
				setSocket(null);
				setIsConnected(false);
				setNotifications([]);
			}
		}
	}, [token, user]);

	// Mark notification as read
	const markNotificationAsRead = useCallback(
		(notificationId: string) => {
			if (socket) {
				socket.emit("notification:read", notificationId);
				setNotifications((prev) =>
					prev.map((n) =>
						n.id === notificationId ? { ...n, isRead: true } : n
					)
				);
			}
		},
		[socket]
	);

	// Clear all notifications
	const clearNotifications = useCallback(() => {
		setNotifications([]);
	}, []);

	const value: SocketContextType = {
		socket,
		isConnected,
		notifications: sortedNotifications,
		unreadCount,
		markNotificationAsRead,
		clearNotifications,
	};

	return (
		<SocketContext.Provider value={value}>{children}</SocketContext.Provider>
	);
};
