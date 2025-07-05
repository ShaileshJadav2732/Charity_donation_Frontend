"use client";

import OrganizationDonations from "@/components/pendingDonation/PendingDonation";
import { useGetCurrentOrganizationQuery } from "@/store/api/organizationApi";

const Page = () => {
	const { data, isLoading, isError } = useGetCurrentOrganizationQuery();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError || !data?.organization) {
		return <div>Error loading organization data</div>;
	}

	// Ensure organization ID exists before rendering the component
	const organizationId = data.organization._id || data.organization.id;
	if (!organizationId) {
		return <div>Organization ID not found</div>;
	}

	return (
		<div>
			<OrganizationDonations organizationId={organizationId} />
		</div>
	);
};

export default Page;
