"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEmailSignup, useGoogleSignup } from "../../../hooks/useAuth";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { UserRole } from "../../../types/auth.types";

export default function SignupPage() {
	const searchParams = useSearchParams();
	const provider = searchParams.get("provider");
	const [selectedRole, setSelectedRole] = useState<UserRole>("donor");

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		username: "",
	});

	const { error: authError, isLoading: authLoading } = useAppSelector(
		(state) => state.auth
	);
	const emailSignupMutation = useEmailSignup();
	const googleSignupMutation = useGoogleSignup();

	// Handle Google auth redirect
	useEffect(() => {
		if (provider === "google") {
			document.getElementById("role-selection")?.scrollIntoView({
				behavior: "smooth",
			});
		}
	}, [provider]);

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
			alert("Passwords don't match");
			return;
		}

		emailSignupMutation.mutate({
			email: formData.email,
			password: formData.password,
			username: formData.username,
			role: selectedRole,
		});
	};

	const handleGoogleSignup = async () => {
		googleSignupMutation.mutate(selectedRole);
	};

	const isLoading =
		authLoading ||
		emailSignupMutation.isPending ||
		googleSignupMutation.isPending;

	// If redirected from Google login for a new user
	if (provider === "google") {
		return (
			<div
				id="role-selection"
				className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
			>
				<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
					<div>
						<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
							Complete Your Registration
						</h2>
						<p className="mt-2 text-center text-sm text-gray-600">
							Choose your role to complete signing up with Google
						</p>
					</div>

					{(authError || googleSignupMutation.error) && (
						<div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-red-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm text-red-700">
										{authError ||
											(googleSignupMutation.error instanceof Error
												? googleSignupMutation.error.message
												: "")}
									</p>
								</div>
							</div>
						</div>
					)}

					<div className="mt-8 space-y-6">
						<div>
							<label
								htmlFor="role"
								className="block text-sm font-medium text-gray-700"
							>
								I am registering as
							</label>
							<select
								id="role"
								name="role"
								value={selectedRole}
								onChange={handleRoleChange}
								disabled={isLoading}
								className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
							>
								<option value="donor">Donor</option>
								<option value="organization">Organization</option>
							</select>
						</div>

						<div>
							<button
								type="button"
								onClick={handleGoogleSignup}
								disabled={isLoading}
								className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
							>
								{isLoading ? "Creating account..." : "Complete Registration"}
							</button>
						</div>
					</div>

					<div className="text-center mt-6">
						<p className="text-sm text-gray-600">
							Already have an account?{" "}
							<Link
								href="/auth/login"
								className="font-medium text-indigo-600 hover:text-indigo-500"
							>
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Regular signup form
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Create an account
					</h2>
				</div>

				{(authError || emailSignupMutation.error) && (
					<div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-500"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-red-700">
									{authError ||
										(emailSignupMutation.error instanceof Error
											? emailSignupMutation.error.message
											: "")}
								</p>
							</div>
						</div>
					</div>
				)}

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email" className="sr-only">
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Email address"
								value={formData.email}
								onChange={handleChange}
								disabled={isLoading}
							/>
						</div>
						<div>
							<label htmlFor="username" className="sr-only">
								Username
							</label>
							<input
								id="username"
								name="username"
								type="text"
								autoComplete="username"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Username"
								value={formData.username}
								onChange={handleChange}
								disabled={isLoading}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
								disabled={isLoading}
								minLength={6}
							/>
						</div>
						<div>
							<label htmlFor="confirmPassword" className="sr-only">
								Confirm Password
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Confirm Password"
								value={formData.confirmPassword}
								onChange={handleChange}
								disabled={isLoading}
								minLength={6}
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="role"
							className="block text-sm font-medium text-gray-700"
						>
							I am registering as
						</label>
						<select
							id="role"
							name="role"
							value={selectedRole}
							onChange={handleRoleChange}
							disabled={isLoading}
							className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
						>
							<option value="donor">Donor</option>
							<option value="organization">Organization</option>
						</select>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
						>
							{isLoading ? "Creating account..." : "Sign up"}
						</button>
					</div>
				</form>

				<div className="mt-6">
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

					<div className="mt-6">
						<Link
							href="/auth/login"
							className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Sign up with Google
						</Link>
					</div>
				</div>

				<div className="text-center mt-6">
					<p className="text-sm text-gray-600">
						Already have an account?{" "}
						<Link
							href="/auth/login"
							className="font-medium text-indigo-600 hover:text-indigo-500"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
