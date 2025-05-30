import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

export interface CreatePaymentIntentRequest {
	amount: number;
	currency: string;
	cause: string;
	organization: string;
	campaign?: string;
	description: string;
	contactPhone: string;
	contactEmail: string;
}

export interface CreatePaymentIntentResponse {
	clientSecret: string;
	paymentIntentId: string;
}

export interface ConfirmPaymentRequest {
	paymentIntentId: string;
	donationData: {
		cause: string;
		organization: string;
		campaign?: string;
		description: string;
		contactPhone: string;
		contactEmail: string;
	};
}

export interface ConfirmPaymentResponse {
	success: boolean;
	data: any;
	message: string;
}

export const paymentApi = createApi({
	reducerPath: "paymentApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth.token;
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["Payment"],
	endpoints: (builder) => ({
		createPaymentIntent: builder.mutation<
			CreatePaymentIntentResponse,
			CreatePaymentIntentRequest
		>({
			query: (data) => ({
				url: "/payments/create-payment-intent",
				method: "POST",
				body: JSON.stringify({
					...data,
					// Remove currency override - let backend handle it
				}),
				headers: {
					"Content-Type": "application/json",
				},
			}),
		}),
		confirmPayment: builder.mutation<
			ConfirmPaymentResponse,
			ConfirmPaymentRequest
		>({
			query: (data) => ({
				url: "/payments/confirm-payment",
				method: "POST",
				body: JSON.stringify(data),
				headers: {
					"Content-Type": "application/json",
				},
			}),
			invalidatesTags: ["Payment"],
		}),
	}),
});

export const { useCreatePaymentIntentMutation, useConfirmPaymentMutation } =
	paymentApi;
