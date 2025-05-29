// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import apiSlice from "./api/apiSlice";
import { profileApi } from "./api/profileApi";
import { campaignApi } from "./api/campaignApi";
import { uploadApi } from "./api/uploadApi";
import { causeApi } from "./api/causeApi";
import { dashboardApi } from "./api/dashboardApi";
import { organizationApi } from "./api/organizationApi";
import { paymentApi } from "./api/paymentApi";
import { notificationApi } from "./api/notificationApi";

// Configure Redux store
export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		[profileApi.reducerPath]: profileApi.reducer,
		[campaignApi.reducerPath]: campaignApi.reducer,
		[uploadApi.reducerPath]: uploadApi.reducer,
		[causeApi.reducerPath]: causeApi.reducer,
		[dashboardApi.reducerPath]: dashboardApi.reducer,

		[organizationApi.reducerPath]: organizationApi.reducer,
		[paymentApi.reducerPath]: paymentApi.reducer,
		[notificationApi.reducerPath]: notificationApi.reducer,
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.concat(apiSlice.middleware)
			.concat(profileApi.middleware)
			.concat(campaignApi.middleware)
			.concat(causeApi.middleware)
			.concat(dashboardApi.middleware)
			.concat(uploadApi.middleware)
			.concat(organizationApi.middleware)
			.concat(paymentApi.middleware)
			.concat(notificationApi.middleware),
	devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
