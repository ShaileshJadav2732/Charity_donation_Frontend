import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface VoiceCommand {
	type: "MONEY" | "ITEMS";
	amount?: number;
	itemType?: string;
	quantity?: number;
	unit?: string;
	description?: string;
	confidence: number;
	originalText: string;
}

export interface VoiceCommandResponse {
	command: VoiceCommand;
	isValid: boolean;
	suggestions: string[];
	confidence: number;
}

export interface ProcessVoiceCommandRequest {
	text: string;
}

const voiceCommandApi = createApi({
	reducerPath: "voiceCommandApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL,
		prepareHeaders: (headers) => {
			const token = localStorage.getItem("token");
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ["VoiceCommand"],
	endpoints: (builder) => ({
		processVoiceCommand: builder.mutation<
			{ data: VoiceCommandResponse },
			ProcessVoiceCommandRequest
		>({
			query: (body) => ({
				url: "/process",
				method: "POST",
				body,
			}),
		}),
	}),
});

export const { useProcessVoiceCommandMutation } = voiceCommandApi;

export default voiceCommandApi;
