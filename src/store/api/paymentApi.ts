import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

export interface CreatePaymentIntentRequest {
	amount: number;
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
				body: data,
			}),
		}),
		confirmPayment: builder.mutation<
			ConfirmPaymentResponse,
			ConfirmPaymentRequest
		>({
			query: (data) => ({
				url: "/payments/confirm-payment",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Payment"],
		}),
	}),
});

export const { useCreatePaymentIntentMutation, useConfirmPaymentMutation } =
	paymentApi;
