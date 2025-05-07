export interface DonorProfileData {
	fullAddress: string;
	phone: string;
	profilePhoto?: string;
	donationPreferences: string[];
	availability: string;
}
export interface DonorProfileResponse {
	message: string;
	donor: {
		_id: string;
		user: string;
		fullAddress: string;
		phone: string;
		profilePhoto?: string;
		donationPreferences: string[];
		availability: string;
		isProfileCompleted: boolean;
		createdAt: string;
		updatedAt: string;
	};
}
