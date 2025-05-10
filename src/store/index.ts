import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import apiSlice from "./api/apiSlice";
import { donationApi } from "./api/donationApi";
import { profileApi } from "./api/profileApi";

// Configure Redux store
export const store = configureStore({
	reducer: {
		[profileApi.reducerPath]: profileApi.reducer,
		[apiSlice.reducerPath]: apiSlice.reducer,
		[donationApi.reducerPath]: donationApi.reducer,
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			apiSlice.middleware,
			donationApi.middleware,
			profileApi.middleware
		),
	devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
