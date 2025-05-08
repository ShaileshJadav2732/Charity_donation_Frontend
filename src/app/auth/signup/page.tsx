"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import {
	useSignupWithEmailMutation,
	useSignupWithGoogleMutation,
} from "../../../store/services/authApi";
import { UserRole } from "../../../types/auth.types";

import AuthPageGuard from "../../../components/guards/AuthPageGuard";

export default function SignupPageWrapper() {
	return (
		<AuthPageGuard>
			<SignupPage />
		</AuthPageGuard>
	);
}

export function SignupPage() {
	const router = useRouter();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [selectedRole, setSelectedRole] = useState<UserRole>("donor");

	const [signupWithEmail, { isLoading: isEmailLoading, error: emailError }] =
		useSignupWithEmailMutation();
	const [signupWithGoogle, { isLoading: isGoogleLoading, error: googleError }] =
		useSignupWithGoogleMutation();

	const isLoading = isEmailLoading || isGoogleLoading;

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedRole(e.target.value as UserRole);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			await signupWithEmail({
				email: formData.email,
				password: formData.password,
				role: selectedRole,
			});
			// Don't need toast.success here as it's handled in the hook
		} catch (error) {
			console.error("Signup error:", error);
		}
	};

	const handleGoogleSignup = async () => {
		try {
			await signupWithGoogle({ role: selectedRole }).unwrap();
			toast.success("Signed up with Google!");
			router.push("/dashboard");
		} catch (error) {
			// handled below
		}
	};

	const errorMessage =
		(emailError && "data" in emailError && (emailError.data as any)?.message) ||
		(googleError &&
			"data" in googleError &&
			(googleError.data as any)?.message) ||
		null;

	useEffect(() => {
		if (errorMessage) {
			toast.error(errorMessage);
		}
	}, [errorMessage]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
			<div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
				<div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-center">
					<h1 className="text-3xl font-bold text-white">Join Our Community</h1>
					<p className="text-blue-100 mt-2">
						Create your account and start making a difference
					</p>
				</div>
				<div className="p-8">
					<form onSubmit={handleSubmit}>
						<div className="mb-4 relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiMail className="h-5 w-5 text-gray-400" />
							</div>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								required
								placeholder="Email address"
								className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:text-gray-500 text-gray-600"
							/>
						</div>

						<div className="mb-4 relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiLock className="h-5 w-5 text-gray-400" />
							</div>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								required
								placeholder="Password"
								className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:text-gray-500 text-gray-600"
							/>
						</div>

						<div className="mb-4 relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FiLock className="h-5 w-5 text-gray-400" />
							</div>
							<input
								type="password"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								required
								placeholder="Confirm Password"
								className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:text-gray-500 text-gray-600"
							/>
						</div>

						<div className="mb-4">
							<label
								htmlFor="role"
								className="text-sm font-medium text-gray-700"
							>
								I want to register as a:
							</label>
							<select
								id="role"
								name="role"
								value={selectedRole}
								onChange={handleRoleChange}
								className="mt-1 w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
							>
								<option value="donor">Donor</option>
								<option value="organization">Organization</option>
							</select>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center"
						>
							{isLoading ? (
								<>
									<svg
										className="animate-spin h-5 w-5 mr-3"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
										/>
									</svg>
									Creating Account...
								</>
							) : (
								<>
									Create Account <FiArrowRight className="ml-2" />
								</>
							)}
						</button>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-200" />
						</div>
						<div className="relative flex justify-center">
							<span className="px-3 bg-white text-sm text-gray-500">OR</span>
						</div>
					</div>

					<button
						onClick={handleGoogleSignup}
						disabled={isLoading}
						className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 flex items-center justify-center text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition"
					>
						<FcGoogle className="h-5 w-5 mr-3" />
						Sign up with Google
					</button>

					<p className="mt-8 text-center text-sm text-gray-600">
						Already have an account?{" "}
						<Link
							href="/auth/login"
							className="text-indigo-600 font-medium hover:underline hover:text-indigo-700 transition"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
