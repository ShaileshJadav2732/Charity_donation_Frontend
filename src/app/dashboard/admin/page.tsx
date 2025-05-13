"use client";

import React from "react";
import { Typography } from "@mui/material";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const AdminPage = () => {
	const { user } = useSelector((state: RootState) => state.auth);

	if (!user || user.role !== "admin") {
		return (
			<Typography variant="h5" color="error">
				Access Denied. Only administrators can view this page.
			</Typography>
		);
	}

	return <AdminDashboard />;
};

export default AdminPage;
