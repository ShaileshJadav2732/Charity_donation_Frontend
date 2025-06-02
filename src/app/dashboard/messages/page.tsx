"use client";

import React from "react";
import { Box } from "@mui/material";
import MessagingDashboard from "@/components/messaging/MessagingDashboard";
import { MessageProvider } from "@/contexts/MessageContext";

const MessagesPage: React.FC = () => {
	return (
		<MessageProvider>
			<Box sx={{ height: "100vh", overflow: "hidden" }}>
				<MessagingDashboard />
			</Box>
		</MessageProvider>
	);
};

export default MessagesPage;
