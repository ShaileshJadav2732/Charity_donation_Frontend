"use client";

import { useAuth } from "@/hooks/useAuth";
import { parseError, SignupFormData } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FiArrowRight, FiLock, FiMail, FiUser, FiCheck } from "react-icons/fi";

const SignupForm = () => {
	const router = useRouter();
	const { signup, loginWithGoogle, isLoading } = useAuth();

	const [formData, setFormData] = useState<SignupFormData>({
		email: "",
		password: "",
		confirmPassword: "",
		role: "donor",
	});

	const [focusedField, setFocusedField] = useState<string | null>(null);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFocus = (fieldName: string) => {
		setFocusedField(fieldName);
	};

	const handleBlur = () => {
		setFocusedField(null);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			const response = await signup(formData);
			toast.success("Account created successfully!");

			if (response.user.profileCompleted) {
				router.push("/dashboard");
			} else {
				router.push("/complete-profile");
			}
		} catch (error: unknown) {
			const parsedError = parseError(error);
			toast.error(parsedError.message || "Failed to create account");
		}
	};

	const handleGoogleSignup = async () => {
		try {
			toast.loading("Signing in with Google...", { id: "google-signup" });
			await loginWithGoogle();
			toast.dismiss("google-signup");
		} catch (error: unknown) {
			toast.dismiss("google-signup");
			const parsedError = parseError(error);
			toast.error(parsedError.message || "Failed to sign up with Google");
			console.error("Google signup error:", error);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-800">
						Create an Account
					</h1>
					<p className="mt-2 text-gray-600">
						Join CharityHub to start making a difference
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="mt-8 space-y-6">
					{/* Email Field */}
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Email Address
						</label>
						<div className="relative">
							<div className="absolute left-3 top-3 text-gray-500">
								<FiMail />
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
								className={`w-full pl-10 pr-3 py-2 border ${
									focusedField === "email"
										? "border-purple-500 ring-2 ring-purple-200"
										: "border-gray-300"
								} rounded-md shadow-sm focus:outline-none text-gray-900`}
								placeholder="you@example.com"
							/>
						</div>
					</div>

					{/* Password Field */}
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Password
						</label>
						<div className="relative">
							<div className="absolute left-3 top-3 text-gray-500">
								<FiLock />
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
								className={`w-full pl-10 pr-3 py-2 border ${
									focusedField === "password"
										? "border-purple-500 ring-2 ring-purple-200"
										: "border-gray-300"
								} rounded-md shadow-sm focus:outline-none text-gray-900`}
								placeholder="Minimum 6 characters"
							/>
						</div>
					</div>

					{/* Confirm Password Field */}
					<div>
						<label
							htmlFor="confirmPassword"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Confirm Password
						</label>
						<div className="relative">
							<div className="absolute left-3 top-3 text-gray-500">
								<FiLock />
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
								className={`w-full pl-10 pr-3 py-2 border ${
									focusedField === "confirmPassword"
										? "border-purple-500 ring-2 ring-purple-200"
										: "border-gray-300"
								} rounded-md shadow-sm focus:outline-none text-gray-900`}
								placeholder="Re-enter password"
							/>
						</div>
					</div>

					{/* Role Selection */}
					<div>
						<label
							htmlFor="role"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Account Type
						</label>
						<div className="relative">
							<div className="absolute left-3 top-3 text-gray-500">
								<FiUser />
							</div>
							<select
								id="role"
								name="role"
								value={formData.role}
								onChange={handleChange}
								required
								className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-900 appearance-none"
							>
								<option value="donor">Individual Donor</option>
								<option value="organization">Organization</option>
							</select>
							<div className="absolute right-3 top-3 pointer-events-none">
								<svg
									className="h-4 w-4 text-gray-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</div>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={isLoading}
						className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
					>
						{isLoading ? (
							<>
								<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
								Creating Account...
							</>
						) : (
							<>Create Account</>
						)}
					</button>
				</form>

				{/* Divider */}
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-300"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-white text-gray-500">
							Or continue with
						</span>
					</div>
				</div>

				{/* Google Signup Button */}
				<button
					onClick={handleGoogleSignup}
					disabled={isLoading}
					className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
				>
					<FcGoogle className="h-5 w-5 mr-2" />
					Sign up with Google
				</button>

				{/* Login Link */}
				<div className="text-center text-sm">
					<p className="text-gray-600">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-medium text-purple-600 hover:text-purple-500"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default SignupForm;
