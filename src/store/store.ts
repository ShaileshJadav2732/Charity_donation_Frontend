import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import apiSlice from "./api/apiSlice";
import { donationApi } from "./api/donationApi";
import { profileApi } from "./api/profileApi";
import { dashboardApi } from "./api/dashboardApi";
import { causesApi } from "./api/causesApi";

// Configure Redux store
export const store = configureStore({
	reducer: {
		[profileApi.reducerPath]: profileApi.reducer,
		[apiSlice.reducerPath]: apiSlice.reducer,
		[donationApi.reducerPath]: donationApi.reducer,
		[dashboardApi.reducerPath]: dashboardApi.reducer,
		[causesApi.reducerPath]: causesApi.reducer,
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}).concat(
			apiSlice.middleware,
			donationApi.middleware,
			profileApi.middleware,
			dashboardApi.middleware,
			causesApi.middleware
		),
	devTools: process.env.NODE_ENV !== "production",
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
