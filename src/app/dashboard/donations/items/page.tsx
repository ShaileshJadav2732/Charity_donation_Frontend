"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ItemDonationsRedirect() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to the new analytics route
		router.replace("/dashboard/analytics/donations");
	}, [router]);

	return (
		<div className="flex justify-center items-center h-64">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
				<p className="text-gray-600">Redirecting to Analytics...</p>
			</div>
		</div>
	);
}
