import { apiSlice } from "./apiSlice";

export enum NotificationType {
	DONATION_RECEIVED = "DONATION_RECEIVED",
	DONATION_STATUS_UPDATED = "DONATION_STATUS_UPDATED",
	CAMPAIGN_CREATED = "CAMPAIGN_CREATED",
	CAMPAIGN_UPDATED = "CAMPAIGN_UPDATED",
	FEEDBACK_RECEIVED = "FEEDBACK_RECEIVED",
	FEEDBACK_RESPONSE = "FEEDBACK_RESPONSE",
	SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION",
}

export interface Notification {
	_id: string;
	recipient: string;
	type: NotificationType;
	title: string;
	message: string;
	data?: Record<string, any>;
	isRead: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface NotificationListResponse {
	success: boolean;
	data: Notification[];
	unreadCount: number;
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface NotificationResponse {
	success: boolean;
	message: string;
}

export const notificationApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getUserNotifications: builder.query<
			NotificationListResponse,
			{ page?: number; limit?: number; unreadOnly?: boolean }
		>({
			query: ({ page = 1, limit = 20, unreadOnly = false }) => ({
				url: "/notifications",
				params: { page, limit, unreadOnly },
			}),
			providesTags: ["Notifications"],
		}),

		markNotificationsAsRead: builder.mutation<
			NotificationResponse,
			{ notificationIds: string[] }
		>({
			query: (data) => ({
				url: "/notifications/read",
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["Notifications"],
		}),

		deleteNotifications: builder.mutation<
			NotificationResponse,
			{ notificationIds: string[] }
		>({
			query: (data) => ({
				url: "/notifications",
				method: "DELETE",
				body: data,
			}),
			invalidatesTags: ["Notifications"],
		}),
	}),
});

export const {
	useGetUserNotificationsQuery,
	useMarkNotificationsAsReadMutation,
	useDeleteNotificationsMutation,
} = notificationApi;
