import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store/store";

interface Notification {
	id: string;
	recipient: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
	createdAt: string;
}

interface GetNotificationsResponse {
	success: boolean;
	notifications: Notification[];
}

interface NotificationActionResponse {
	success: boolean;
	notification: Notification;
}

export enum NotificationType {
	DONATION_RECEIVED = "DONATION_RECEIVED",
	DONATION_STATUS_UPDATED = "DONATION_STATUS_UPDATED",
	CAMPAIGN_CREATED = "CAMPAIGN_CREATED",
	CAMPAIGN_UPDATED = "CAMPAIGN_UPDATED",
	FEEDBACK_RECEIVED = "FEEDBACK_RECEIVED",
	FEEDBACK_RESPONSE = "FEEDBACK_RESPONSE",
	SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION",
}

export const notificationApi = createApi({
	reducerPath: "notificationApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth.token;
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ["Notifications"],
	endpoints: (builder) => ({
		getNotifications: builder.query<
			GetNotificationsResponse,
			{ userId: string; limit?: number; unreadOnly?: boolean }
		>({
			query: ({ userId, limit = 50, unreadOnly = false }) =>
				`/notifications/${userId}?limit=${limit}&unreadOnly=${unreadOnly}`,
			providesTags: (result, error, { userId }) =>
				result
					? [
							{ type: "Notifications", id: userId },
							...result.notifications.map((notification) => ({
								type: "Notifications" as const,
								id: notification.id,
							})),
					  ]
					: [{ type: "Notifications", id: userId }],
			transformResponse: (response: GetNotificationsResponse) => ({
				success: response.success,
				notifications: response.notifications.map((n) => ({
					...n,
					id: n.id,
				})),
			}),
		}),
		markNotificationAsRead: builder.mutation<
			NotificationActionResponse,
			string
		>({
			query: (notificationId) => ({
				url: `/notifications/${notificationId}/read`,
				method: "PATCH",
			}),
			invalidatesTags: (result, error, notificationId) => [
				{ type: "Notifications", id: notificationId },
			],
		}),
		dismissNotification: builder.mutation<NotificationActionResponse, string>({
			query: (notificationId) => ({
				url: `/notifications/${notificationId}`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, notificationId) => [
				{ type: "Notifications", id: notificationId },
			],
		}),
	}),
});

export const {
	useGetNotificationsQuery,
	useMarkNotificationAsReadMutation,
	useDismissNotificationMutation,
} = notificationApi;
