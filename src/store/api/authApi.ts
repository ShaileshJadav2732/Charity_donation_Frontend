import { apiSlice } from "./apiSlice";
import { User } from "@/types";

// Define auth API endpoints
export const authApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// Register a new user

		register: builder.mutation<
			{ message: string; user: User; token: string },
			{ email: string; firebaseUid: string; role: string }
		>({
			query: (credentials) => ({
				url: "/auth/register",
				method: "POST",
				body: credentials,
			}),
			invalidatesTags: ["User"],
		}),

		// Login user
		login: builder.mutation<
			{ message: string; user: User; token: string },
			{ firebaseUid: string }
		>({
			query: (credentials) => ({
				url: "/auth/login",
				method: "POST",
				body: credentials,
			}),
			invalidatesTags: ["User"],
		}),

		// Verify Firebase token
		verifyToken: builder.mutation<
			{ message: string; user: User; token: string },
			{ idToken: string }
		>({
			query: (data) => ({
				url: "/auth/verify-token",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["User"],
		}),
	}),
});

export const { useRegisterMutation, useLoginMutation, useVerifyTokenMutation } =
	authApi;
