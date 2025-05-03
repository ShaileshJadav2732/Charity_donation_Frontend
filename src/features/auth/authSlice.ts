import { AuthState, ISignupData } from "@/types/user";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState: AuthState = {
	user: null,
	token: null,
	loading: false,
	error: null,
};

// Async action for signup
export const signupUser = createAsyncThunk(
	"auth/signupUser",
	async (formData: ISignupData, { rejectWithValue }) => {
		try {
			const response = await axios.post(
				"http://localhost:8080/api/users/register",
				formData
			);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || "Signup failed"
				);
			}
			return rejectWithValue("Signup failed");
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(signupUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(signupUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user;
				state.token = action.payload.token;
			})
			.addCase(signupUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export default authSlice.reducer;
