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
	data?: Record<string, unknown>;
	isRead: boolean;
	createdAt: string;
}

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	notifications: Notification[];
	unreadCount: number;
	markNotificationAsRead: (id: string) => void;
	clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context)
		throw new Error("useSocket must be used within a SocketProvider");
	return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { token, user } = useSelector((state: RootState) => state.auth);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const unreadCount = notifications.filter((n) => !n.isRead).length;
	const sortedNotifications = [...notifications].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	useEffect(() => {
		if (!token || !user) {
			socket?.close();
			setSocket(null);
			setIsConnected(false);
			setNotifications([]);
			return;
		}

		const socketUrl =
			process.env.NEXT_PUBLIC_SOCKET_URL ||
			process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
			"http://localhost:8080";

		const newSocket = io(socketUrl, {
			auth: { token },
			transports: ["websocket"],
			reconnection: true,
		});

		newSocket.on("connect", () => {
			setIsConnected(true);
			toast.dismiss();
		});

		newSocket.on("disconnect", () => {
			setIsConnected(false);
		});

		newSocket.on("connect_error", (err) => {
			setIsConnected(false);
			const msg = err.message.includes("timeout")
				? "Connection timeout"
				: err.message.includes("Authentication")
				? "Authentication failed"
				: "Connection failed";
			toast.error(msg, { position: "top-right" });
		});

		newSocket.on("reconnect", () =>
			toast.success("Reconnected", { icon: "🔄", position: "top-right" })
		);

		newSocket.on("notification:new", (notification: Notification) => {
			setNotifications((prev) => [notification, ...prev]);

			// Show toast notification with appropriate styling based on type
			const isMessageNotification = notification.type === "MESSAGE_RECEIVED";

			toast.success(notification.message || notification.title, {
				icon: isMessageNotification ? "💬" : "🔔",
				position: "top-right",
				style: {
					background: isMessageNotification ? "#2f8077" : "#10B981",
					color: "white",
				},
				duration: isMessageNotification ? 4000 : 3000,
			});
		});

		newSocket.on("notification:read", ({ notificationId }) => {
			setNotifications((prev) =>
				prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
			);
		});

		setSocket(newSocket);
		return () => {
			newSocket.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, user]);

	const markNotificationAsRead = useCallback(
		(id: string) => {
			if (socket) {
				socket.emit("notification:read", id);
				setNotifications((prev) =>
					prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
				);
			}
		},
		[socket]
	);

	const clearNotifications = useCallback(() => setNotifications([]), []);

	return (
		<SocketContext.Provider
			value={{
				socket,
				isConnected,
				notifications: sortedNotifications,
				unreadCount,
				markNotificationAsRead,
				clearNotifications,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
};
