"use client";

import React from "react";
import { Box } from "@mui/material";
import { useParams } from "next/navigation";
import MessagingDashboard from "@/components/messaging/MessagingDashboard";
import { MessageProvider } from "@/contexts/MessageContext";

const ConversationPage: React.FC = () => {
	const params = useParams();
	const conversationId = params?.conversationId as string;

	return (
		<MessageProvider>
			<Box sx={{ height: "100vh", overflow: "hidden" }}>
				<MessagingDashboard initialConversationId={conversationId} />
			</Box>
		</MessageProvider>
	);
};

export default ConversationPage;
