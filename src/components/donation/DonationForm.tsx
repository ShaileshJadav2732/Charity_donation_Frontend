"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	FiUpload,
	FiCalendar,
	FiClock,
	FiMapPin,
	FiPhone,
	FiMail,
	FiPackage,
	FiDroplet,
	FiShoppingBag,
	FiBook,
	FiHome,
	FiCoffee,
} from "react-icons/fi";
import {
	DonationType,
	DonationStatus,
	DonationFormData,
	BloodType,
	ClothesType,
	FoodType,
	Address,
} from "@/types/donation";

interface DonationFormProps {
	organizations: Array<{
		_id: string;
		name: string;
		address: string;
	}>;
	onSubmit: (data: DonationFormData) => void;
}

const DonationForm: React.FC<DonationFormProps> = ({
	organizations,
	onSubmit,
}) => {
	const [donationType, setDonationType] = useState<DonationType>(
		DonationType.MONEY
	);
	const [isPickup, setIsPickup] = useState(false);
	const [formData, setFormData] = useState<Partial<DonationFormData>>({
		type: DonationType.MONEY,
		isPickup: false,
	});

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			setFormData((prev) => ({
				...prev,
				[parent]: {
					...(prev[parent as keyof typeof prev] as Record<string, string>),
					[child]: value,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setFormData((prev) => ({
					...prev,
					receiptImage: reader.result as string,
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData as DonationFormData);
	};

	const renderTypeSpecificFields = () => {
		switch (donationType) {
			case DonationType.MONEY:
				return (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Amount ($)
							</label>
							<div className="relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<span className="text-gray-500 sm:text-sm">$</span>
								</div>
								<input
									type="number"
									name="amount"
									value={formData.amount || ""}
									onChange={handleInputChange}
									className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									placeholder="0.00"
									step="0.01"
									min="0"
									required
								/>
							</div>
						</div>
					</div>
				);

			case DonationType.BLOOD:
				return (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Blood Type
							</label>
							<select
								name="bloodType"
								value={formData.bloodType || ""}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								required
							>
								<option value="">Select blood type</option>
								{Object.values(BloodType).map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Quantity
								</label>
								<input
									type="number"
									name="quantity"
									value={formData.quantity || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									min="1"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Unit
								</label>
								<select
									name="unit"
									value={formData.unit || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									required
								>
									<option value="">Select unit</option>
									<option value="ml">Milliliters (ml)</option>
									<option value="units">Units</option>
								</select>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Last Donation Date
							</label>
							<input
								type="date"
								name="lastDonationDate"
								value={formData.lastDonationDate || ""}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Health Conditions
							</label>
							<textarea
								name="healthConditions"
								value={formData.healthConditions || ""}
								onChange={handleInputChange}
								rows={3}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								placeholder="Any health conditions or medications..."
							/>
						</div>
					</div>
				);

			case DonationType.CLOTHES:
				return (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Clothes Type
							</label>
							<select
								name="clothesType"
								value={formData.clothesType || ""}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								required
							>
								<option value="">Select clothes type</option>
								{Object.values(ClothesType).map((type) => (
									<option key={type} value={type}>
										{type.replace(/_/g, " ")}
									</option>
								))}
							</select>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Quantity
								</label>
								<input
									type="number"
									name="quantity"
									value={formData.quantity || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									min="1"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Unit
								</label>
								<select
									name="unit"
									value={formData.unit || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									required
								>
									<option value="">Select unit</option>
									<option value="pieces">Pieces</option>
									<option value="bags">Bags</option>
								</select>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Condition
							</label>
							<select
								name="condition"
								value={formData.condition || ""}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								required
							>
								<option value="">Select condition</option>
								<option value="NEW">New</option>
								<option value="LIKE_NEW">Like New</option>
								<option value="GOOD">Good</option>
								<option value="FAIR">Fair</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Size (Optional)
							</label>
							<input
								type="text"
								name="size"
								value={formData.size || ""}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								placeholder="e.g., M, L, XL, etc."
							/>
						</div>
					</div>
				);

			case DonationType.FOOD:
				return (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Food Type
							</label>
							<select
								name="foodType"
								value={formData.foodType || ""}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								required
							>
								<option value="">Select food type</option>
								{Object.values(FoodType).map((type) => (
									<option key={type} value={type}>
										{type.replace(/_/g, " ")}
									</option>
								))}
							</select>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Quantity
								</label>
								<input
									type="number"
									name="quantity"
									value={formData.quantity || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									min="1"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Unit
								</label>
								<select
									name="unit"
									value={formData.unit || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									required
								>
									<option value="">Select unit</option>
									<option value="kg">Kilograms (kg)</option>
									<option value="boxes">Boxes</option>
									<option value="cans">Cans</option>
								</select>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Expiry Date
							</label>
							<input
								type="date"
								name="expiryDate"
								value={formData.expiryDate || ""}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Storage Instructions
							</label>
							<textarea
								name="storageInstructions"
								value={formData.storageInstructions || ""}
								onChange={handleInputChange}
								rows={3}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								placeholder="Any special storage requirements..."
							/>
						</div>
					</div>
				);

			default:
				return (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Quantity
								</label>
								<input
									type="number"
									name="quantity"
									value={formData.quantity || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									min="1"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Unit
								</label>
								<input
									type="text"
									name="unit"
									value={formData.unit || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									placeholder="e.g., pieces, boxes, etc."
									required
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Condition
							</label>
							<select
								name="condition"
								value={formData.condition || ""}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
							>
								<option value="">Select condition</option>
								<option value="NEW">New</option>
								<option value="LIKE_NEW">Like New</option>
								<option value="GOOD">Good</option>
								<option value="FAIR">Fair</option>
							</select>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Dimensions (Optional)
								</label>
								<input
									type="text"
									name="dimensions"
									value={formData.dimensions || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									placeholder="e.g., 10x20x30 cm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Weight (kg) (Optional)
								</label>
								<input
									type="number"
									name="weight"
									value={formData.weight || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									min="0"
									step="0.1"
								/>
							</div>
						</div>
					</div>
				);
		}
	};

	const renderAddressFields = (type: "pickup" | "dropoff") => {
		const address = formData[`${type}Address`] as Address || {};
		const prefix = type === "pickup" ? "pickup" : "dropoff";

		return (
			<div className="space-y-4">
				<h3 className="text-lg font-medium text-gray-900">
					{type === "pickup" ? "Pickup" : "Dropoff"} Address
				</h3>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Street Address
					</label>
					<input
						type="text"
						name={`${prefix}Address.street`}
						value={address.street || ""}
						onChange={handleInputChange}
						className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						required
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							City
						</label>
						<input
							type="text"
							name={`${prefix}Address.city`}
							value={address.city || ""}
							onChange={handleInputChange}
							className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							State/Province
						</label>
						<input
							type="text"
							name={`${prefix}Address.state`}
							value={address.state || ""}
							onChange={handleInputChange}
							className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							ZIP/Postal Code
						</label>
						<input
							type="text"
							name={`${prefix}Address.zipCode`}
							value={address.zipCode || ""}
							onChange={handleInputChange}
							className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Country
						</label>
						<input
							type="text"
							name={`${prefix}Address.country`}
							value={address.country || ""}
							onChange={handleInputChange}
							className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>
				</div>
			</div>
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8"
		>
			<h2 className="text-3xl font-bold text-gray-900 mb-8">
				Create a Donation
			</h2>

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Organization Selection */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Organization
					</label>
					<select
						name="organization"
						value={formData.organization || ""}
						onChange={handleInputChange}
						className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						required
					>
						<option value="">Select an organization</option>
						{organizations.map((org) => (
							<option key={org._id} value={org._id}>
								{org.name}
							</option>
						))}
					</select>
				</div>

				{/* Donation Type */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Donation Type
					</label>
					<select
						value={donationType}
						onChange={(e) => {
							setDonationType(e.target.value as DonationType);
							setFormData((prev) => ({ ...prev, type: e.target.value as DonationType }));
						}}
						className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						required
					>
						{Object.values(DonationType).map((type) => (
							<option key={type} value={type}>
								{type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
							</option>
						))}
					</select>
				</div>

				{/* Type-specific fields */}
				{renderTypeSpecificFields()}

				{/* Description */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Description
					</label>
					<textarea
						name="description"
						value={formData.description || ""}
						onChange={handleInputChange}
						rows={4}
						className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						placeholder="Describe your donation..."
						required
					/>
				</div>

				{/* Delivery Method */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Delivery Method
					</label>
					<div className="flex space-x-4">
						<label className="inline-flex items-center">
							<input
								type="radio"
								name="isPickup"
								checked={isPickup}
								onChange={() => setIsPickup(true)}
								className="form-radio text-blue-600"
							/>
							<span className="ml-2">Pickup</span>
						</label>
						<label className="inline-flex items-center">
							<input
								type="radio"
								name="isPickup"
								checked={!isPickup}
								onChange={() => setIsPickup(false)}
								className="form-radio text-blue-600"
							/>
							<span className="ml-2">Dropoff</span>
						</label>
					</div>
				</div>

				{/* Address Fields */}
				{isPickup ? renderAddressFields("pickup") : renderAddressFields("dropoff")}

				{/* Schedule */}
				{donationType !== DonationType.MONEY && (
					<div className="space-y-4">
						<h3 className="text-lg font-medium text-gray-900">Schedule</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Date
								</label>
								<input
									type="date"
									name="scheduledDate"
									value={formData.scheduledDate || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Time
								</label>
								<input
									type="time"
									name="scheduledTime"
									value={formData.scheduledTime || ""}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									required
								/>
							</div>
						</div>
					</div>
				)}

				{/* Contact Information */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Phone Number
							</label>
							<input
								type="tel"
								name="contactPhone"
								value={formData.contactPhone || ""}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Email
							</label>
							<input
								type="email"
								name="contactEmail"
								value={formData.contactEmail || ""}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								required
							/>
						</div>
					</div>
				</div>

				{/* Additional Notes */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Additional Notes
					</label>
					<textarea
						name="notes"
						value={formData.notes || ""}
						onChange={handleInputChange}
						rows={3}
						className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						placeholder="Any additional information..."
					/>
				</div>

				{/* Submit Button */}
				<div>
					<button
						type="submit"
						className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Submit Donation
					</button>
				</div>
			</form>
		</motion.div>
	);
};

export default DonationForm;
