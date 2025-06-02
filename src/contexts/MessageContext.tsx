"use client";

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSocket } from "./SocketContext";
import {
	Message,
	Conversation,
	TypingIndicator,
	OnlineStatus,
	MessageReadReceipt,
} from "@/types/message";
import toast from "react-hot-toast";

interface MessageContextType {
	// Real-time message state
	onlineUsers: Map<string, OnlineStatus>;
	typingUsers: Map<string, TypingIndicator>;

	// Message functions
	sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
	joinConversation: (conversationId: string) => void;
	leaveConversation: (conversationId: string) => void;

	// Event handlers
	onNewMessage: (callback: (message: Message) => void) => void;
	onMessageRead: (callback: (receipt: MessageReadReceipt) => void) => void;
	onUserOnline: (callback: (status: OnlineStatus) => void) => void;
	onUserOffline: (callback: (status: OnlineStatus) => void) => void;
	onTypingStart: (callback: (indicator: TypingIndicator) => void) => void;
	onTypingStop: (callback: (indicator: TypingIndicator) => void) => void;

	// Cleanup functions
	removeMessageListeners: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
	const context = useContext(MessageContext);
	if (context === undefined) {
		throw new Error("useMessage must be used within a MessageProvider");
	}
	return context;
};

interface MessageProviderProps {
	children: React.ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({
	children,
}) => {
	const { socket, isConnected } = useSocket();
	const { user } = useSelector((state: RootState) => state.auth);

	// State for real-time features
	const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineStatus>>(
		new Map()
	);
	const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(
		new Map()
	);

	// Event callback storage
	const [messageCallbacks] = useState<{
		newMessage: ((message: Message) => void)[];
		messageRead: ((receipt: MessageReadReceipt) => void)[];
		userOnline: ((status: OnlineStatus) => void)[];
		userOffline: ((status: OnlineStatus) => void)[];
		typingStart: ((indicator: TypingIndicator) => void)[];
		typingStop: ((indicator: TypingIndicator) => void)[];
	}>({
		newMessage: [],
		messageRead: [],
		userOnline: [],
		userOffline: [],
		typingStart: [],
		typingStop: [],
	});

	// Setup socket event listeners
	useEffect(() => {
		if (!socket || !isConnected || !user) return;

		// Message events
		const handleNewMessage = (message: Message) => {
			// Don't show toast here - let the notification system handle it
			// This prevents duplicate notifications
			console.log("📨 New message received via socket:", message);

			// Call all registered callbacks
			messageCallbacks.newMessage.forEach((callback) => callback(message));
		};

		const handleMessageRead = (receipt: MessageReadReceipt) => {
			messageCallbacks.messageRead.forEach((callback) => callback(receipt));
		};

		const handleUserOnline = (status: OnlineStatus) => {
			console.log("🟢 User came online:", status);
			setOnlineUsers((prev) => {
				const newMap = new Map(prev.set(status.userId, status));
				console.log("📊 Updated online users:", Array.from(newMap.entries()));
				return newMap;
			});
			messageCallbacks.userOnline.forEach((callback) => callback(status));
		};

		const handleUserOffline = (status: OnlineStatus) => {
			console.log("🔴 User went offline:", status);
			setOnlineUsers((prev) => {
				const newMap = new Map(prev);
				newMap.set(status.userId, { ...status, isOnline: false });
				console.log("📊 Updated online users:", Array.from(newMap.entries()));
				return newMap;
			});
			messageCallbacks.userOffline.forEach((callback) => callback(status));
		};

		const handleTypingStart = (indicator: TypingIndicator) => {
			if (indicator.userId !== user.id) {
				setTypingUsers(
					(prev) =>
						new Map(
							prev.set(
								`${indicator.conversationId}-${indicator.userId}`,
								indicator
							)
						)
				);
				messageCallbacks.typingStart.forEach((callback) => callback(indicator));
			}
		};

		const handleTypingStop = (indicator: TypingIndicator) => {
			setTypingUsers((prev) => {
				const newMap = new Map(prev);
				newMap.delete(`${indicator.conversationId}-${indicator.userId}`);
				return newMap;
			});
			messageCallbacks.typingStop.forEach((callback) => callback(indicator));
		};

		const handleOnlineUsersList = (usersList: OnlineStatus[]) => {
			console.log("📋 Received online users list:", usersList);
			const onlineMap = new Map<string, OnlineStatus>();
			usersList.forEach((user) => {
				onlineMap.set(user.userId, user);
			});
			setOnlineUsers(onlineMap);
			console.log(
				"📊 Initialized online users:",
				Array.from(onlineMap.entries())
			);
		};

		// Register socket listeners
		socket.on("message:new", handleNewMessage);
		socket.on("message:read", handleMessageRead);
		socket.on("user:online", handleUserOnline);
		socket.on("user:offline", handleUserOffline);
		socket.on("users:online-list", handleOnlineUsersList);
		socket.on("typing:start", handleTypingStart);
		socket.on("typing:stop", handleTypingStop);

		// Cleanup function
		return () => {
			socket.off("message:new", handleNewMessage);
			socket.off("message:read", handleMessageRead);
			socket.off("user:online", handleUserOnline);
			socket.off("user:offline", handleUserOffline);
			socket.off("users:online-list", handleOnlineUsersList);
			socket.off("typing:start", handleTypingStart);
			socket.off("typing:stop", handleTypingStop);
		};
	}, [socket, isConnected, user, messageCallbacks]);

	// Send typing indicator
	const sendTypingIndicator = useCallback(
		(conversationId: string, isTyping: boolean) => {
			if (socket && isConnected) {
				socket.emit(isTyping ? "typing:start" : "typing:stop", {
					conversationId,
					userId: user?.id,
					userName: user?.email, // We'll get the actual name from profile
					isTyping,
				});
			}
		},
		[socket, isConnected, user]
	);

	// Join conversation room
	const joinConversation = useCallback(
		(conversationId: string) => {
			if (socket && isConnected) {
				socket.emit("conversation:join", conversationId);
			}
		},
		[socket, isConnected]
	);

	// Leave conversation room
	const leaveConversation = useCallback(
		(conversationId: string) => {
			if (socket && isConnected) {
				socket.emit("conversation:leave", conversationId);
			}
		},
		[socket, isConnected]
	);

	// Event handler registration functions
	const onNewMessage = useCallback(
		(callback: (message: Message) => void) => {
			messageCallbacks.newMessage.push(callback);
		},
		[messageCallbacks]
	);

	const onMessageRead = useCallback(
		(callback: (receipt: MessageReadReceipt) => void) => {
			messageCallbacks.messageRead.push(callback);
		},
		[messageCallbacks]
	);

	const onUserOnline = useCallback(
		(callback: (status: OnlineStatus) => void) => {
			messageCallbacks.userOnline.push(callback);
		},
		[messageCallbacks]
	);

	const onUserOffline = useCallback(
		(callback: (status: OnlineStatus) => void) => {
			messageCallbacks.userOffline.push(callback);
		},
		[messageCallbacks]
	);

	const onTypingStart = useCallback(
		(callback: (indicator: TypingIndicator) => void) => {
			messageCallbacks.typingStart.push(callback);
		},
		[messageCallbacks]
	);

	const onTypingStop = useCallback(
		(callback: (indicator: TypingIndicator) => void) => {
			messageCallbacks.typingStop.push(callback);
		},
		[messageCallbacks]
	);

	// Remove all listeners
	const removeMessageListeners = useCallback(() => {
		messageCallbacks.newMessage.length = 0;
		messageCallbacks.messageRead.length = 0;
		messageCallbacks.userOnline.length = 0;
		messageCallbacks.userOffline.length = 0;
		messageCallbacks.typingStart.length = 0;
		messageCallbacks.typingStop.length = 0;
	}, [messageCallbacks]);

	const value: MessageContextType = {
		onlineUsers,
		typingUsers,
		sendTypingIndicator,
		joinConversation,
		leaveConversation,
		onNewMessage,
		onMessageRead,
		onUserOnline,
		onUserOffline,
		onTypingStart,
		onTypingStop,
		removeMessageListeners,
	};

	return (
		<MessageContext.Provider value={value}>{children}</MessageContext.Provider>
	);
};

export default MessageProvider;
