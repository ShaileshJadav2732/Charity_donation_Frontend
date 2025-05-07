import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppDispatch } from "./reduxHooks";
import {
	setLoading,
	setError,
	setCredentials,
	clearCredentials,
} from "../store/slices/authSlice";
import authService from "../services/auth.service";
import {
	EmailLoginPayload,
	EmailSignupPayload,
	UserRole,
} from "../types/auth.types";
import { ApiError } from "../types/error.types";

// Email Login Hook
export const useEmailLogin = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: EmailLoginPayload) => {
			dispatch(setLoading(true));
			try {
				const response = await authService.loginWithEmail(credentials);
				dispatch(setCredentials(response));
				return response;
			} catch (error: unknown) {
				const err = error as ApiError;
				dispatch(setError(err.message));
				throw err;
			}
		},
		onSuccess: (data) => {
			toast.success("Login successful");
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });

			const { role } = data.user;
			const { isProfileCompleted } = data.user;

			if (role === "donor") {
				if (!isProfileCompleted) {
					router.push("/donor/complete-profile");
				} else {
					router.push("/donor/dashboard");
				}
			} else if (role === "organization") {
				router.push("/organization/dashboard");
			} else {
				router.push("/dashboard");
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Login failed. Please try again.");
		},
	});
};

// Email Signup Hook
export const useEmailSignup = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userData: EmailSignupPayload) => {
			dispatch(setLoading(true));
			try {
				const response = await authService.signupWithEmail(userData);
				dispatch(setCredentials(response));
				return response;
			} catch (error: unknown) {
				const err = error as ApiError;
				dispatch(setError(err.message));
				throw err;
			}
		},
		onSuccess: (data) => {
			toast.success("Registration successful");
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			const { role } = data.user;
			const { isProfileCompleted } = data.user;

			if (role === "donor") {
				if (!isProfileCompleted) {
					router.push("/donor/complete-profile");
				} else {
					router.push("/donor/dashboard");
				}
			} else if (role === "organization") {
				router.push("/organization/dashboard");
			} else {
				router.push("/dashboard");
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Registration failed. Please try again.");
		},
	});
};

// Google Login Hook
export const useGoogleLogin = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			dispatch(setLoading(true));
			try {
				const response = await authService.loginWithGoogle();
				dispatch(setCredentials(response));
				return response;
			} catch (error: unknown) {
				const err = error as ApiError;
				if (err.response && err.response.status === 404) {
					router.push("/auth/signup");
					throw new Error("User not found. Please complete registration.");
				}
				dispatch(setError(err.message));
				throw err;
			}
		},
		onSuccess: (data) => {
			toast.success("Google login successful");
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });

			const { role } = data.user;
			const { isProfileCompleted } = data.user;

			if (role === "donor") {
				if (!isProfileCompleted) {
					router.push("/donor/complete-profile");
				} else {
					router.push("/donor/dashboard");
				}
			} else if (role === "organization") {
				router.push("/organization/dashboard");
			} else {
				router.push("/dashboard");
			}
		},
		onError: (error: Error) => {
			if (!error.message.includes("Please complete registration")) {
				toast.error(error.message || "Google login failed. Please try again.");
			}
		},
	});
};

// Google Signup Hook
export const useGoogleSignup = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (role: UserRole) => {
			dispatch(setLoading(true));
			try {
				const response = await authService.signupWithGoogle(role);
				dispatch(setCredentials(response));
				return response;
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Something went wrong";
				dispatch(setError(message));
				throw new Error(message);
			}
		},
		onSuccess: (data) => {
			toast.success("Google signup successful");
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			const { role } = data.user;
			const { isProfileCompleted } = data.user;

			if (role === "donor") {
				if (!isProfileCompleted) {
					router.push("/donor/complete-profile");
				} else {
					router.push("/donor/dashboard");
				}
			} else if (role === "organization") {
				router.push("/organization/dashboard");
			} else {
				router.push("/dashboard");
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Google signup failed. Please try again.");
		},
	});
};

// Logout Hook
export const useLogout = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			dispatch(setLoading(true));
			try {
				await authService.logout();
				dispatch(clearCredentials());
				return null;
			} catch (error: unknown) {
				const err = error as ApiError;
				dispatch(setError(err.message));
				throw err;
			}
		},
		onSuccess: () => {
			toast.success("Logged out successfully");
			queryClient.clear();
			router.push("/auth/login");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Logout failed. Please try again.");
		},
	});
};
