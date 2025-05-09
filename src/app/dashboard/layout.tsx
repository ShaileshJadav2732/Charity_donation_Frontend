"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import NoSSR from "@/components/common/NoSSR";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<NoSSR>
			<DashboardLayout>{children}</DashboardLayout>
		</NoSSR>
	);
}
