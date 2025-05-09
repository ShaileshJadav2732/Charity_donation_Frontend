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

export default function SelectRolePage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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

	// Check for pending Google user in sessionStorage on component mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedUser = sessionStorage.getItem("pendingGoogleUser");
			if (storedUser) {
				try {
					const parsedUser = JSON.parse(storedUser);
					setPendingUser(parsedUser);
					console.log("Found pending Google user:", parsedUser);
				} catch (e) {
					console.error("Error parsing pending user:", e);
				}
			}
		}
	}, []);

	const handleRoleSelect = async () => {
		setIsLoading(true);

		try {
			// First check if we have a pending Google user from sessionStorage
			let userInfo: FirebaseUserInfo | null = null;

			if (pendingUser) {
				userInfo = pendingUser;
				console.log("Using pending Google user:", userInfo);
			} else {
				// Otherwise get current Firebase user
				const firebaseUser = auth.currentUser;

				if (!firebaseUser) {
					toast.error("No user is signed in");
					router.push("/login");
					return;
				}

				if (!firebaseUser.email) {
					toast.error("User must have an email address");
					return;
				}

				userInfo = {
					uid: firebaseUser.uid,
					email: firebaseUser.email,
				};
			}

			console.log("Registering user with role:", role);
			console.log("Firebase user:", userInfo.uid, userInfo.email);

			// Register user in backend with selected role
			try {
				const response = await register({
					email: userInfo.email,
					firebaseUid: userInfo.uid,
					role,
				}).unwrap();

				console.log("Backend registration successful:", response);

				// Set credentials in Redux store
				dispatch(
					setCredentials({
						user: response.user,
						token: response.token,
					})
				);

				// Clear the pending user from sessionStorage if it exists
				if (typeof window !== "undefined" && pendingUser) {
					sessionStorage.removeItem("pendingGoogleUser");
				}

				toast.success("Account created successfully!");

				// Redirect to complete profile
				router.push("/complete-profile");
			} catch (error: unknown) {
				console.error("Backend registration error:", error);

				const backendError = error as ApiError;
				if (
					backendError.status === 400 &&
					backendError.data?.message?.includes("already exists")
				) {
					toast.error("An account with this email already exists");
				} else {
					toast.error(backendError.data?.message || "Failed to create account");
				}
			}
		} catch (error: unknown) {
			console.error("Role selection error:", error);
			const parsedError = parseError(error);
			toast.error(parsedError.message || "Failed to create account");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
			<div className="text-center">
				<h1 className="text-2xl font-bold">Select Your Role</h1>
				<p className="mt-2 text-gray-600">
					Choose how you want to use our platform
				</p>
			</div>

			<div className="mt-8 space-y-6">
				<div className="space-y-4">
					<div className="flex items-center">
						<input
							id="donor"
							name="role"
							type="radio"
							checked={role === "donor"}
							onChange={() => setRole("donor")}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
						/>
						<label
							htmlFor="donor"
							className="ml-3 block text-sm font-medium text-gray-700"
						>
							I want to donate (Donor)
						</label>
					</div>

					<div className="flex items-center">
						<input
							id="organization"
							name="role"
							type="radio"
							checked={role === "organization"}
							onChange={() => setRole("organization")}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
						/>
						<label
							htmlFor="organization"
							className="ml-3 block text-sm font-medium text-gray-700"
						>
							I represent an organization (Organization)
						</label>
					</div>
				</div>

				<div>
					<button
						type="button"
						onClick={handleRoleSelect}
						disabled={isLoading}
						className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
					>
						{isLoading ? "Processing..." : "Continue"}
					</button>
				</div>
			</div>
		</div>
	);
}
