"use client";

import OrganizationDonations from "@/components/pendingDonation/PendingDonation";
import { useGetCurrentOrganizationQuery } from "@/store/api/organizationApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const Page = () => {
	const { token } = useSelector((state: RootState) => state.auth);
	const { data, isLoading, isError, error } = useGetCurrentOrganizationQuery();

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
