"use client";

import React, { useState } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Paper,
	Alert,
	CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSendMessageMutation, useGetConversationsQuery } from "@/store/api/messageApi";
import toast from "react-hot-toast";

const MessageDebugger: React.FC = () => {
	const { user, token } = useSelector((state: RootState) => state.auth);
	const [recipientId, setRecipientId] = useState("");
	const [conversationId, setConversationId] = useState("");
	const [message, setMessage] = useState("Test message from debugger");
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<any>(null);

	const [sendMessage, { isLoading }] = useSendMessageMutation();
	const { data: conversations } = useGetConversationsQuery({ page: 1, limit: 10 });

	const handleSendMessage = async () => {
		if (!recipientId || !message) {
			toast.error("Please fill in recipient ID and message");
			return;
		}

		setError(null);
		setResult(null);

		try {
			console.log("🧪 Debug: Sending message with:", {
				conversationId: conversationId || undefined,
				recipientId,
				content: message,
				messageType: "text",
			});

			const result = await sendMessage({
				conversationId: conversationId || undefined,
				recipientId,
				content: message,
				messageType: "text",
			}).unwrap();

			setResult(result);
			toast.success("Message sent successfully!");
			console.log("✅ Debug: Message sent:", result);
		} catch (err: any) {
			setError(err);
			toast.error("Failed to send message");
			console.error("❌ Debug: Error:", err);
		}
	};

	return (
		<Paper sx={{ p: 3, m: 2 }}>
			<Typography variant="h6" gutterBottom>
				🧪 Message Debugger
			</Typography>

			<Box sx={{ mb: 2 }}>
				<Typography variant="body2" color="text.secondary">
					Current User: {user?.email} ({user?.role}) - ID: {user?.id}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Token: {token ? "✅ Present" : "❌ Missing"}
				</Typography>
			</Box>

			<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				<TextField
					label="Recipient User ID"
					value={recipientId}
					onChange={(e) => setRecipientId(e.target.value)}
					placeholder="Enter recipient user ID"
					helperText="Use a valid User ID from your database"
				/>

				<TextField
					label="Conversation ID (Optional)"
					value={conversationId}
					onChange={(e) => setConversationId(e.target.value)}
					placeholder="Leave empty for new conversation"
					helperText="Optional: Use existing conversation ID"
				/>

				<TextField
					label="Message"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					multiline
					rows={3}
				/>

				<Button
					variant="contained"
					onClick={handleSendMessage}
					disabled={isLoading || !recipientId || !message}
					startIcon={isLoading ? <CircularProgress size={20} /> : null}
				>
					{isLoading ? "Sending..." : "Send Test Message"}
				</Button>
			</Box>

			{/* Existing Conversations */}
			{conversations?.data && conversations.data.length > 0 && (
				<Box sx={{ mt: 3 }}>
					<Typography variant="subtitle2" gutterBottom>
						Existing Conversations:
					</Typography>
					{conversations.data.slice(0, 3).map((conv) => (
						<Box key={conv._id} sx={{ mb: 1, p: 1, bgcolor: "grey.100", borderRadius: 1 }}>
							<Typography variant="caption">
								ID: {conv._id} | Participants: {conv.participants.map(p => p.user.name || p.user._id).join(", ")}
							</Typography>
							<Button
								size="small"
								onClick={() => {
									setConversationId(conv._id);
									const otherParticipant = conv.participants.find(p => p.user._id !== user?.id);
									if (otherParticipant) {
										setRecipientId(otherParticipant.user._id);
									}
								}}
								sx={{ ml: 1 }}
							>
								Use This
							</Button>
						</Box>
					))}
				</Box>
			)}

			{/* Results */}
			{result && (
				<Alert severity="success" sx={{ mt: 2 }}>
					<Typography variant="subtitle2">Success!</Typography>
					<pre style={{ fontSize: "12px", marginTop: "8px" }}>
						{JSON.stringify(result, null, 2)}
					</pre>
				</Alert>
			)}

			{error && (
				<Alert severity="error" sx={{ mt: 2 }}>
					<Typography variant="subtitle2">Error!</Typography>
					<pre style={{ fontSize: "12px", marginTop: "8px" }}>
						{JSON.stringify(error, null, 2)}
					</pre>
				</Alert>
			)}
		</Paper>
	);
};

export default MessageDebugger;
