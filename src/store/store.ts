// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import { profileApi } from "./api/profileApi";
import { campaignApi } from "./api/campaignApi";
import { causeApi } from "./api/causeApi";
import { dashboardApi } from "./api/dashboardApi";
import {authApi} from './api/authApi'

// Configure Redux store
export const store = configureStore({
	reducer: {
		[profileApi.reducerPath]: profileApi.reducer,
		[authApi.reducerPath]: authApi.reducer,
		[campaignApi.reducerPath]: campaignApi.reducer,
		[causeApi.reducerPath]: causeApi.reducer,
		[dashboardApi.reducerPath]: dashboardApi.reducer,
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.concat(profileApi.middleware)
			.concat(authApi.middleware)
			.concat(campaignApi.middleware)
			.concat(causeApi.middleware)
			.concat(dashboardApi.middleware),
	devTools: process.env.NODE_ENV !== "production",
});
// Setup listeners for RTK Query
setupListeners(store.dispatch);
// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;