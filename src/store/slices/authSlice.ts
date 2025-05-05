import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, IUser, AuthResponse } from "../../types/auth.types";

// Initial state
const initialState: AuthState = {
	user: null,
	token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
};

// Auth slice
const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		// Set loading state
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
			if (action.payload) {
				state.error = null;
			}
		},

		// Set error state
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
			state.isLoading = false;
		},

		// Set auth credentials on successful login/signup
		setCredentials: (state, action: PayloadAction<AuthResponse>) => {
			state.user = action.payload.user;
			state.token = action.payload.token;
			state.isAuthenticated = true;
			state.isLoading = false;
			state.error = null;
		},

		// Update user data
		updateUser: (state, action: PayloadAction<IUser>) => {
			state.user = action.payload;
		},

		// Clear auth state on logout
		clearCredentials: (state) => {
			state.user = null;
			state.token = null;
			state.isAuthenticated = false;
			state.error = null;
		},

		// Load user from localStorage (for hydration)
		loadUserFromStorage: (state) => {
			if (typeof window !== "undefined") {
				const userStr = localStorage.getItem("user");
				const token = localStorage.getItem("token");

				if (userStr && token) {
					try {
						state.user = JSON.parse(userStr);
						state.token = token;
						state.isAuthenticated = true;
					} catch (error) {
						state.user = null;
						state.token = null;
						state.isAuthenticated = false;
					}
				}
			}
		},
	},
});

export const {
	setLoading,
	setError,
	setCredentials,
	updateUser,
	clearCredentials,
	loadUserFromStorage,
} = authSlice.actions;

export default authSlice.reducer;
