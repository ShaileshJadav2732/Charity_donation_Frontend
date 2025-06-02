"use client";

import { Provider } from "react-redux";
import { store } from "./store/store";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SocketProvider } from "./contexts/SocketContext";
import { MessageProvider } from "./contexts/MessageContext";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Provider store={store}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<SocketProvider>
					<MessageProvider>
						{children}
					</MessageProvider>
				</SocketProvider>
			</LocalizationProvider>
		</Provider>
	);
}
