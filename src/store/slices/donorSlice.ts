import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DonorState {
	activeTab: string;
	formErrors: Record<string, string>;
	// Add any other UI state you need
}

const initialState: DonorState = {
	activeTab: "profile",
	formErrors: {},
};

const donorSlice = createSlice({
	name: "donor",
	initialState,
	reducers: {
		setActiveTab: (state, action: PayloadAction<string>) => {
			state.activeTab = action.payload;
		},
		setFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
			state.formErrors = action.payload;
		},
		clearFormErrors: (state) => {
			state.formErrors = {};
		},
	},
});

export const { setActiveTab, setFormErrors, clearFormErrors } =
	donorSlice.actions;
export default donorSlice.reducer;
