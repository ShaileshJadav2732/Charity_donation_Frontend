import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	FiUpload,
	FiCalendar,
	FiClock,
	FiMapPin,
	FiPhone,
	FiMail,
} from "react-icons/fi";
import {
	DonationType,
	DonationStatus,
	DonationFormData,
} from "../../types/donation";

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
	const [formData, setFormData] = useState({
		organization: "",
		amount: "",
		description: "",
		quantity: "",
		unit: "",
		scheduledDate: "",
		scheduledTime: "",
		pickupAddress: {
			street: "",
			city: "",
			state: "",
			zipCode: "",
			country: "",
		},
		dropoffAddress: {
			street: "",
			city: "",
			state: "",
			zipCode: "",
			country: "",
		},
		contactPhone: "",
		contactEmail: "",
		notes: "",
		receiptImage: "",
	});

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
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
		onSubmit({
			...formData,
			type: donationType,
			isPickup,
			status: DonationStatus.PENDING,
		});
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
						value={formData.organization}
						onChange={handleInputChange}
						className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
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
						onChange={(e) => setDonationType(e.target.value as DonationType)}
						className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
						required
					>
						{Object.values(DonationType).map((type) => (
							<option key={type} value={type}>
								{type.charAt(0) + type.slice(1).toLowerCase()}
							</option>
						))}
					</select>
				</div>

				{/* Amount for Monetary Donations */}
				{donationType === DonationType.MONEY && (
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
								value={formData.amount}
								onChange={handleInputChange}
								className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
								placeholder="0.00"
								step="0.01"
								min="0"
								required
							/>
						</div>
					</div>
				)}

				{/* Quantity and Unit for Non-Monetary Donations */}
				{donationType !== DonationType.MONEY && (
					<div className="grid grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Quantity
							</label>
							<input
								type="number"
								name="quantity"
								value={formData.quantity}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
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
								value={formData.unit}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
								placeholder="e.g., kg, pieces, boxes"
								required
							/>
						</div>
					</div>
				)}

				{/* Description */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Description
					</label>
					<textarea
						name="description"
						value={formData.description}
						onChange={handleInputChange}
						rows={4}
						className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
						placeholder="Describe your donation..."
						required
					/>
				</div>

				{/* Pickup/Dropoff Toggle */}
				{donationType !== DonationType.MONEY && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-3">
							Delivery Method
						</label>
						<div className="flex space-x-4">
							<button
								type="button"
								onClick={() => setIsPickup(true)}
								className={`flex-1 py-3 px-4 rounded-lg border ${
									isPickup
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-300 text-gray-700 hover:bg-gray-50"
								} flex items-center justify-center`}
							>
								<FiMapPin className="mr-2" />
								Pickup
							</button>
							<button
								type="button"
								onClick={() => setIsPickup(false)}
								className={`flex-1 py-3 px-4 rounded-lg border ${
									!isPickup
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-300 text-gray-700 hover:bg-gray-50"
								} flex items-center justify-center`}
							>
								<FiMapPin className="mr-2" />
								Dropoff
							</button>
						</div>
					</div>
				)}

				{/* Address Fields */}
				{donationType !== DonationType.MONEY && (
					<div className="space-y-4">
						<h3 className="text-lg font-medium text-gray-900">
							{isPickup ? "Pickup Address" : "Dropoff Address"}
						</h3>
						<div className="grid grid-cols-2 gap-6">
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Street Address
								</label>
								<input
									type="text"
									name={
										isPickup ? "pickupAddress.street" : "dropoffAddress.street"
									}
									value={
										isPickup
											? formData.pickupAddress.street
											: formData.dropoffAddress.street
									}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									City
								</label>
								<input
									type="text"
									name={isPickup ? "pickupAddress.city" : "dropoffAddress.city"}
									value={
										isPickup
											? formData.pickupAddress.city
											: formData.dropoffAddress.city
									}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									State
								</label>
								<input
									type="text"
									name={
										isPickup ? "pickupAddress.state" : "dropoffAddress.state"
									}
									value={
										isPickup
											? formData.pickupAddress.state
											: formData.dropoffAddress.state
									}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									ZIP Code
								</label>
								<input
									type="text"
									name={
										isPickup
											? "pickupAddress.zipCode"
											: "dropoffAddress.zipCode"
									}
									value={
										isPickup
											? formData.pickupAddress.zipCode
											: formData.dropoffAddress.zipCode
									}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Country
								</label>
								<input
									type="text"
									name={
										isPickup
											? "pickupAddress.country"
											: "dropoffAddress.country"
									}
									value={
										isPickup
											? formData.pickupAddress.country
											: formData.dropoffAddress.country
									}
									onChange={handleInputChange}
									className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
									required
								/>
							</div>
						</div>
					</div>
				)}

				{/* Scheduling for Non-Monetary Donations */}
				{donationType !== DonationType.MONEY && (
					<div className="grid grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								<FiCalendar className="inline-block mr-2" />
								Scheduled Date
							</label>
							<input
								type="date"
								name="scheduledDate"
								value={formData.scheduledDate}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								<FiClock className="inline-block mr-2" />
								Scheduled Time
							</label>
							<input
								type="time"
								name="scheduledTime"
								value={formData.scheduledTime}
								onChange={handleInputChange}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
								required
							/>
						</div>
					</div>
				)}

				{/* Contact Information */}
				<div className="grid grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<FiPhone className="inline-block mr-2" />
							Contact Phone
						</label>
						<input
							type="tel"
							name="contactPhone"
							value={formData.contactPhone}
							onChange={handleInputChange}
							className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<FiMail className="inline-block mr-2" />
							Contact Email
						</label>
						<input
							type="email"
							name="contactEmail"
							value={formData.contactEmail}
							onChange={handleInputChange}
							className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
							required
						/>
					</div>
				</div>

				{/* Receipt Image Upload */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						<FiUpload className="inline-block mr-2" />
						Receipt Image (Optional)
					</label>
					<input
						type="file"
						name="receiptImage"
						accept="image/*"
						onChange={handleFileChange}
						className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
					/>
				</div>

				{/* Additional Notes */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Additional Notes (Optional)
					</label>
					<textarea
						name="notes"
						value={formData.notes}
						onChange={handleInputChange}
						rows={4}
						className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
						placeholder="Any additional information..."
					/>
				</div>

				{/* Submit Button */}
				<div>
					<button
						type="submit"
						className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
					>
						Submit Donation
					</button>
				</div>
			</form>
		</motion.div>
	);
};

export default DonationForm;
