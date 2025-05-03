import type { AppProps } from "next/app";
import { AuthProvider } from "../contexts/AuthContext";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
axios.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers["Authorization"] = `Bearer ${token}`;
	}
	return config;
});

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<AuthProvider>
			<Component {...pageProps} />
		</AuthProvider>
	);
}

export default MyApp;
