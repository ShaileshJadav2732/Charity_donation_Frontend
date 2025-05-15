"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
	FiBriefcase,
	FiGlobe,
	FiPhone,
	FiMail,
	FiMapPin,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useCompleteOrganizationProfileMutation } from "@/store/api/profileApi";
import { parseError } from "@/types/errors";

interface OrganizationProfileFormData {
	name: string;
	description: string;
	phoneNumber: string;
	email: string;
	website: string;
	address: string;
	city: string;
	state: string;
	country: string;
	profileCompleted: boolean;
}
export default function OrganizationProfileForm() {
	const router = useRouter();
	const [completeOrgProfile, { isLoading }] =
		useCompleteOrganizationProfileMutation();

	const [formData, setFormData] = useState<OrganizationProfileFormData>({
		name: "",
		description: "",
		phoneNumber: "",
		email: "",
		website: "",
		address: "",
		city: "",
		state: "",
		country: "",
		profileCompleted: false,
	});
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};
		if (!formData.name.trim()) newErrors.name = "Organization name is required";
		if (!formData.description.trim())
			newErrors.description = "Description is required";
		if (!formData.email.trim()) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(formData.email))
			newErrors.email = "Invalid email";
		if (formData.phoneNumber && !/^\+?\d{10,15}$/.test(formData.phoneNumber))
			newErrors.phoneNumber = "Invalid phone number";
		if (formData.website && !/^https?:\/\/\S+$/.test(formData.website))
			newErrors.website = "Invalid URL";
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
		console.log("OrganizationProfileForm: Submitting form", formData);

		if (!validateForm()) {
			console.log("OrganizationProfileForm: Validation failed", errors);
			toast.error("Please fix the errors in the form.");
			return;
		}

		try {
			await completeOrgProfile({
				...formData,
				profileCompleted: true,
			});

			toast.success("Organization profile completed successfully!");
			router.push("/dashboard/home");
		} catch (error) {
			// Use the improved parseError
			const errorDetails = parseError(error);
			console.error("Organization profile error:", errorDetails);

			// Show the error message to the user
			toast.error(errorDetails.message || "Failed to complete profile");

			// If there are field-specific errors, update your form errors state
			if (errorDetails.fields) {
				setErrors(errorDetails.fields);
			}
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
			{/* Organization Name */}
			<div>
				<label
					htmlFor="name"
					className="block text-sm font-medium text-gray-700"
				>
					Organization Name <span className="text-red-500">*</span>
				</label>
				<div className="mt-1 relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<FiBriefcase className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						id="name"
						name="name"
						type="text"
						value={formData.name}
						onChange={handleChange}
						required
						className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg border ${
							errors.name ? "border-red-300" : "border-gray-200"
						} focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
						placeholder="Charity Organization"
						autoComplete="organization"
					/>
				</div>
				{errors.name && (
					<p className="mt-1 text-sm text-red-500">{errors.name}</p>
				)}
			</div>

			{/* Description */}
			<div>
				<label
					htmlFor="description"
					className="block text-sm font-medium text-gray-700"
				>
					Description <span className="text-red-500">*</span>
				</label>
				<div className="mt-1">
					<textarea
						id="description"
						name="description"
						rows={4}
						value={formData.description}
						onChange={handleChange}
						required
						className={`appearance-none block w-full px-3 py-3 rounded-lg border ${
							errors.description ? "border-red-300" : "border-gray-200"
						} focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
						placeholder="Describe your organization’s mission and goals..."
					/>
				</div>
				{errors.description && (
					<p className="mt-1 text-sm text-red-500">{errors.description}</p>
				)}
			</div>

			{/* Email */}
			<div>
				<label
					htmlFor="email"
					className="block text-sm font-medium text-gray-700"
				>
					Email <span className="text-red-500">*</span>
				</label>
				<div className="mt-1 relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<FiMail className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						id="email"
						name="email"
						type="email"
						value={formData.email}
						onChange={handleChange}
						required
						className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg border ${
							errors.email ? "border-red-300" : "border-gray-200"
						} focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
						placeholder="contact@organization.org"
						autoComplete="email"
					/>
				</div>
				{errors.email && (
					<p className="mt-1 text-sm text-red-500">{errors.email}</p>
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
						<FiPhone className="h-5 w-5 text-gray-400" aria-hidden="true" />
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

			{/* Website */}
			<div>
				<label
					htmlFor="website"
					className="block text-sm font-medium text-gray-700"
				>
					Website
				</label>
				<div className="mt-1 relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<FiGlobe className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						id="website"
						name="website"
						type="url"
						value={formData.website}
						onChange={handleChange}
						className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg border ${
							errors.website ? "border-red-300" : "border-gray-200"
						} focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
						placeholder="https://example.org"
						autoComplete="url"
					/>
				</div>
				{errors.website && (
					<p className="mt-1 text-sm text-red-500">{errors.website}</p>
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
						<FiMapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
					"Complete Organization Profile"
				)}
			</motion.button>
		</motion.form>
	);
}
