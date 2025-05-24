"use client";

import { Provider } from "react-redux";
import { store } from "./store/store";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
<<<<<<< Updated upstream
=======
import { SocketProvider } from "./contexts/SocketContext";
>>>>>>> Stashed changes

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Provider store={store}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
<<<<<<< Updated upstream
				{children}
=======
				<SocketProvider>{children}</SocketProvider>
>>>>>>> Stashed changes
			</LocalizationProvider>
		</Provider>
	);
}
