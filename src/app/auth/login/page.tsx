"use client";

import { useState } from "react";
import Link from "next/link";
import {
	useRtkEmailLogin,
	useRtkGoogleLogin,
} from "../../../hooks/useAuthRedux";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const { error: authError, isLoading: authLoading } = useAppSelector(
		(state) => state.auth
	);
	const emailLoginMutation = useRtkEmailLogin();
	const googleLoginMutation = useRtkGoogleLogin();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await emailLoginMutation.mutate(formData);
		} catch (error) {
			console.error("Login error:", error);
		}
	};

	const handleGoogleLogin = async () => {
		await googleLoginMutation.mutate();
	};

	const isLoading =
		authLoading ||
		emailLoginMutation.isPending ||
		googleLoginMutation.isPending;

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-center">
						<h1 className="text-3xl font-bold text-white">Welcome Back</h1>
						<p className="text-blue-100 mt-2">
							Sign in to continue your journey
						</p>
					</div>

					{/* Form Container */}
					<div className="p-8">
						{/* Error Message */}
						{(authError ||
							emailLoginMutation.error ||
							googleLoginMutation.error) && (
							<div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r">
								<p className="font-medium">
									{authError ||
										(emailLoginMutation.error instanceof Error
											? emailLoginMutation.error.message
											: "") ||
										(googleLoginMutation.error instanceof Error
											? googleLoginMutation.error.message
											: "Login failed. Try again.")}
								</p>
							</div>
						)}

						<form className="space-y-5" onSubmit={handleSubmit}>
							{/* Email */}
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<FiMail className="h-5 w-5 text-gray-400" />
								</div>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									disabled={isLoading}
									required
									placeholder="Email address"
									className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:text-gray-500 text-gray-600"
								/>
							</div>

							{/* Password */}
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<FiLock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									type="password"
									id="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									disabled={isLoading}
									required
									placeholder="Password"
									className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:text-gray-500 text-gray-600"
								/>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								disabled={isLoading}
								className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center"
							>
								{isLoading ? (
									<span className="flex items-center">
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
										Signing in...
									</span>
								) : (
									<>
										Sign In <FiArrowRight className="ml-2" />
									</>
								)}
							</button>
						</form>

						{/* OR Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-200"></div>
							</div>
							<div className="relative flex justify-center">
								<span className="px-3 bg-white text-sm text-gray-500">OR</span>
							</div>
						</div>

						{/* Google Login Button */}
						<button
							onClick={handleGoogleLogin}
							disabled={isLoading}
							className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 flex items-center justify-center text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition"
						>
							<FcGoogle className="h-5 w-5 mr-3" />
							Sign in with Google
						</button>

						{/* Redirects */}
						<div className="mt-6 text-center text-sm text-gray-600">
							<Link
								href="/auth/forgot-password"
								className="hover:underline text-indigo-600"
							>
								Forgot your password?
							</Link>
						</div>
						<p className="mt-4 text-center text-sm text-gray-600">
							Don’t have an account?{" "}
							<Link
								href="/auth/signup"
								className="text-indigo-600 font-medium hover:underline hover:text-indigo-700 transition"
							>
								Sign up here
							</Link>
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-6 text-center text-xs text-gray-500">
					By signing in, you agree to our{" "}
					<a href="#" className="text-indigo-600 hover:underline">
						Terms
					</a>{" "}
					and{" "}
					<a href="#" className="text-indigo-600 hover:underline">
						Privacy Policy
					</a>
					.
				</div>
			</div>
		</div>
	);
}
