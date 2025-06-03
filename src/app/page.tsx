"use client";

import { useAuth } from "@/hooks/useAuth";
import { RootState } from "@/store/store";
import { ArrowRight, Globe, Heart, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function HomePage() {
	const router = useRouter();
	const { isAuthenticated, user } = useSelector(
		(state: RootState) => state.auth
	);
	const { authInitialized } = useAuth();

	useEffect(() => {
		if (isAuthenticated) {
			if (user?.profileCompleted) {
				router.push("/dashboard/home");
			} else {
				router.push("/complete-profile");
			}
		}
	}, [isAuthenticated, user, router]);

	if (!authInitialized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-teal-600">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
			{/* Hero Section */}
			<div className="relative bg-gradient-to-br from-[#2f8077] via-[#287068] to-[#2c7a72] py-32 overflow-hidden">
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-10">
					<div
						className="absolute top-0 left-0 w-full h-full"
						style={{
							backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
						}}
					></div>
				</div>

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						{/* Logo/Icon */}
						<div className="flex justify-center mb-8">
							<div className="relative">
								<div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
								<div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
									<Heart className="h-16 w-16 text-white" strokeWidth={1.5} />
								</div>
							</div>
						</div>

						{/* Main Heading */}
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
							Make a Difference with{" "}
							<span className="bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
								GreenGive
							</span>
						</h1>

						{/* Subtitle */}
						<p className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-teal-100 leading-relaxed">
							Connect with charitable organizations and support causes that
							matter to you. Every donation creates ripples of positive change
							in our world.
						</p>

						{/* CTA Buttons */}
						<div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
							<Link
								href="/signup"
								className="group relative px-8 py-4 bg-white text-[#287068] font-semibold rounded-xl hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
								aria-label="Get started with GreenGive"
							>
								<span className="relative z-10 flex items-center justify-center">
									Get Started
									<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
								</span>
							</Link>
							<Link
								href="/login"
								className="group px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 backdrop-blur-sm"
								aria-label="Log in to GreenGive"
							>
								Log In
							</Link>
						</div>
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
								<Users className="h-12 w-12 text-teal-600" strokeWidth={1.5} />
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
								<Globe className="h-12 w-12 text-teal-600" strokeWidth={1.5} />
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
								<Heart className="h-12 w-12 text-teal-600" aria-hidden="true" />
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
							<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
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
