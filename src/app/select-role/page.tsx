"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { auth } from "@/lib/firebase";
import { useRegisterMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import NoSSR from "@/components/common/NoSSR";
import { FirebaseUserInfo, ApiError, parseError } from "@/types";
import { FiUser, FiBriefcase } from "react-icons/fi";

export default function SelectRolePage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
			<NoSSR>
				<SelectRoleContent />
			</NoSSR>
		</div>
	);
}

function SelectRoleContent() {
	const router = useRouter();
	const dispatch = useDispatch();
	const [role, setRole] = useState<"donor" | "organization">("donor");
	const [isLoading, setIsLoading] = useState(false);
	const [register] = useRegisterMutation();
	const [pendingUser, setPendingUser] = useState<FirebaseUserInfo | null>(null);

	// Check for pending Google user in sessionStorage
	useEffect(() => {
		if (typeof window === "undefined") return;

		console.log("Checking for pending Google user");
		const storedUser = sessionStorage.getItem("pendingGoogleUser");
		if (storedUser) {
			try {
				const parsedUser = JSON.parse(storedUser);
				setPendingUser(parsedUser);
				console.log("Found pending Google user:", parsedUser);
			} catch (e) {
				console.error("Error parsing pending user:", e);
				toast.error("Invalid user data. Please log in again.");
				router.push("/login");
			}
		} else {
			console.log("No pending Google user found");
		}
	}, [router]);

	const handleRoleSelect = async () => {
		setIsLoading(true);
		console.log("Starting role selection process");

		try {
			let userInfo: FirebaseUserInfo | null = null;

			if (pendingUser) {
				userInfo = pendingUser;
				console.log("Using pending Google user:", userInfo);
			} else {
				const firebaseUser = auth.currentUser;

				if (!firebaseUser) {
					console.error("No Firebase user signed in");
					toast.error("No user is signed in");
					router.push("/login");
					return;
				}

				if (!firebaseUser.email) {
					console.error("Firebase user has no email");
					toast.error("User must have an email address");
					return;
				}

				userInfo = {
					uid: firebaseUser.uid,
					email: firebaseUser.email,
				};
			}

			console.log(
				"Registering user with role:",
				role,
				"Email:",
				userInfo.email
			);

			const response = await register({
				email: userInfo.email,
				firebaseUid: userInfo.uid,
				role,
			}).unwrap();

			console.log("Backend registration successful:", response);

			dispatch(
				setCredentials({
					user: response.user,
					token: response.token,
				})
			);

			if (typeof window !== "undefined" && pendingUser) {
				sessionStorage.removeItem("pendingGoogleUser");
				console.log("Cleared pendingGoogleUser from sessionStorage");
			}

			toast.success("Account created successfully!");
			console.log("Redirecting to /complete-profile");
			router.push("/complete-profile");
		} catch (error: unknown) {
			console.error("Role selection error:", error);
			const backendError = error as ApiError;
			let errorMessage = "Failed to create account";

			if (
				backendError.status === 400 &&
				backendError.data?.message?.includes("already exists")
			) {
				errorMessage = "An account with this email already exists";
			} else if (backendError.data?.message) {
				errorMessage = backendError.data.message;
			} else {
				errorMessage = parseError(error).message || errorMessage;
			}

			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md">
			<div className="bg-white shadow-lg rounded-2xl overflow-hidden">
				<div className="px-6 py-8 text-center">
					<div className="flex justify-center mb-4">
						<FiUser className="h-12 w-12 text-teal-600" aria-hidden="true" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900">Select Your Role</h1>
					<p className="mt-2 text-sm text-gray-600">
						Choose how you want to participate in GreenGive
					</p>
				</div>

				<div className="px-6 pb-6 space-y-6">
					<div className="space-y-4">
						<div className="flex items-center">
							<input
								id="donor"
								name="role"
								type="radio"
								checked={role === "donor"}
								onChange={() => setRole("donor")}
								className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
								aria-label="Select Donor role"
							/>
							<label
								htmlFor="donor"
								className="ml-3 block text-sm font-medium text-gray-700"
							>
								<div className="flex items-center">
									<FiUser
										className="h-5 w-5 text-teal-600 mr-2"
										aria-hidden="true"
									/>
									Individual Donor
								</div>
							</label>
						</div>

						<div className="flex items-center">
							<input
								id="organization"
								name="role"
								type="radio"
								checked={role === "organization"}
								onChange={() => setRole("organization")}
								className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
								aria-label="Select Organization role"
							/>
							<label
								htmlFor="organization"
								className="ml-3 block text-sm font-medium text-gray-700"
							>
								<div className="flex items-center">
									<FiBriefcase
										className="h-5 w-5 text-teal-600 mr-2"
										aria-hidden="true"
									/>
									Organization
								</div>
							</label>
						</div>
					</div>

					<button
						type="button"
						onClick={handleRoleSelect}
						disabled={isLoading}
						className="w-full flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-teal-400 disabled:cursor-not-allowed"
						aria-label="Continue with selected role"
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
								Processing...
							</>
						) : (
							"Continue"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
