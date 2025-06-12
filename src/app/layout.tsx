import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/providers";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
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
			<body className={inter.className} suppressHydrationWarning>
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
