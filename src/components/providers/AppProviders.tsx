"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadUserFromStorage } from "../../store/slices/authSlice";
import { store } from "../../store/store";

interface AppProvidersProps {
	children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 5, // 5 minutes
						refetchOnWindowFocus: false,
						retry: 1,
					},
				},
			})
	);

	useEffect(() => {
		store.dispatch(loadUserFromStorage());
	}, []);

	return (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				{children}
				<ToastContainer
					position="top-right"
					autoClose={3000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
				/>
			</QueryClientProvider>
		</Provider>
	);
}
