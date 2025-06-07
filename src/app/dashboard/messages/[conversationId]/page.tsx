"use client";

import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { useParams } from "next/navigation";
import MessagingDashboard from "@/components/messaging/MessagingDashboard";
import { MessageProvider } from "@/contexts/MessageContext";

const ConversationPage: React.FC = () => {
	const params = useParams();
	const conversationId = params?.conversationId as string;

	// Lock scroll when component mounts, unlock when unmounts
	useEffect(() => {
		// Lock main page scroll
		document.body.style.overflow = "hidden";
		document.documentElement.style.overflow = "hidden";

		// Cleanup function to unlock scroll when leaving the page
		return () => {
			document.body.style.overflow = "unset";
			document.documentElement.style.overflow = "unset";
		};
	}, []);

	return (
		<MessageProvider>
			<Box sx={{ height: "100vh", overflow: "hidden" }}>
				<MessagingDashboard initialConversationId={conversationId} />
			</Box>
		</MessageProvider>
	);
};

export default ConversationPage;
