import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
	useLoginWithEmailMutation,
	useLoginWithGoogleMutation,
	useLogoutMutation,
	useSignupWithEmailMutation,
	useSignupWithGoogleMutation,
} from "../store/services/authApi";
import { clearCredentials, setCredentials } from "../store/slices/authSlice";
import { useAppDispatch } from "./reduxHooks";

// Email Login Hook
export const useRtkEmailLogin = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [loginWithEmail, { isLoading, error, isSuccess, data }] =
		useLoginWithEmailMutation();

	useEffect(() => {
		if (isSuccess && data) {
			// Update Redux store with user data
			dispatch(setCredentials({ user: data.user }));

			// Toast notification
			toast.success("Login successful");

			// Redirect based on role and profile completion
			const { role, isProfileCompleted } = data.user;
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
		}
	}, [isSuccess, data, dispatch, router]);

	return {
		mutate: (credentials) => loginWithEmail(credentials),
		loginWithEmail,
		isLoading,
		error,
		isPending: isLoading,
	};
};

// Email Signup Hook
export const useRtkEmailSignup = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [signupWithEmail, { isLoading, error, isSuccess, data }] =
		useSignupWithEmailMutation();

	useEffect(() => {
		if (isSuccess && data) {
			// Update Redux store with user data
			dispatch(setCredentials({ user: data.user }));

			// Toast notification
			toast.success("Registration successful");

			// Redirect based on role and profile completion
			const { role, isProfileCompleted } = data.user;
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
		}
	}, [isSuccess, data, dispatch, router]);

	return {
		mutate: (signupData) => signupWithEmail(signupData),
		signupWithEmail,
		isLoading,
		error,
		isPending: isLoading,
	};
};

// Google Login Hook
export const useRtkGoogleLogin = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [loginWithGoogle, { isLoading, error, isSuccess, data }] =
		useLoginWithGoogleMutation();

	useEffect(() => {
		if (isSuccess && data) {
			// Update Redux store with user data
			dispatch(setCredentials({ user: data.user }));

			// Toast notification
			toast.success("Google login successful");

			// Redirect based on role and profile completion
			const { role, isProfileCompleted } = data.user;
			console.log("Login response:", { role, isProfileCompleted });

			if (role === "donor") {
				if (!isProfileCompleted) {
					router.push("/donor/complete-profile");
				} else {
					router.push("/donor/dashboard");
				}
			} else if (role === "organization") {
				if (!isProfileCompleted) {
					router.push("/organization/complete-profile");
				} else {
					router.push("/organization/dashboard");
				}
			} else {
				router.push("/dashboard");
			}
		}
	}, [isSuccess, data, dispatch, router]);

	return {
		mutate: loginWithGoogle,
		loginWithGoogle,
		isLoading,
		error,
		isPending: isLoading,
	};
};

// Google Signup Hook
export const useRtkGoogleSignup = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [signupWithGoogle, { isLoading, error, isSuccess, data }] =
		useSignupWithGoogleMutation();

	useEffect(() => {
		if (isSuccess && data) {
			// Update Redux store with user data
			dispatch(setCredentials({ user: data.user }));

			// Toast notification
			toast.success("Google signup successful");

			// Redirect based on role and profile completion
			const { role, isProfileCompleted } = data.user;
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
		}
	}, [isSuccess, data, dispatch, router]);

	return { signupWithGoogle, isLoading, error };
};

// Logout Hook
export const useRtkLogout = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [logout, { isLoading, error, isSuccess }] = useLogoutMutation();

	useEffect(() => {
		if (isSuccess) {
			// Clear Redux store
			dispatch(clearCredentials());

			// Toast notification
			toast.success("Logged out successfully");

			// Redirect to login page
			router.push("/auth/login");
		}
	}, [isSuccess, dispatch, router]);

	return { logout, isLoading, error };
};
