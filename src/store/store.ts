import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { donorApi } from "./services/donorApi";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		[donorApi.reducerPath]: donorApi.reducer,
	},

	// and other useful features of RTK Query.
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false, // Disable for Firebase objects
		}).concat(donorApi.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
