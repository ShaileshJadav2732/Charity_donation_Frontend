"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	useGetCauseByIdQuery,
	useMakeDonationMutation,
} from "@/store/api/causeApi";
import {
	Loader2,
	Heart,
	DollarSign,
	Package,
	Droplet,
	BookOpen,
	Home,
	Gift,
	Utensils,
	Shirt,
	MoreHorizontal,
	Users,
	ArrowLeft,
	AlertCircle,
	CheckCircle2,
} from "lucide-react";
import { DonationType } from "@/types/donation";
import { formatCurrency } from "@/lib/utils";

const donationTypeIcons = {
	[DonationType.MONEY]: DollarSign,
	[DonationType.CLOTHES]: Shirt,
	[DonationType.BLOOD]: Droplet,
	[DonationType.FOOD]: Utensils,
	[DonationType.TOYS]: Gift,
	[DonationType.BOOKS]: BookOpen,
	[DonationType.FURNITURE]: Home,
	[DonationType.HOUSEHOLD]: Package,
	[DonationType.OTHER]: MoreHorizontal,
};

export default function DonorCauseDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const router = useRouter();
	const [selectedDonationType, setSelectedDonationType] =
		useState<DonationType | null>(null);
	const [donationAmount, setDonationAmount] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const { data, isLoading } = useGetCauseByIdQuery(params.id);
	const [makeDonation, { isLoading: isDonating }] = useMakeDonationMutation();

	const handleDonation = async () => {
		if (!selectedDonationType) {
			setError("Please select a donation type");
			return;
		}

		if (selectedDonationType === DonationType.MONEY && !donationAmount) {
			setError("Please enter an amount");
			return;
		}

		try {
			await makeDonation({
				causeId: params.id,
				type: selectedDonationType,
				amount:
					selectedDonationType === DonationType.MONEY
						? parseFloat(donationAmount)
						: undefined,
			}).unwrap();

			setSuccess("Thank you for your donation!");
			setError(null);
			setSelectedDonationType(null);
			setDonationAmount("");
		} catch (err) {
			setError("Failed to process donation. Please try again.");
			setSuccess(null);
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="flex justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
				</div>
			</div>
		);
	}

	if (!data?.cause) {
		return (
			<div className="container mx-auto py-8">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="text-center text-red-500">
						Cause not found. Please check the URL and try again.
					</div>
				</div>
			</div>
		);
	}

	const { cause } = data;
	const progress = Math.min(
		(cause.raisedAmount / cause.targetAmount) * 100,
		100
	);

	return (
		<div className="container mx-auto py-8">
			<div className="max-w-4xl mx-auto">
				<button
					onClick={() => router.back()}
					className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Causes
				</button>

				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
						<AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
						<p>{error}</p>
					</div>
				)}

				{success && (
					<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-green-700">
						<CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
						<p>{success}</p>
					</div>
				)}

				<div className="bg-white rounded-lg shadow overflow-hidden">
					<div className="relative aspect-video bg-gray-100">
						{cause.imageUrl ? (
							<img
								src={cause.imageUrl}
								alt={cause.title}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center bg-gray-100">
								<Heart className="h-12 w-12 text-gray-400" />
							</div>
						)}
					</div>

					<div className="p-6">
						<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
							<div className="flex-1">
								<h1 className="text-2xl font-semibold mb-2">{cause.title}</h1>
								<p className="text-gray-600 mb-4">{cause.description}</p>

								<div className="space-y-4">
									<div>
										<div className="flex items-center justify-between text-sm mb-1">
											<span className="text-gray-600">Progress</span>
											<span className="font-medium">
												{formatCurrency(cause.raisedAmount)} /{" "}
												{formatCurrency(cause.targetAmount)}
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className="bg-blue-600 h-2 rounded-full transition-all"
												style={{ width: `${progress}%` }}
											/>
										</div>
									</div>

									<div className="flex items-center gap-2 text-sm text-gray-600">
										<Users className="h-4 w-4" />
										<span>By {cause.organizationName}</span>
									</div>

									<div className="flex flex-wrap gap-2">
										{cause.tags.map((tag) => (
											<span
												key={tag}
												className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							</div>

							<div className="w-full md:w-80 bg-gray-50 rounded-lg p-4">
								<h2 className="font-semibold mb-4">Make a Donation</h2>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Donation Type
										</label>
										<div className="grid grid-cols-2 gap-2">
											{cause.acceptedDonationTypes.map((type) => {
												const Icon = donationTypeIcons[type];
												return (
													<button
														key={type}
														onClick={() => {
															setSelectedDonationType(type);
															setError(null);
														}}
														className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
															selectedDonationType === type
																? "bg-blue-50 border-blue-200 text-blue-700"
																: "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
														}`}
													>
														<Icon className="h-4 w-4" />
														<span className="text-sm font-medium">
															{type.charAt(0) + type.slice(1).toLowerCase()}
														</span>
													</button>
												);
											})}
										</div>
									</div>

									{selectedDonationType === DonationType.MONEY && (
										<div>
											<label
												htmlFor="amount"
												className="block text-sm font-medium text-gray-700 mb-2"
											>
												Amount
											</label>
											<div className="relative">
												<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
													$
												</span>
												<input
													type="number"
													id="amount"
													value={donationAmount}
													onChange={(e) => {
														setDonationAmount(e.target.value);
														setError(null);
													}}
													placeholder="0.00"
													min="0"
													step="0.01"
													className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>
										</div>
									)}

									<button
										onClick={handleDonation}
										disabled={
											isDonating ||
											!selectedDonationType ||
											(selectedDonationType === DonationType.MONEY &&
												!donationAmount)
										}
										className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										{isDonating ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Processing...
											</>
										) : (
											<>
												<Heart className="h-4 w-4 mr-2" />
												Donate Now
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
