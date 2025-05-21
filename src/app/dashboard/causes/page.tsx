"use client";
import React from "react";
import DonorCausePage from "@/components/cause/DonorCausePage";
import OrganizationCausePage from "@/components/cause/OrganizationCausePage";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const Page = () => {
	const { user } = useSelector((state: RootState) => state.auth);

	return (
		<div>
			{user?.role === "donor" ? <DonorCausePage /> : <OrganizationCausePage />}
		</div>
	);
};

export default Page;
