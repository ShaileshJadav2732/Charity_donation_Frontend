"use client";

import { Provider } from "react-redux";
import { store } from "./store/store";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Provider store={store}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				{children}
			</LocalizationProvider>
		</Provider>
	);
}
