"use client";

import { useAuth } from "@/hooks/useAuth";
import { parseError, SignupFormData, RegistrationResponse } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import SuccessAnimation from "@/components/ui/SuccessAnimation";

import {
	Email as EmailIcon,
	Lock as LockIcon,
	ArrowForward as ArrowForwardIcon,
	Check as CheckIcon,
} from "@mui/icons-material";

const SignupForm = () => {
	const router = useRouter();
	const { signup, loginWithGoogle, isLoading } = useAuth();

	const [formData, setFormData] = useState<SignupFormData>({
		email: "",
		password: "",
		confirmPassword: "",
		role: "donor",
	});

	const [formStage, setFormStage] = useState<"credentials" | "role">(
		"credentials"
	);
	const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
	const [signupResponse, setSignupResponse] =
		useState<RegistrationResponse | null>(null);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [focusedField, setFocusedField] = useState<string | null>(null);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handleFocus = (fieldName: string) => {
		setFocusedField(fieldName);
	};

	const handleBlur = () => {
		setFocusedField(null);
	};

	const validateCredentials = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password.trim()) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		if (!formData.confirmPassword.trim()) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNextStage = () => {
		if (validateCredentials()) {
			setFormStage("role");
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateCredentials()) {
			return;
		}

		try {
			const response = await signup(formData);
			setSignupResponse(response);
			setShowSuccessAnimation(true);
		} catch (error: unknown) {
			const parsedError = parseError(error);
			toast.error(parsedError.message || "Failed to create account");
		}
	};

	const handleGoogleSignup = async () => {
		try {
			toast.loading("Signing in with Google...", { id: "google-signup" });

			// Check if browser supports popups
			const popupBlocked = window.innerWidth < 1 || window.innerHeight < 1;
			if (popupBlocked) {
				toast.dismiss("google-signup");
				toast.error("Please allow popups for this site to use Google signup");
				return;
			}

			await loginWithGoogle();
			toast.dismiss("google-signup");
			toast.success("Google account connected successfully!");
		} catch (error: unknown) {
			toast.dismiss("google-signup");
			const parsedError = parseError(error);

			// Provide more user-friendly error messages
			if (parsedError.message?.includes("popup")) {
				toast.error(
					"Google signup popup was blocked. Please allow popups for this site."
				);
			} else if (parsedError.message?.includes("network")) {
				toast.error(
					"Network error. Please check your internet connection and try again."
				);
			} else if (parsedError.message?.includes("cancelled")) {
				toast.error("Google signup was cancelled. Please try again.");
			} else {
				toast.error(parsedError.message || "Failed to sign up with Google");
			}
		}
	};

	// Password strength checker
	const getPasswordStrength = (password: string) => {
		if (!password) return { strength: 0, text: "" };
		if (password.length < 6) return { strength: 1, text: "Weak" };
		if (password.length < 10) return { strength: 2, text: "Moderate" };
		if (password.length >= 10) return { strength: 3, text: "Strong" };
		return { strength: 0, text: "" };
	};

	const passwordStrength = getPasswordStrength(formData.password);

	return (
		<>
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-12 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-6">
					{/* Logo */}
					<div className="flex justify-center">
						<svg
							className="h-12 w-12 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					</div>
					<div className="bg-white shadow-lg rounded-2xl overflow-hidden">
						{/* Header */}
						<div className="px-6 py-8 text-center">
							<h1 className="text-2xl font-bold text-gray-900">
								Join CharityHub
							</h1>
							<p className="mt-1 text-sm text-gray-600">
								Create an account to start making a difference
							</p>
						</div>

						{/* Progress Steps */}
						<div className="flex justify-center py-4">
							<div className="flex items-center space-x-2">
								<div
									className={`flex items-center justify-center w-8 h-8 rounded-full ${
										formStage === "credentials"
											? "bg-green-600 text-white"
											: "bg-green-500 text-white"
									} transition-colors duration-200`}
									aria-label={
										formStage === "credentials"
											? "Current step 1"
											: "Completed step 1"
									}
								>
									{formStage === "role" ? (
										<CheckIcon className="w-5 h-5" aria-hidden="true" />
									) : (
										"1"
									)}
								</div>
								<div
									className={`w-12 h-1 ${
										formStage === "role" ? "bg-green-500" : "bg-gray-200"
									} transition-colors duration-200`}
								></div>
								<div
									className={`flex items-center justify-center w-8 h-8 rounded-full ${
										formStage === "role"
											? "bg-green-600 text-white"
											: "bg-gray-200 text-gray-600"
									} transition-colors duration-200`}
									aria-label={
										formStage === "role" ? "Current step 2" : "Step 2"
									}
								>
									2
								</div>
							</div>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
							{formStage === "credentials" ? (
								<>
									{/* Email Field */}
									<div>
										<label
											htmlFor="email"
											className="block text-sm font-medium text-gray-700"
										>
											Email Address
										</label>
										<div className="mt-1 relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<EmailIcon
													className="h-5 w-5 text-gray-400"
													aria-hidden="true"
												/>
											</div>
											<input
												type="email"
												id="email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												onFocus={() => handleFocus("email")}
												onBlur={handleBlur}
												required
												className={`appearance-none block w-full pl-10 pr-3 py-2.5 rounded-md border ${
													focusedField === "email"
														? "border-teal-500 ring-1 ring-teal-200"
														: "border-gray-200"
												} focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
												placeholder="you@example.com"
												aria-describedby="email"
											/>
										</div>
									</div>

									{/* Password Field */}
									<div>
										<label
											htmlFor="password"
											className="block text-sm font-medium text-gray-700"
										>
											Password
										</label>
										<div className="mt-1 relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<LockIcon
													className="h-5 w-5 text-gray-400"
													aria-hidden="true"
												/>
											</div>
											<input
												type="password"
												id="password"
												name="password"
												value={formData.password}
												onChange={handleChange}
												onFocus={() => handleFocus("password")}
												onBlur={handleBlur}
												required
												minLength={6}
												className={`appearance-none block w-full pl-10 pr-3 py-2.5 rounded-md border ${
													focusedField === "password"
														? "border-teal-500 ring-1 ring-teal-200"
														: "border-gray-200"
												} focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
												placeholder="••••••••"
												aria-describedby="password"
											/>
										</div>
										{formData.password && (
											<div className="mt-2">
												<div className="flex items-center">
													<div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
														<div
															className={`h-full ${
																passwordStrength.strength === 1
																	? "bg-red-500"
																	: passwordStrength.strength === 2
																	? "bg-yellow-500"
																	: "bg-green-500"
															} transition-all duration-200`}
															style={{
																width: `${passwordStrength.strength * 33.3}%`,
															}}
														></div>
													</div>
													<span className="ml-2 text-xs text-gray-600">
														{passwordStrength.text}
													</span>
												</div>
												<p className="text-xs text-gray-500 mt-1">
													Minimum 6 characters
												</p>
											</div>
										)}
									</div>

									{/* Confirm Password Field */}
									<div>
										<label
											htmlFor="confirmPassword"
											className="block text-sm font-medium text-gray-700"
										>
											Confirm Password
										</label>
										<div className="mt-1 relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<LockIcon
													className="h-5 w-5 text-gray-400"
													aria-hidden="true"
												/>
											</div>
											<input
												type="password"
												id="confirmPassword"
												name="confirmPassword"
												value={formData.confirmPassword}
												onChange={handleChange}
												onFocus={() => handleFocus("confirmPassword")}
												onBlur={handleBlur}
												required
												className={`appearance-none block w-full pl-10 pr-10 py-2.5 rounded-md border ${
													focusedField === "confirmPassword"
														? "border-teal-500 ring-1 ring-teal-200"
														: "border-gray-200"
												} focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
												placeholder="••••••••"
												aria-describedby="confirmPassword"
											/>
											{formData.password && formData.confirmPassword && (
												<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
													{formData.password === formData.confirmPassword ? (
														<CheckIcon
															className="h-5 w-5 text-green-500"
															aria-hidden="true"
														/>
													) : (
														<svg
															className="h-5 w-5 text-red-500"
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 20 20"
															fill="currentColor"
															aria-hidden="true"
														>
															<path
																fillRule="evenodd"
																d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
																clipRule="evenodd"
															/>
														</svg>
													)}
												</div>
											)}
										</div>
										{formData.password &&
											formData.confirmPassword &&
											formData.password !== formData.confirmPassword && (
												<p className="text-xs text-red-500 mt-1">
													Passwords do not match
												</p>
											)}
									</div>

									{/* Next Button */}
									<button
										type="button"
										onClick={handleNextStage}
										disabled={isLoading}
										className="w-full flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
										aria-label="Continue to role selection"
									>
										Continue
										<ArrowForwardIcon
											className="ml-2 h-5 w-5"
											aria-hidden="true"
										/>
									</button>
								</>
							) : (
								/* Role Selection Stage */
								<>
									<div className="space-y-2">
										<label className="block text-sm font-medium text-gray-700">
											I want to join as
										</label>
										<div className="grid grid-cols-2 gap-4 mt-2">
											<div
												onClick={() =>
													setFormData((prev) => ({ ...prev, role: "donor" }))
												}
												className={`flex flex-col items-center p-4 border rounded-md cursor-pointer transition-all duration-200 ${
													formData.role === "donor"
														? "border-green-500 bg-green-50"
														: "border-gray-200 hover:bg-green-50"
												}`}
												role="button"
												tabIndex={0}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ")
														setFormData((prev) => ({ ...prev, role: "donor" }));
												}}
												aria-label="Select Individual Donor role"
											>
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center ${
														formData.role === "donor"
															? "bg-green-100"
															: "bg-gray-100"
													} transition-colors duration-200`}
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className={`h-5 w-5 ${
															formData.role === "donor"
																? "text-green-600"
																: "text-gray-500"
														} transition-colors duration-200`}
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														aria-hidden="true"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
														/>
													</svg>
												</div>
												<div className="mt-2 text-center">
													<h3
														className={`text-sm font-medium ${
															formData.role === "donor"
																? "text-green-600"
																: "text-gray-700"
														} transition-colors duration-200`}
													>
														Individual Donor
													</h3>
													<p className="text-xs text-gray-500 mt-1">
														Support causes you care about
													</p>
												</div>
											</div>

											<div
												onClick={() =>
													setFormData((prev) => ({
														...prev,
														role: "organization",
													}))
												}
												className={`flex flex-col items-center p-4 border rounded-md cursor-pointer transition-all duration-200 ${
													formData.role === "organization"
														? "border-green-500 bg-green-50"
														: "border-gray-200 hover:bg-green-50"
												}`}
												role="button"
												tabIndex={0}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ")
														setFormData((prev) => ({
															...prev,
															role: "organization",
														}));
												}}
												aria-label="Select Organization role"
											>
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center ${
														formData.role === "organization"
															? "bg-green-100"
															: "bg-gray-100"
													} transition-colors duration-200`}
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className={`h-5 w-5 ${
															formData.role === "organization"
																? "text-green-600"
																: "text-gray-500"
														} transition-colors duration-200`}
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														aria-hidden="true"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
														/>
													</svg>
												</div>
												<div className="mt-2 text-center">
													<h3
														className={`text-sm font-medium ${
															formData.role === "organization"
																? "text-green-600"
																: "text-gray-700"
														} transition-colors duration-200`}
													>
														Organization
													</h3>
													<p className="text-xs text-gray-500 mt-1">
														Create fundraising campaigns
													</p>
												</div>
											</div>
										</div>
										<input type="hidden" name="role" value={formData.role} />
									</div>

									<div className="flex space-x-4 mt-6">
										<button
											type="button"
											onClick={() => setFormStage("credentials")}
											className="w-1/3 py-2.5 px-4 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
											aria-label="Back to credentials"
										>
											Back
										</button>
										<button
											type="submit"
											disabled={isLoading}
											className="w-2/3 flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
											aria-label="Create account"
										>
											{isLoading ? (
												<>
													<svg
														className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
													>
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														></circle>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														></path>
													</svg>
													Creating Account...
												</>
											) : (
												<>
													Create Account
													<ArrowForwardIcon
														className="ml-2 h-5 w-5"
														aria-hidden="true"
													/>
												</>
											)}
										</button>
									</div>
								</>
							)}
						</form>

						{/* Divider - Only show on first stage */}
						{formStage === "credentials" && (
							<>
								<div className="px-6 py-4">
									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-gray-200"></div>
										</div>
										<div className="relative flex justify-center text-sm">
											<span className="px-2 bg-white text-gray-500">
												Or sign up with
											</span>
										</div>
									</div>
								</div>

								{/* Google Signup Button */}
								<div className="px-6 pb-6 space-y-4">
									<button
										onClick={handleGoogleSignup}
										disabled={isLoading}
										className="w-full flex justify-center items-center px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
										aria-label="Continue with Google"
									>
										<FcGoogle className="h-5 w-5 mr-2" aria-hidden="true" />
										Sign up with Google
									</button>

									{/* Login Link */}
									<div className="text-center text-sm">
										<p className="text-gray-600">
											Already have an account?{" "}
											<Link
												href="/login"
												className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
											>
												Sign in
											</Link>
										</p>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Success Animation */}
			{showSuccessAnimation && (
				<SuccessAnimation
					title="Welcome to GreenGive! 🎉"
					message="Your account has been created successfully. Let's start making a difference together!"
					onComplete={() => {
						setShowSuccessAnimation(false);
						if (signupResponse?.user.profileCompleted) {
							router.push("/dashboard/home");
						} else {
							router.push("/complete-profile");
						}
					}}
					duration={4000}
				/>
			)}
		</>
	);
};

export default SignupForm;
