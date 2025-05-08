"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../../hooks/reduxHooks";
import {
	useGetDonorProfileQuery,
	useCompleteDonorProfileMutation,
} from "../../../store/services/donorApi";
import { toast } from "react-toastify";
import { ProfileImage } from "../../../utils/imageUtils";
import { FiUpload } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaHandHoldingHeart, FaHandsHelping, FaHeart } from "react-icons/fa";
import ProfileRouteGuard from "../../../components/guards/ProfileRouteGuard";
import { getToken } from "@/utils/auth";
export default function DonorCompleteProfilePage() {
	return (
		<ProfileRouteGuard requireComplete={false}>
			<DonorComplete />
		</ProfileRouteGuard>
	);
}

// Pre-generate random positions to avoid hydration mismatches
const iconPositions = Array(15)
	.fill(0)
	.map(() => ({
		x: Math.floor(Math.random() * 100 - 50),
		y: Math.floor(Math.random() * 100),
		scale: Math.floor(Math.random() * 50 + 50) / 100,
		duration: Math.floor(Math.random() * 20 + 15),
		delay: Math.floor(Math.random() * 5),
		isEven: Math.random() > 0.5,
	}));

export function DonorComplete() {
	const router = useRouter();
	const { user } = useAppSelector((state) => state.auth);
	const [isClient, setIsClient] = useState(false);

	// Add token state
	useEffect(() => {
		setIsClient(true);
	}, []);

	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;
	// Skip query if user is not authenticated
	const {
		data: profileData,

		error: profileError,
	} = useGetDonorProfileQuery(undefined, {
		skip: !user,
		refetchOnMountOrArgChange: true,
		// Only add headers if token exists
		...(token
			? {
					headers: {
						Authorization: `Bearer ${token}`,
					},
			  }
			: {}),
	});

	const [
		completeDonorProfile,
		{ isLoading: isSubmitting, error: submitError },
	] = useCompleteDonorProfileMutation();

	// Form state
	const [formData, setFormData] = useState({
		fullAddress: "",
		phone: "",
		profilePhoto: "",
		donationPreferences: [] as string[],
		availability: "",
	});

	// Initialize the form with user data if available
	useEffect(() => {
		if (user?.photoURL) {
			setFormData((prev) => ({
				...prev,
				profilePhoto: user.photoURL || "",
			}));
		}
	}, [user]);

	// If profile data is loaded and profile is complete, redirect to dashboard
	useEffect(() => {
		if (profileData?.donor?.isProfileCompleted) {
			toast.info("Your profile is already complete");
			router.push("/donor/dashboard");
		} else if (profileData?.donor) {
			// Pre-fill the form with existing data
			setFormData({
				fullAddress: profileData.donor.fullAddress || "",
				phone: profileData.donor.phone || "",
				profilePhoto: profileData.donor.profilePhoto || user?.photoURL || "",
				donationPreferences: profileData.donor.donationPreferences || [],
				availability: profileData.donor.availability || "",
			});
		}
	}, [profileData, router, user]);

	// Handle errors with safer error checking
	useEffect(() => {
		// Only run error handling on the client side
		if (typeof window === "undefined") return;

		if (profileError) {
			// Safely check for status property
			const hasStatus =
				profileError &&
				typeof profileError === "object" &&
				"status" in profileError;

			// Only log and show error if it's not a 404 (which is expected for new profiles)
			if (!hasStatus || (hasStatus && profileError.status !== 404)) {
				// Safely log error
				try {
					console.error(
						"Profile error:",
						typeof profileError === "object"
							? JSON.stringify(profileError)
							: profileError
					);
				} catch (e) {
					console.error("Error logging profile error");
				}

				toast.error("Failed to load profile data");
			}
		}

		if (submitError) {
			// Safely log error
			try {
				console.error(
					"Submit error:",
					typeof submitError === "object"
						? JSON.stringify(submitError)
						: submitError
				);
			} catch (e) {
				console.error("Error logging submit error");
			}

			// Extract error message if possible
			let errorMessage = "Failed to complete profile";

			if (submitError && typeof submitError === "object") {
				if (
					"data" in submitError &&
					submitError.data &&
					typeof submitError.data === "object" &&
					"message" in submitError.data
				) {
					errorMessage = String(submitError.data.message);
				}
			}

			toast.error(errorMessage);
		}
	}, [profileError, submitError]);

	const donationPreferenceOptions = [
		"Food",
		"Clothes",
		"Books",
		"Toys",
		"Electronics",
		"Furniture",
		"Money",
		"Medical Supplies",
		"Other",
	];

	const availabilityOptions = [
		"Weekday mornings",
		"Weekday afternoons",
		"Weekday evenings",
		"Weekend mornings",
		"Weekend afternoons",
		"Weekend evenings",
		"Anytime",
	];

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value, checked } = e.target;

		if (checked) {
			setFormData({
				...formData,
				donationPreferences: [...formData.donationPreferences, value],
			});
		} else {
			setFormData({
				...formData,
				donationPreferences: formData.donationPreferences.filter(
					(pref) => pref !== value
				),
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Submitting form data:", formData);

		// Validate form
		if (!formData.fullAddress) {
			toast.error("Please enter your full address");
			return;
		}

		if (!formData.phone) {
			toast.error("Please enter your phone number");
			return;
		}

		if (formData.donationPreferences.length === 0) {
			toast.error("Please select at least one donation preference");
			return;
		}

		if (!formData.availability) {
			toast.error("Please select your availability");
			return;
		}

		// Check if profile photo is too large or empty
		if (formData.profilePhoto) {
			if (formData.profilePhoto.length > 1000000) {
				toast.error("Profile photo is too large. Please use a smaller image.");
				return;
			}
		} else {
			// If no profile photo, use a default or placeholder
			setFormData((prev) => ({
				...prev,
				profilePhoto: user?.photoURL || "", // Use user photo or empty string
			}));
		}

		// Submit the form using RTK Query mutation
		try {
			console.log("Sending profile data to API:", JSON.stringify(formData));

			// Check if user is authenticated
			const token = getToken();
			if (!token) {
				toast.error("Your session has expired. Please log in again.");
				router.push("/auth/login");
				return;
			}

			const result = await completeDonorProfile(formData).unwrap();
			console.log("Profile completion result:", result);
			toast.success("Profile completed successfully!");
			router.push("/donor/dashboard");
		} catch (error) {
			console.error(
				"Error submitting profile:",
				JSON.stringify(error, null, 2)
			);

			// Check for network errors
			if (error instanceof Error) {
				toast.error(`Network error: ${error.message}`);
				return;
			}

			// Check for API errors
			toast.error("Failed to complete profile. Please try again.");
		}
	};

	return (
		<div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100">
			{/* Only render animations on the client side */}
			{isClient && (
				<>
					{/* Animated charity icons */}
					<motion.div
						className="absolute inset-0 overflow-hidden -z-10"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1 }}
					>
						{iconPositions.map((pos, i) => (
							<motion.div
								key={i}
								className="absolute text-orange-300/20"
								initial={{
									x: `${pos.x}%`,
									y: `${pos.y}%`,
									scale: pos.scale,
								}}
								animate={{
									y: [`${pos.y}%`, `${(pos.y + 20) % 100}%`],
									rotate: [0, 360],
								}}
								transition={{
									repeat: Infinity,
									duration: pos.duration,
									delay: pos.delay,
									ease: "linear",
								}}
							>
								{i % 3 === 0 ? (
									<FaHandHoldingHeart size={pos.isEven ? 48 : 32} />
								) : i % 3 === 1 ? (
									<FaHandsHelping size={pos.isEven ? 48 : 32} />
								) : (
									<FaHeart size={pos.isEven ? 48 : 32} />
								)}
							</motion.div>
						))}
					</motion.div>

					{/* Orange accent shapes */}
					<motion.div
						className="absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl -z-10"
						animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
						transition={{ duration: 8, repeat: Infinity }}
					/>
					<motion.div
						className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500 rounded-full -ml-40 -mb-40 opacity-20 blur-3xl -z-10"
						animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.25, 0.2] }}
						transition={{ duration: 10, repeat: Infinity, delay: 2 }}
					/>
				</>
			)}

			<div className="max-w-lg mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-orange-100 relative">
				<div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 relative z-10">
					<h1 className="text-xl font-semibold text-white">
						Complete Your Donor Profile
					</h1>
					<p className="text-orange-100 text-sm mt-1">
						Your generosity brings warmth and hope to those in need
					</p>
				</div>

				<form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
					{/* Profile Photo Section */}
					<div className="flex flex-col items-center">
						<div className="mb-4 relative">
							<div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-indigo-100 relative">
								<ProfileImage
									src={formData.profilePhoto}
									alt="Profile"
									className="h-full w-full object-cover"
									width={96}
									height={96}
								/>

								{/* Upload Icon Button using React Icon */}
								<label
									htmlFor="upload-photo"
									className="absolute bottom-0 right-0 bg-indigo-600 p-1 rounded-full cursor-pointer hover:bg-indigo-700 transition"
									title="Upload from PC"
								>
									<FiUpload className="w-5 h-5 text-white" />
									<input
										id="upload-photo"
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												const reader = new FileReader();
												reader.onloadend = () => {
													setFormData((prev) => ({
														...prev,
														profilePhoto: reader.result as string,
													}));
												};
												reader.readAsDataURL(file);
											}
										}}
									/>
								</label>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						{/* Full Address */}
						<div>
							<label
								htmlFor="fullAddress"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Full Address <span className="text-red-500">*</span>
							</label>
							<textarea
								id="fullAddress"
								name="fullAddress"
								rows={3}
								className="w-full px-4 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="Enter your complete address"
								value={formData.fullAddress}
								onChange={handleInputChange}
								required
							/>
						</div>

						{/* Phone */}
						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Phone Number <span className="text-red-500">*</span>
							</label>
							<input
								type="tel"
								id="phone"
								name="phone"
								className="w-full px-4 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="Your contact number"
								value={formData.phone}
								onChange={handleInputChange}
								required
							/>
						</div>

						{/* Availability */}
						<div>
							<label
								htmlFor="availability"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Availability <span className="text-red-500">*</span>
							</label>
							<select
								id="availability"
								name="availability"
								className="w-full px-4 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								value={formData.availability}
								onChange={handleInputChange}
								required
							>
								<option value="">Select your availability</option>
								{availabilityOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>

						{/* Donation Preferences */}
						<div>
							<fieldset>
								<legend className="block text-sm font-medium text-gray-700 mb-2">
									Donation Preferences <span className="text-red-500">*</span>
								</legend>
								<div className="grid grid-cols-2 gap-x-4 gap-y-2">
									{donationPreferenceOptions.map((option) => (
										<div key={option} className="flex items-start">
											<div className="flex items-center h-5">
												<input
													id={`preference-${option}`}
													name="donationPreferences"
													type="checkbox"
													value={option}
													checked={formData.donationPreferences.includes(
														option
													)}
													onChange={handleCheckboxChange}
													className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
												/>
											</div>
											<div className="ml-3 text-sm">
												<label
													htmlFor={`preference-${option}`}
													className="font-medium text-gray-700"
												>
													{option}
												</label>
											</div>
										</div>
									))}
								</div>
								{formData.donationPreferences.length === 0 && (
									<p className="mt-1 text-sm text-red-500">
										Please select at least one preference
									</p>
								)}
							</fieldset>
						</div>
					</div>

					{/* Submit Button */}
					<div className="pt-4">
						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
						>
							{isSubmitting ? (
								<div className="flex items-center">
									<div className="mr-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
									Completing...
								</div>
							) : (
								"Complete Profile"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
