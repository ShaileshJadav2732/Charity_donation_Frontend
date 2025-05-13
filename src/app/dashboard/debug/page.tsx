"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
	Box,
	Typography,
	Paper,
	Button,
	Divider,
	Alert,
	TextField,
	Card,
	CardContent,
} from "@mui/material";
import { useCreateCauseMutation } from "@/store/api/causeApi";

export default function DebugPage() {
	const { user, token, isAuthenticated } = useSelector(
		(state: RootState) => state.auth
	);
	const [createCause, { isLoading, error }] = useCreateCauseMutation();

	const handleTestCauseCreation = async () => {
		try {
			const result = await createCause({
				title: "Test Cause",
				description: "This is a test cause created from the debug page",
				targetAmount: 1000,
				imageUrl: "https://placehold.co/600x400?text=Test+Cause",
				tags: ["test", "debug"],
				organizationId: user?._id || "",
			}).unwrap();

			console.log("Cause created successfully:", result);
			alert("Cause created successfully!");
		} catch (err) {
			console.error("Error creating cause:", err);
			alert("Error creating cause. See console for details.");
		}
	};

	return (
		<Box p={4}>
			<Typography variant="h4" gutterBottom>
				Debug Information
			</Typography>

			<Paper elevation={3} sx={{ p: 3, mb: 3 }}>
				<Typography variant="h6" gutterBottom>
					Authentication Status
				</Typography>
				<Box display="flex" gap={1} mb={2}>
					<Alert severity={isAuthenticated ? "success" : "error"}>
						{isAuthenticated ? "Authenticated" : "Not Authenticated"}
					</Alert>
				</Box>

				<Typography variant="subtitle1" gutterBottom>
					Token:
				</Typography>
				<TextField
					fullWidth
					multiline
					rows={3}
					value={token || "No token"}
					InputProps={{ readOnly: true }}
					sx={{ mb: 2 }}
				/>

				<Divider sx={{ my: 2 }} />

				<Typography variant="h6" gutterBottom>
					User Information
				</Typography>
				{user ? (
					<Card variant="outlined" sx={{ mb: 2 }}>
						<CardContent>
							<Box display="grid" gap={1}>
								<Box display="flex" justifyContent="space-between">
									<Typography variant="subtitle2">ID:</Typography>
									<Typography>{user.id}</Typography>
								</Box>
								<Box display="flex" justifyContent="space-between">
									<Typography variant="subtitle2">_ID:</Typography>
									<Typography>{user._id || "Not available"}</Typography>
								</Box>
								<Box display="flex" justifyContent="space-between">
									<Typography variant="subtitle2">Email:</Typography>
									<Typography>{user.email}</Typography>
								</Box>
								<Box display="flex" justifyContent="space-between">
									<Typography variant="subtitle2">Role:</Typography>
									<Typography>{user.role}</Typography>
								</Box>
								<Box display="flex" justifyContent="space-between">
									<Typography variant="subtitle2">
										Profile Completed:
									</Typography>
									<Typography>
										{user.profileCompleted ? "Yes" : "No"}
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				) : (
					<Alert severity="warning">No user information available</Alert>
				)}

				<Divider sx={{ my: 2 }} />

				<Typography variant="h6" gutterBottom>
					API Test
				</Typography>
				<Button
					variant="contained"
					onClick={handleTestCauseCreation}
					disabled={
						isLoading || !isAuthenticated || user?.role !== "organization"
					}
				>
					{isLoading ? "Creating..." : "Test Create Cause"}
				</Button>
				{user?.role !== "organization" && (
					<Alert severity="warning" sx={{ mt: 2 }}>
						Only organizations can create causes
					</Alert>
				)}
				{error && (
					<Alert severity="error" sx={{ mt: 2 }}>
						API Error: {JSON.stringify(error)}
					</Alert>
				)}

				<Divider sx={{ my: 2 }} />

				<Typography variant="subtitle1" gutterBottom>
					Raw User Object:
				</Typography>
				<TextField
					fullWidth
					multiline
					rows={10}
					value={JSON.stringify(user, null, 2)}
					InputProps={{ readOnly: true }}
				/>
			</Paper>
		</Box>
	);
}
