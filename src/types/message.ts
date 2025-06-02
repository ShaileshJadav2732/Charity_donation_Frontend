export interface Message {
	_id: string;
	conversationId: string;
	sender: {
		_id: string;
		name: string;
		role: "donor" | "organization";
		profileImage?: string;
	};
	recipient: {
		_id: string;
		name: string;
		role: "donor" | "organization";
		profileImage?: string;
	};
	content: string;
	messageType: "text" | "image" | "file" | "system";
	attachments?: {
		url: string;
		type: string;
		name: string;
		size: number;
	}[];
	isRead: boolean;
	readAt?: string;
	editedAt?: string;
	deletedAt?: string;
	replyTo?: string; // ID of message being replied to
	createdAt: string;
	updatedAt: string;
}

export interface Conversation {
	_id: string;
	participants: {
		user: {
			_id: string;
			name: string;
			role: "donor" | "organization";
			profileImage?: string;
		};
		lastReadAt?: string;
		isTyping?: boolean;
	}[];
	lastMessage?: Message;
	relatedDonation?: {
		_id: string;
		cause: string;
		amount?: number;
		type: string;
	};
	relatedCause?: {
		_id: string;
		title: string;
	};
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateMessageRequest {
	conversationId?: string;
	recipientId: string;
	content: string;
	messageType?: "text" | "image" | "file";
	attachments?: File[];
	replyTo?: string;
	relatedDonation?: string;
	relatedCause?: string;
}

export interface CreateConversationRequest {
	participantId: string;
	initialMessage: string;
	relatedDonation?: string;
	relatedCause?: string;
}

export interface MessageQueryParams {
	conversationId: string;
	page?: number;
	limit?: number;
	before?: string; // Message ID for pagination
}

export interface ConversationQueryParams {
	page?: number;
	limit?: number;
	search?: string;
	unreadOnly?: boolean;
}

export interface TypingIndicator {
	conversationId: string;
	userId: string;
	userName: string;
	isTyping: boolean;
}

export interface MessageReadReceipt {
	messageId: string;
	conversationId: string;
	userId: string;
	readAt: string;
}

export interface OnlineStatus {
	userId: string;
	isOnline: boolean;
	lastSeen?: string;
}

// API Response types
export interface MessagesResponse {
	success: boolean;
	data: Message[];
	pagination: {
		total: number;
		page: number;
		pages: number;
		hasMore: boolean;
	};
}

export interface ConversationsResponse {
	success: boolean;
	data: Conversation[];
	pagination: {
		total: number;
		page: number;
		pages: number;
		hasMore: boolean;
	};
}

export interface MessageResponse {
	success: boolean;
	data: Message;
	message?: string;
}

export interface ConversationResponse {
	success: boolean;
	data: Conversation;
	message?: string;
}
