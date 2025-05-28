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

	return (
		<div>
			<OrganizationDonations organizationId={data.organization._id} />
		</div>
	);
};

export default Page;
