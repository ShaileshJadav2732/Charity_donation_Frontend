"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
export default function ItemDonationTypeRedirect({
	params,
}: {
	params: Promise<{ type: string }>;
}) {
	const router = useRouter();
	const { type } = use(params);

	useEffect(() => {
		// Redirect to the new analytics route with the type parameter
		router.replace(`/dashboard/analytics/donations/${type}`);
	}, [router, type]);

	return (
		<div className="flex justify-center items-center h-64">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
				<p className="text-gray-600">Redirecting to Analytics...</p>
			</div>
		</div>
	);
}
