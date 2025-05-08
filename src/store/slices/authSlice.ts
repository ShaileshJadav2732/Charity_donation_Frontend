import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
	id: string;
	email: string;
	role: string;
	displayName?: string;
	photoURL?: string;
	isProfileCompleted?: boolean;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		loginStart: (state) => {
			state.isLoading = true;
			state.error = null;
		},
		loginSuccess: (state, action: PayloadAction<User>) => {
			state.isLoading = false;
			state.isAuthenticated = true;
			state.user = action.payload;
			state.error = null;
		},
		loginFailure: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.isAuthenticated = false;
			state.error = action.payload;
		},
		logout: (state) => {
			state.user = null;
			state.isAuthenticated = false;
			state.error = null;
		},
		updateUser: (state, action: PayloadAction<Partial<User>>) => {
			if (state.user) {
				state.user = { ...state.user, ...action.payload };
			}
		},
		clearErrors: (state) => {
			state.error = null;
		},
	},
});

export const {
	loginStart,
	loginSuccess,
	loginFailure,
	logout,
	updateUser,
	clearErrors,
} = authSlice.actions;

export default authSlice.reducer;
export const setCredentials = loginSuccess;
export const clearCredentials = logout;
