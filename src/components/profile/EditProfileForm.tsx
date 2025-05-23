"use client";

import { useState, useEffect } from "react";
import {
	useUpdateDonorProfileMutation,
	useUpdateOrganizationProfileMutation,
} from "@/store/api/profileApi";
import { toast } from "react-hot-toast";
import { DonorProfile, OrganizationProfile } from "@/types";
import {
	FiX,
	FiUser,
	FiMapPin,
	FiPhone,
	FiGlobe,
	FiEdit2,
} from "react-icons/fi";
import ProfileImageUpload from "./ProfileImageUpload";

interface EditProfileFormProps {
	profile: DonorProfile | OrganizationProfile;
	isDonor: boolean;
	onClose: () => void;
}

export default function EditProfileForm({
	profile,
	isDonor,
	onClose,
}: EditProfileFormProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [formData, setFormData] = useState({
		firstName: isDonor ? (profile as DonorProfile).firstName : "",
		lastName: isDonor ? (profile as DonorProfile).lastName : "",
		name: !isDonor ? (profile as OrganizationProfile).name : "",
		phoneNumber: profile.phoneNumber || "",
		address: profile.address || "",
		city: profile.city || "",
		state: profile.state || "",
		country: profile.country || "",
		profileImage: isDonor ? (profile as DonorProfile).profileImage || "" : "",
		bio: isDonor ? (profile as DonorProfile).bio || "" : "",
		description: !isDonor
			? (profile as OrganizationProfile).description || ""
			: "",
	});

	const [updateDonorProfile] = useUpdateDonorProfileMutation();
	const [updateOrganizationProfile] = useUpdateOrganizationProfileMutation();

	useEffect(() => {
		// Prevent scrolling when modal is open
		document.body.style.overflow = "hidden";
		document.body.style.position = "fixed";
		document.body.style.width = "100%";
		document.body.style.top = `-${window.scrollY}px`;

		const timer = setTimeout(() => setIsVisible(true), 50);

		return () => {
			clearTimeout(timer);
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.width = "";
			document.body.style.top = "";
			window.scrollTo(0, parseInt(document.body.style.top || "0") * -1);
		};
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleImageUpdate = (imageUrl: string) => {
		setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (isDonor) {
				const result = await updateDonorProfile(formData).unwrap();
				if (result) {
					toast.success("Profile updated successfully");
					handleClose();
				}
			} else {
				const result = await updateOrganizationProfile(formData).unwrap();
				if (result) {
					toast.success("Profile updated successfully");
					handleClose();
				}
			}
		} catch (error: unknown) {
			console.error("Profile update error:", error);
			const errorMessage =
				error && typeof error === "object" && "data" in error
					? (error.data as { message?: string })?.message ||
					  "Failed to update profile"
					: "Failed to update profile";
			toast.error(errorMessage);
		}
	};

	const handleClose = () => {
		setIsVisible(false);
		document.body.style.overflow = "";
		document.body.style.position = "";
		document.body.style.width = "";
		document.body.style.top = "";
		window.scrollTo(0, parseInt(document.body.style.top || "0") * -1);
		setTimeout(onClose, 300);
	};

	return (
		<div
			className="fixed inset-0 z-50"
			style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
		>
			{/* Backdrop */}
			<div
				className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
					isVisible ? "opacity-100" : "opacity-0"
				}`}
				onClick={handleClose}
				style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
			/>

			{/* Modal */}
			<div
				className="fixed inset-0 flex items-center justify-center p-4"
				style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
			>
				<div
					className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all duration-300 ease-in-out w-full max-w-2xl ${
						isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					}`}
					style={{ maxHeight: "90vh" }}
				>
					<div
						className="bg-gradient-to-br from-blue-50 to-white px-6 py-8 overflow-y-auto"
						style={{ maxHeight: "90vh" }}
					>
						<div className="flex justify-between items-center mb-8">
							<div className="flex items-center space-x-3">
								<FiEdit2 className="w-6 h-6 text-blue-600" />
								<h2 className="text-2xl font-bold text-gray-900">
									Edit Profile
								</h2>
							</div>
							<button
								onClick={handleClose}
								className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
							>
								<FiX className="w-6 h-6" />
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-8">
							{/* Profile Image Upload - Only for donors */}
							{isDonor && (
								<div className="flex justify-center">
									<ProfileImageUpload
										currentImage={formData.profileImage}
										onImageUpdate={handleImageUpdate}
									/>
								</div>
							)}

							{isDonor ? (
								<>
									<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
										<div className="space-y-2">
											<label
												htmlFor="firstName"
												className="text-sm font-medium text-gray-700 flex items-center space-x-2"
											>
												<FiUser className="w-4 h-4" />
												<span>First Name</span>
											</label>
											<input
												type="text"
												name="firstName"
												id="firstName"
												value={formData.firstName}
												onChange={handleChange}
												className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
												required
											/>
										</div>
										<div className="space-y-2">
											<label
												htmlFor="lastName"
												className="text-sm font-medium text-gray-700 items-center space-x-2"
											>
												<FiUser className="w-4 h-4" />
												<span>Last Name</span>
											</label>
											<input
												type="text"
												name="lastName"
												id="lastName"
												value={formData.lastName}
												onChange={handleChange}
												className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
												required
											/>
										</div>
									</div>
									<div className="space-y-2">
										<label
											htmlFor="bio"
											className="text-sm font-medium text-gray-700 flex items-center space-x-2"
										>
											<FiEdit2 className="w-4 h-4" />
											<span>Bio</span>
										</label>
										<textarea
											name="bio"
											id="bio"
											rows={4}
											value={formData.bio}
											onChange={handleChange}
											className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
											placeholder="Tell us about yourself..."
										/>
									</div>
								</>
							) : (
								<>
									<div className="space-y-2">
										<label
											htmlFor="name"
											className="text-sm font-medium text-gray-700 flex items-center space-x-2"
										>
											<FiUser className="w-4 h-4" />
											<span>Organization Name</span>
										</label>
										<input
											type="text"
											name="name"
											id="name"
											value={formData.name}
											onChange={handleChange}
											className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
											required
										/>
									</div>
									<div className="space-y-2">
										<label
											htmlFor="description"
											className="text-sm font-medium text-gray-700 flex items-center space-x-2"
										>
											<FiEdit2 className="w-4 h-4" />
											<span>Description</span>
										</label>
										<textarea
											name="description"
											id="description"
											rows={4}
											value={formData.description}
											onChange={handleChange}
											className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
											placeholder="Tell us about your organization..."
											required
										/>
									</div>
								</>
							)}

							<div className="space-y-2">
								<label
									htmlFor="phoneNumber"
									className="text-sm font-medium text-gray-700 flex items-center space-x-2"
								>
									<FiPhone className="w-4 h-4" />
									<span>Phone Number</span>
								</label>
								<input
									type="tel"
									name="phoneNumber"
									id="phoneNumber"
									value={formData.phoneNumber}
									onChange={handleChange}
									className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
									required
								/>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="address"
									className=" text-sm font-medium text-gray-700 flex items-center space-x-2"
								>
									<FiMapPin className="w-4 h-4" />
									<span>Address</span>
								</label>
								<input
									type="text"
									name="address"
									id="address"
									value={formData.address}
									onChange={handleChange}
									className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
									placeholder="Enter your address"
								/>
							</div>

							<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
								<div className="space-y-2">
									<label
										htmlFor="city"
										className=" text-sm font-medium text-gray-700 flex items-center space-x-2"
									>
										<FiMapPin className="w-4 h-4" />
										<span>City</span>
									</label>
									<input
										type="text"
										name="city"
										id="city"
										value={formData.city}
										onChange={handleChange}
										className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
										placeholder="Enter city"
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="state"
										className=" text-sm font-medium text-gray-700 flex items-center space-x-2"
									>
										<FiMapPin className="w-4 h-4" />
										<span>State</span>
									</label>
									<input
										type="text"
										name="state"
										id="state"
										value={formData.state}
										onChange={handleChange}
										className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
										placeholder="Enter state"
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="country"
										className=" text-sm font-medium text-gray-700 items-center space-x-2"
									>
										<FiGlobe className="w-4 h-4" />
										<span>Country</span>
									</label>
									<input
										type="text"
										name="country"
										id="country"
										value={formData.country}
										onChange={handleChange}
										className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
										placeholder="Enter country"
									/>
								</div>
							</div>

							<div className="flex justify-end space-x-4 pt-6">
								<button
									type="button"
									onClick={handleClose}
									className="px-6 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
