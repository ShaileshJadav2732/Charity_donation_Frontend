import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import {
	CreateMessageRequest,
	CreateConversationRequest,
	MessageQueryParams,
	ConversationQueryParams,
	MessagesResponse,
	ConversationsResponse,
	MessageResponse,
	ConversationResponse,
} from "@/types/message";

export const messageApi = createApi({
	reducerPath: "messageApi",
	baseQuery: fetchBaseQuery({
		baseUrl: `${
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
		}/messages`,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth.token;
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}
			// Set JSON content type for all requests
			return headers;
		},
	}),
	tagTypes: ["Message", "Conversation", "UnreadCount"],
	endpoints: (builder) => ({
		// Get all conversations for the current user
		getConversations: builder.query<
			ConversationsResponse,
			ConversationQueryParams
		>({
			query: (params) => ({
				url: "/conversations",
				params: {
					page: params.page || 1,
					limit: params.limit || 20,
					...(params.search && { search: params.search }),
					...(params.unreadOnly && { unreadOnly: params.unreadOnly }),
				},
			}),
			providesTags: ["Conversation"],
		}),

		// Get a specific conversation
		getConversation: builder.query<ConversationResponse, string>({
			query: (conversationId) => `/conversations/${conversationId}`,
			providesTags: (_result, _error, conversationId) => [
				{ type: "Conversation", id: conversationId },
			],
		}),

		// Get messages for a conversation
		getMessages: builder.query<MessagesResponse, MessageQueryParams>({
			query: (params) => ({
				url: `/conversations/${params.conversationId}/messages`,
				params: {
					page: params.page || 1,
					limit: params.limit || 50,
					...(params.before && { before: params.before }),
				},
			}),
			providesTags: (_result, _error, params) => [
				{ type: "Message", id: params.conversationId },
			],
		}),

		// Create a new conversation
		createConversation: builder.mutation<
			ConversationResponse,
			CreateConversationRequest
		>({
			query: (data) => ({
				url: "/conversations",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Conversation"],
		}),

		// Send a message
		sendMessage: builder.mutation<MessageResponse, CreateMessageRequest>({
			query: (data) => {
				const body = {
					content: data.content,
					recipientId: data.recipientId,
					messageType: data.messageType || "text",
					...(data.conversationId && { conversationId: data.conversationId }),
					...(data.replyTo && { replyTo: data.replyTo }),
					...(data.relatedDonation && {
						relatedDonation: data.relatedDonation,
					}),
					...(data.relatedCause && { relatedCause: data.relatedCause }),
				};

				return {
					url: "/send",
					method: "POST",
					body,
				};
			},
			invalidatesTags: (_result, _error, data) => [
				"Conversation",
				{ type: "Message", id: data.conversationId },
			],
		}),

		// Mark message as read
		markMessageAsRead: builder.mutation<
			{ success: boolean },
			{ messageId: string; conversationId: string }
		>({
			query: ({ messageId }) => ({
				url: `/messages/${messageId}/read`,
				method: "PATCH",
			}),
			invalidatesTags: (_result, _error, { conversationId }) => [
				{ type: "Message", id: conversationId },
				"UnreadCount",
			],
		}),

		// Mark all messages in conversation as read
		markConversationAsRead: builder.mutation<{ success: boolean }, string>({
			query: (conversationId) => ({
				url: `/conversations/${conversationId}/read`,
				method: "PATCH",
			}),
			invalidatesTags: (_result, _error, conversationId) => [
				{ type: "Message", id: conversationId },
				{ type: "Conversation", id: conversationId },
				"UnreadCount",
			],
		}),

		// Get unread message count
		getUnreadCount: builder.query<{ count: number }, void>({
			query: () => "/unread-count",
			providesTags: ["UnreadCount"],
		}),

		// Delete a message
		deleteMessage: builder.mutation<
			{ success: boolean },
			{ messageId: string; conversationId: string }
		>({
			query: ({ messageId }) => ({
				url: `/messages/${messageId}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, { conversationId }) => [
				{ type: "Message", id: conversationId },
				"Conversation",
			],
		}),

		// Edit a message
		editMessage: builder.mutation<
			MessageResponse,
			{ messageId: string; content: string; conversationId: string }
		>({
			query: ({ messageId, content }) => ({
				url: `/messages/${messageId}`,
				method: "PATCH",
				body: { content },
			}),
			invalidatesTags: (_result, _error, { conversationId }) => [
				{ type: "Message", id: conversationId },
			],
		}),

		// Search messages
		searchMessages: builder.query<
			MessagesResponse,
			{ query: string; conversationId?: string }
		>({
			query: (params) => ({
				url: "/search",
				params: {
					q: params.query,
					...(params.conversationId && {
						conversationId: params.conversationId,
					}),
				},
			}),
		}),

		// Universal participant ID resolver
		resolveParticipantId: builder.query<
			{
				success: boolean;
				data: {
					participantId: string;
					participantInfo: {
						id: string;
						email: string;
						role: string;
						type: string;
						organizationId?: string;
						organizationName?: string;
						causeId?: string;
						causeTitle?: string;
						donorProfileId?: string;
						donorName?: string;
						donationId?: string;
						donationAmount?: number;
						donationType?: string;
					};
					resolvedFrom: string;
					inputId: string;
				};
			},
			string
		>({
			query: (id) => `/resolve-participant/${id}`,
		}),
	}),
});

export const {
	useGetConversationsQuery,
	useGetConversationQuery,
	useGetMessagesQuery,
	useCreateConversationMutation,
	useSendMessageMutation,
	useMarkMessageAsReadMutation,
	useMarkConversationAsReadMutation,
	useGetUnreadCountQuery,
	useDeleteMessageMutation,
	useEditMessageMutation,
	useSearchMessagesQuery,
	useResolveParticipantIdQuery,
} = messageApi;
