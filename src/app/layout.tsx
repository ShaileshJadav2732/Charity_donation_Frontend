import { Toaster } from "react-hot-toast";
import { Providers } from "@/providers";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata = {
	favicon: "@/public/favicon-g.png",
	title: "GreenGive",
	description:
		"Connect with charitable organizations and contribute to causes you care about.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body suppressHydrationWarning>
				<Providers>
					<AuthProvider>
						<Toaster position="top-right" />
						{children}
					</AuthProvider>
				</Providers>
			</body>
		</html>
	);
}
