// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import apiSlice from "./api/apiSlice";
import { profileApi } from "./api/profileApi";
import { campaignApi } from "./api/campaignApi";
import { causeApi } from "./api/causeApi";
import { dashboardApi } from "./api/dashboardApi";
import { feedbackApi } from "./api/feedbackApi";
import { organizationApi } from "./api/organizationApi";
import { analyticsApi } from "./api/analyticsApi";

// Configure Redux store
export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		[profileApi.reducerPath]: profileApi.reducer,
		[campaignApi.reducerPath]: campaignApi.reducer,
		[causeApi.reducerPath]: causeApi.reducer,
		[dashboardApi.reducerPath]: dashboardApi.reducer,
		[feedbackApi.reducerPath]: feedbackApi.reducer,
		[organizationApi.reducerPath]: organizationApi.reducer,
		[analyticsApi.reducerPath]: analyticsApi.reducer,
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.concat(apiSlice.middleware)
			.concat(profileApi.middleware)
			.concat(campaignApi.middleware)
			.concat(causeApi.middleware)
			.concat(dashboardApi.middleware)
			.concat(feedbackApi.middleware)
			.concat(organizationApi.middleware)
			.concat(analyticsApi.middleware),
	devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
