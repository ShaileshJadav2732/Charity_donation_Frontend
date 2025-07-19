"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { User, Phone, MapPin, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useCompleteDonorProfileMutation } from "@/store/api/profileApi";
import { parseError } from "@/types";
import ProfileImageUpload from "./ProfileImageUpload";

export default function DonorProfileForm() {
	const router = useRouter();
	const [completeDonorProfile, { isLoading }] =
		useCompleteDonorProfileMutation();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		phoneNumber: "",
		address: "",
		city: "",
		state: "",
		country: "",
		profileImage: "",
		bio: "",
	});
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.firstName.trim()) {
			newErrors.firstName = "First name is required";
		}

		if (!formData.lastName.trim()) {
			newErrors.lastName = "Last name is required";
		}

		if (formData.phoneNumber && formData.phoneNumber.trim()) {
			// More flexible phone number validation
			const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
			const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)]/g, "");
			if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
				newErrors.phoneNumber =
					"Please enter a valid phone number (10-15 digits)";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error("Please fix the errors in the form.");
			return;
		}

		try {
			await completeDonorProfile(formData).unwrap();

			toast.success("Profile completed successfully!");
			router.push("/dashboard/home");
		} catch (error) {
			const parsedError = parseError(error);
			toast.error(parsedError.message || "Failed to complete profile.");
		}
	};

	return (
		<motion.form
			onSubmit={handleSubmit}
			className="space-y-6"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			{/* First Name */}
			<div>
				<label
					htmlFor="firstName"
					className="block text-sm font-medium text-gray-700"
				>
					First Name <span className="text-red-500">*</span>
				</label>
				<div className="mt-1 relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<User className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						id="firstName"
						name="firstName"
						type="text"
						value={formData.firstName}
						onChange={handleChange}
						required
						className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg border ${
							errors.firstName ? "border-red-300" : "border-gray-200"
						} focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
						placeholder="John"
						autoComplete="given-name"
					/>
				</div>
				{errors.firstName && (
					<p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
				)}
			</div>

			{/* Last Name */}
			<div>
				<label
					htmlFor="lastName"
					className="block text-sm font-medium text-gray-700"
				>
					Last Name <span className="text-red-500">*</span>
				</label>
				<div className="mt-1 relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<User className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						id="lastName"
						name="lastName"
						type="text"
						value={formData.lastName}
						onChange={handleChange}
						required
						className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg border ${
							errors.lastName ? "border-red-300" : "border-gray-200"
						} focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
						placeholder="Doe"
						autoComplete="family-name"
					/>
				</div>
				{errors.lastName && (
					<p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
				)}
			</div>

			{/* Phone */}
			<div>
				<label
					htmlFor="phoneNumber"
					className="block text-sm font-medium text-gray-700"
				>
					Phone Number
				</label>
				<div className="mt-1 relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						id="phoneNumber"
						name="phoneNumber"
						type="tel"
						value={formData.phoneNumber}
						onChange={handleChange}
						className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg border ${
							errors.phoneNumber ? "border-red-300" : "border-gray-200"
						} focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
						placeholder="+1 (123) 456-7890"
						autoComplete="tel"
					/>
				</div>
				{errors.phoneNumber && (
					<p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
				)}
			</div>

			{/* Address */}
			<div>
				<label
					htmlFor="address"
					className="block text-sm font-medium text-gray-700"
				>
					Address
				</label>
				<div className="mt-1 relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						id="address"
						name="address"
						type="text"
						value={formData.address}
						onChange={handleChange}
						className="appearance-none block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50"
						placeholder="123 Main St"
						autoComplete="street-address"
					/>
				</div>
			</div>

			{/* City, State, Country */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label
						htmlFor="city"
						className="block text-sm font-medium text-gray-700"
					>
						City
					</label>
					<input
						id="city"
						name="city"
						type="text"
						value={formData.city}
						onChange={handleChange}
						className="mt-1 appearance-none block w-full px-3 py-3 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50"
						placeholder="New York"
						autoComplete="address-level2"
					/>
				</div>
				<div>
					<label
						htmlFor="state"
						className="block text-sm font-medium text-gray-700"
					>
						State
					</label>
					<input
						id="state"
						name="state"
						type="text"
						value={formData.state}
						onChange={handleChange}
						className="mt-1 appearance-none block w-full px-3 py-3 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50"
						placeholder="NY"
						autoComplete="address-level1"
					/>
				</div>
				<div>
					<label
						htmlFor="country"
						className="block text-sm font-medium text-gray-700"
					>
						Country
					</label>
					<input
						id="country"
						name="country"
						type="text"
						value={formData.country}
						onChange={handleChange}
						className="mt-1 appearance-none block w-full px-3 py-3 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50"
						placeholder="USA"
						autoComplete="country-name"
					/>
				</div>
			</div>

			{/* Bio */}
			<div>
				<label
					htmlFor="bio"
					className="block text-sm font-medium text-gray-700"
				>
					Bio
				</label>
				<div className="mt-1 relative">
					<div className="absolute top-3 left-3 pointer-events-none">
						<Info className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<textarea
						id="bio"
						name="bio"
						rows={4}
						value={formData.bio}
						onChange={handleChange}
						className="appearance-none block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50"
						placeholder="Tell us about yourself and why you're passionate about giving..."
					/>
				</div>
			</div>

			{/* Submit Button */}
			<motion.button
				type="submit"
				disabled={isLoading}
				className="w-full flex justify-center items-center px-4 py-3 text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-teal-400 disabled:cursor-not-allowed"
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
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
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Saving...
					</>
				) : (
					"Complete Donor Profile"
				)}
			</motion.button>
		</motion.form>
	);
}
