"use client";

import { useState, useEffect } from "react";
import DonationForm from "@/components/donation/DonationForm";
import { DonationFormData, Organization } from "@/types/donation";
import { useCreateDonationMutation } from "@/store/api/donationApi";
import { toast } from "react-hot-toast";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function NewDonationPage() {
	const router = useRouter();
	const {
		user,
		isAuthenticated,
		isLoading: authLoading,
	} = useSelector((state: RootState) => state.auth);

	// Protect route for donors only
	const { isAuthorized } = useRouteGuard({
		allowedRoles: ["donor"],
		redirectTo: "/dashboard",
	});
	const [createDonation] = useCreateDonationMutation();
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch organizations
	useEffect(() => {
		const fetchOrganizations = async () => {
			try {
				// TODO: Replace with actual API call
				setOrganizations([
					{ _id: "1", name: "Organization 1", address: "Address 1" },
					{ _id: "2", name: "Organization 2", address: "Address 2" },
				]);
			} catch (error) {
				console.error("Error fetching organizations:", error);
				toast.error("Failed to load organizations");
			} finally {
				setIsLoading(false);
			}
		};

		if (isAuthenticated && user?.role === "donor") {
			fetchOrganizations();
		}
	}, [isAuthenticated, user]);

	const handleSubmit = async (data: DonationFormData) => {
		try {
			await createDonation(data).unwrap();
			toast.success("Donation created successfully!");
			router.push("/dashboard/donations"); // Redirect to donations list after success
		} catch (error) {
			toast.error("Failed to create donation");
			console.error("Donation error:", error);
		}
	};

	// Show loading state while checking authentication
	if (authLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	// If not authenticated or not a donor, don't render the form
	if (!isAuthenticated || !isAuthorized) {
		return null;
	}

	// Show loading state while fetching organizations
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto">
			<h1 className="text-3xl font-bold text-gray-900 mb-8">Make a Donation</h1>
			<div className="bg-white rounded-xl shadow-md p-6">
				<DonationForm organizations={organizations} onSubmit={handleSubmit} />
			</div>
		</div>
	);
}
