"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/config/firebase"; // Ensure you've created this file
import axios from "axios";

const SignupPage = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		username: "",
		role: "donor",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// 1. Create user in Firebase
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				formData.email,
				formData.password
			);

			// 2. Update profile with role as displayName
			await updateProfile(userCredential.user, {
				displayName: formData.role,
			});

			// 3. Get ID token to pass to backend
			const idToken = await userCredential.user.getIdToken();

			// 4. Register with backend
			await axios.post(
				"http://localhost:8080/api/auth/firebase",
				{
					idToken: idToken, // Make sure to include idToken!
					username: formData.username,
					role: formData.role,
				},
				{
					headers: {
						Authorization: `Bearer ${idToken}`,
					},
				}
			);

			toast.success("Signup successful! Welcome to Charity Donation!");

			// Redirect to appropriate page based on role
			if (formData.role === "donor") {
				router.push("/donor/complete-profile");
			} else {
				router.push("/organization/complete-profile");
			}
		} catch (error: any) {
			console.error("Error during signup:", error);

			// Handle specific Firebase errors
			if (error.code === "auth/email-already-in-use") {
				toast.error("This email is already registered. Please login instead.");
			} else if (error.code === "auth/weak-password") {
				toast.error("Password should be at least 6 characters long.");
			} else if (error.code === "auth/invalid-email") {
				toast.error("Please provide a valid email address.");
			} else {
				toast.error(error.message || "Signup failed. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<section className="bg-gray-50 dark:bg-gray-900 rounded-lg">
				<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-6">
					<div className="bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
						<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
							<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
								Create an account
							</h1>
							<form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
								<div>
									<label
										htmlFor="email"
										className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>
										Email Address
									</label>
									<input
										name="email"
										value={formData.email}
										onChange={handleChange}
										type="email"
										id="email"
										className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
										placeholder="you@example.com"
										required
									/>
								</div>

								<div>
									<label
										htmlFor="username"
										className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>
										Username
									</label>
									<input
										name="username"
										value={formData.username}
										onChange={handleChange}
										type="text"
										id="username"
										className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
										placeholder="johndoe"
										required
									/>
								</div>

								<div>
									<label
										htmlFor="password"
										className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>
										Password
									</label>
									<input
										name="password"
										type="password"
										value={formData.password}
										onChange={handleChange}
										id="password"
										placeholder="••••••••"
										className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
										required
										minLength={6}
									/>
									<p className="mt-1 text-xs text-gray-500">
										Password must be at least 6 characters
									</p>
								</div>

								<div>
									<label
										htmlFor="role"
										className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>
										I am registering as
									</label>
									<select
										name="role"
										id="role"
										value={formData.role}
										onChange={handleChange}
										className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									>
										<option value="donor">Donor</option>
										<option value="organization">Organization</option>
									</select>
								</div>

								<button
									type="submit"
									disabled={loading}
									style={{ backgroundColor: "#379488" }}
									className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								>
									{loading ? "Creating account..." : "Create an account"}
								</button>

								<p className="text-sm font-light text-gray-500 dark:text-gray-400">
									Already have an account?{" "}
									<a
										href="/auth/login"
										style={{ color: "#379488" }}
										className="font-medium text-primary-600 hover:underline dark:text-primary-500"
									>
										Login here
									</a>
								</p>
							</form>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default SignupPage;
