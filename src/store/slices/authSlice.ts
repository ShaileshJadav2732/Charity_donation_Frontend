import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/types";
import { CookieManager } from "@/utils/cookieManager";

const getStoredUser = (): User | null => {
	if (typeof window !== "undefined") {
		try {
			const userData = localStorage.getItem("user");
			const user = userData ? JSON.parse(userData) : null;

			// Validate that the user object has required fields to prevent flash of wrong content
			if (user && user.firebaseUid && user.email && user.role) {
				return user;
			}
			return null;
		} catch {
			return null;
		}
	}
	return null;
};

const getStoredToken = (): string | null => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("token");
	}
	return null;
};

// Initial state
const initialState: AuthState = {
	user: getStoredUser(),
	token: getStoredToken(),
	isAuthenticated: !!getStoredToken() && !!getStoredUser(),
	isLoading: false,
	error: null,
};

// Create auth slice
const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCredentials: (
			state,
			action: PayloadAction<{ user: User; token: string }>
		) => {
			const { user, token } = action.payload;
			state.user = user;
			state.token = token;
			state.isAuthenticated = true;
			state.isLoading = false;
			state.error = null;

			// Persist to localStorage
			if (typeof window !== "undefined") {
				localStorage.setItem("token", token);
				localStorage.setItem("user", JSON.stringify(user));
			}
		},
		clearCredentials: (state) => {
			state.user = null;
			state.token = null;
			state.isAuthenticated = false;
			state.isLoading = false;
			state.error = null;

			// Clear both localStorage and cookies
			if (typeof window !== "undefined") {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				CookieManager.removeAuthToken();
			}
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
			state.isLoading = false;
		},
	},
});

export const { setCredentials, clearCredentials, setLoading, setError } =
	authSlice.actions;

export default authSlice.reducer;
