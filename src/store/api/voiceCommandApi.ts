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

export interface VoiceCommandHelpResponse {
	examples: {
		monetary: string[];
		items: string[];
	};
	tips: string[];
	supportedItems: string[];
	minimumAmount: number;
	maximumAmount: number;
}

export interface ProcessVoiceCommandRequest {
	text: string;
}

export interface TestVoiceCommandRequest {
	text: string;
}

export interface TestVoiceCommandResponse extends VoiceCommandResponse {
	originalText: string;
	normalizedText: string;
	parsedCommand: VoiceCommand;
	confidenceLevel: string;
}

const voiceCommandApi = createApi({
	reducerPath: "voiceCommandApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "http://localhost:8080/api/voice-commands",
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

		getVoiceCommandHelp: builder.query<
			{ data: VoiceCommandHelpResponse },
			void
		>({
			query: () => ({
				url: "/help",
				method: "GET",
			}),
			providesTags: ["VoiceCommand"],
		}),

		testVoiceCommand: builder.mutation<
			{ data: TestVoiceCommandResponse },
			TestVoiceCommandRequest
		>({
			query: (body) => ({
				url: "/test",
				method: "POST",
				body,
			}),
		}),
	}),
});

export const {
	useProcessVoiceCommandMutation,
	useGetVoiceCommandHelpQuery,
	useTestVoiceCommandMutation,
} = voiceCommandApi;

export default voiceCommandApi;
