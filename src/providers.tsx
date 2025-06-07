"use client";

import { Provider } from "react-redux";
import { store } from "./store/store";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SocketProvider } from "./contexts/SocketContext";
import { MessageProvider } from "./contexts/MessageContext";
import { AuthProvider } from "./contexts/AuthContext";
import AuthErrorBoundary from "./components/common/AuthErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Provider store={store}>
			<AuthErrorBoundary>
				<AuthProvider>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<SocketProvider>
							<MessageProvider>{children}</MessageProvider>
						</SocketProvider>
					</LocalizationProvider>
				</AuthProvider>
			</AuthErrorBoundary>
		</Provider>
	);
}
