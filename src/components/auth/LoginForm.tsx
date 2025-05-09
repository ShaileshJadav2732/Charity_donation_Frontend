"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoginFormData, parseError } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

const LoginForm = () => {
	const router = useRouter();
	const { loginWithEmail, loginWithGoogle, isLoading } = useAuth();

	const [formData, setFormData] = useState<LoginFormData>({
		email: "",
		password: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			// Login user
			const response = await loginWithEmail(formData);

			toast.success("Logged in successfully!");

			// Redirect based on profile completion status
			if (response.user.profileCompleted) {
				router.push("/dashboard");
			} else {
				router.push("/complete-profile");
			}
		} catch (error: unknown) {
			const parsedError = parseError(error);
			toast.error(parsedError.message || "Failed to log in");
		}
	};

	const handleGoogleLogin = async () => {
		try {
			toast.loading("Signing in with Google...", { id: "google-login" });
			await loginWithGoogle();
			toast.dismiss("google-login");
			// No need for success toast or redirect here as they're handled in the loginWithGoogle function
		} catch (error: unknown) {
			toast.dismiss("google-login");
			const parsedError = parseError(error);
			toast.error(parsedError.message || "Failed to log in with Google");
			console.error("Google login error:", error);
		}
	};

	return (
		<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
			<div className="text-center">
				<h1 className="text-2xl font-bold">Welcome Back</h1>
				<p className="mt-2 text-gray-600">Log in to your account</p>
			</div>

			<form onSubmit={handleSubmit} className="mt-8 space-y-6">
				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700"
					>
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						value={formData.email}
						onChange={handleChange}
						className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter your email"
					/>
				</div>

				<div>
					<div className="flex items-center justify-between">
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<Link
							href="/forgot-password"
							className="text-sm font-medium text-blue-600 hover:text-blue-500"
						>
							Forgot password?
						</Link>
					</div>
					<input
						id="password"
						name="password"
						type="password"
						required
						value={formData.password}
						onChange={handleChange}
						className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter your password"
					/>
				</div>

				<div>
					<button
						type="submit"
						disabled={isLoading}
						className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
					>
						{isLoading ? "Logging in..." : "Log In"}
					</button>
				</div>
			</form>

			<div className="relative mt-6">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-gray-300"></div>
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="px-2 text-gray-500 bg-white">Or continue with</span>
				</div>
			</div>

			<div>
				<button
					type="button"
					onClick={handleGoogleLogin}
					disabled={isLoading}
					className="flex items-center justify-center w-full px-4 py-2 mt-4 space-x-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
				>
					<FcGoogle className="w-5 h-5" />
					<span>Log in with Google</span>
				</button>
			</div>

			<div className="text-center mt-4">
				<p className="text-sm text-gray-600">
					Don&apos;t have an account?{" "}
					<Link
						href="/signup"
						className="font-medium text-blue-600 hover:text-blue-500"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
};

export default LoginForm;
