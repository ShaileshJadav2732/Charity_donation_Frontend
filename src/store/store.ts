// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import apiSlice from "./api/apiSlice";
import { donationApi } from "./api/donationApi";
import { profileApi } from "./api/profileApi";
import { campaignApi } from "./api/campaignApi"; // Add campaignApi
import { causeApi } from "./api/causesApi";
// Configure Redux store
export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		[donationApi.reducerPath]: donationApi.reducer,
		[profileApi.reducerPath]: profileApi.reducer,
		[campaignApi.reducerPath]: campaignApi.reducer, // Add campaignApi reducer
		[causeApi.reducerPath]: causeApi.reducer,
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			apiSlice.middleware,
			donationApi.middleware,
			profileApi.middleware,
			campaignApi.middleware // Add campaignApi middleware
		),
	devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
