"use client";

import OrganizationDonations from "@/components/pendingDonation/PendingDonation";
import { useGetCurrentOrganizationQuery } from "@/store/api/organizationApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const Page = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, isError, error } = useGetCurrentOrganizationQuery();

  console.log("Auth Token:", token);
  console.log("Full API Response:", data);
  console.log("Organization data:", data?.organization);
  console.log("Loading state:", isLoading);
  console.log("Error state:", isError);
  console.log("Error details:", error);

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
