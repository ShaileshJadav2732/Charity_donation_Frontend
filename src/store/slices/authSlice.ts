import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/types";
import { authApi } from "../api/authApi";

// Get token safely (only in browser)
const getStoredToken = (): string | null => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("token");
	}
	return null;
};

// Initial state
const initialState: AuthState = {
	user: null,
	token: getStoredToken(),
	isAuthenticated: false,
	isLoading: false,
	error: null,
};

// Create auth slice
const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		// Set credentials manually
		setCredentials: (
			state,
			action: PayloadAction<{ user: User; token: string }>
		) => {
			const { user, token } = action.payload;
			state.user = user;
			state.token = token;
			state.isAuthenticated = true;

			// Save token to localStorage
			if (typeof window !== "undefined") {
				localStorage.setItem("token", token);
			}
		},

		// Clear credentials (logout)
		clearCredentials: (state) => {
			state.user = null;
			state.token = null;
			state.isAuthenticated = false;

			// Remove token from localStorage
			if (typeof window !== "undefined") {
				localStorage.removeItem("token");
			}
		},

		// Set loading state
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},

		// Set error message
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
	extraReducers: (builder) => {
		// Handle register success
		builder.addMatcher(
			authApi.endpoints.register.matchFulfilled,
			(state, { payload }) => {
				state.user = payload.user;
				state.token = payload.token;
				state.isAuthenticated = true;
				state.isLoading = false;
				state.error = null;

				// Save token to localStorage
				if (typeof window !== "undefined") {
					localStorage.setItem("token", payload.token);
				}
			}
		);

		// Handle login success
		builder.addMatcher(
			authApi.endpoints.login.matchFulfilled,
			(state, { payload }) => {
				state.user = payload.user;
				state.token = payload.token;
				state.isAuthenticated = true;
				state.isLoading = false;
				state.error = null;

				// Save token to localStorage
				if (typeof window !== "undefined") {
					localStorage.setItem("token", payload.token);
				}
			}
		);

		// Handle verify token success
		builder.addMatcher(
			authApi.endpoints.verifyToken.matchFulfilled,
			(state, { payload }) => {
				state.user = payload.user;
				state.token = payload.token;
				state.isAuthenticated = true;
				state.isLoading = false;
				state.error = null;

				// Save token to localStorage
				if (typeof window !== "undefined") {
					localStorage.setItem("token", payload.token);
				}
			}
		);

		// Handle get current user success
		builder.addMatcher(
			authApi.endpoints.getCurrentUser.matchFulfilled,
			(state, { payload }) => {
				state.user = payload.user;
				state.isAuthenticated = true;
				state.isLoading = false;
				state.error = null;
			}
		);
	},
});

export const { setCredentials, clearCredentials, setLoading, setError } =
	authSlice.actions;

export default authSlice.reducer;
