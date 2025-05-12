"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { FiHeart, FiUser, FiGlobe, FiArrowRight } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
	const router = useRouter();
	const { isAuthenticated, user } = useSelector(
		(state: RootState) => state.auth
	);
	const { authInitialized } = useAuth();

	useEffect(() => {
		if (!authInitialized) {
			console.log("HomePage: Waiting for auth initialization");
			return;
		}

		console.log("HomePage: Checking authentication state", {
			isAuthenticated,
			user,
		});
		if (isAuthenticated) {
			if (user?.profileCompleted) {
				console.log(
					"HomePage: User profile completed, redirecting to /dashboard"
				);
				router.push("/dashboard");
			} else {
				console.log(
					"HomePage: User profile not completed, redirecting to /complete-profile"
				);
				router.push("/complete-profile");
			}
		} else {
			console.log("HomePage: User not authenticated, staying on homepage");
		}
	}, [isAuthenticated, user, router, authInitialized]);

	if (!authInitialized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-teal-600">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="relative bg-gradient-to-br from-teal-600 to-teal-800 py-24 overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<div className="flex justify-center mb-6">
						<FiHeart className="h-16 w-16 text-white" aria-hidden="true" />
					</div>
					<h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
						Make a Difference with GreenGive
					</h1>
					<p className="mt-6 max-w-2xl mx-auto text-xl text-teal-100">
						Connect with charitable organizations and support causes that matter
						to you.
					</p>
					<div className="mt-10 flex justify-center space-x-4">
						<Link
							href="/signup"
							className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-900 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 md:py-4 md:text-lg md:px-10"
							aria-label="Get started with GreenGive"
						>
							Get Started
						</Link>
						<Link
							href="/login"
							className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-900 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 md:py-4 md:text-lg md:px-10"
							aria-label="Log in to GreenGive"
						>
							Log In
						</Link>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="text-3xl font-extrabold text-gray-900">
							How It Works
						</h2>
						<p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
							GreenGive makes charitable giving simple, transparent, and
							impactful.
						</p>
					</div>

					<div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
						{/* Feature 1 */}
						<div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
							<div className="flex justify-center mb-4">
								<FiUser
									className="h-12 w-12 text-teal-600"
									aria-hidden="true"
								/>
							</div>
							<div className="text-center">
								<h3 className="text-xl font-medium text-gray-900">
									Create an Account
								</h3>
								<p className="mt-4 text-gray-500">
									Sign up as a donor or organization to start your journey.
								</p>
							</div>
						</div>

						{/* Feature 2 */}
						<div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
							<div className="flex justify-center mb-4">
								<FiGlobe
									className="h-12 w-12 text-teal-600"
									aria-hidden="true"
								/>
							</div>
							<div className="text-center">
								<h3 className="text-xl font-medium text-gray-900">
									Complete Your Profile
								</h3>
								<p className="mt-4 text-gray-500">
									Share your story or your organization’s mission.
								</p>
							</div>
						</div>

						{/* Feature 3 */}
						<div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
							<div className="flex justify-center mb-4">
								<FiHeart
									className="h-12 w-12 text-teal-600"
									aria-hidden="true"
								/>
							</div>
							<div className="text-center">
								<h3 className="text-xl font-medium text-gray-900">
									Start Donating
								</h3>
								<p className="mt-4 text-gray-500">
									Discover causes you care about and make an impact.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-teal-700 py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-extrabold text-white">
						Ready to Make a Difference?
					</h2>
					<p className="mt-4 text-xl text-teal-100">
						Join GreenGive today and start supporting causes that inspire you.
					</p>
					<div className="mt-8">
						<Link
							href="/signup"
							className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-900 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 md:py-4 md:text-lg md:px-10"
							aria-label="Sign up for GreenGive"
						>
							Sign Up Now
							<FiArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
						</Link>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-gray-900 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center text-gray-300">
						<p>© {new Date().getFullYear()} GreenGive. All rights reserved.</p>
						<div className="mt-4 flex justify-center space-x-6">
							<Link href="/about" className="text-gray-400 hover:text-teal-400">
								About
							</Link>
							<Link
								href="/contact"
								className="text-gray-400 hover:text-teal-400"
							>
								Contact
							</Link>
							<Link
								href="/privacy"
								className="text-gray-400 hover:text-teal-400"
							>
								Privacy Policy
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
