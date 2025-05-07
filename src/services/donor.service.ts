import axios from "axios";
import { API_URL } from "./api.service";

// Define types for donor profile data
export interface DonorProfileData {
	fullAddress: string;
	phone: string;
	profilePhoto?: string;
	donationPreferences: string[];
	availability: string;
}

// Complete donor profile
export const completeDonorProfile = async (profileData: DonorProfileData) => {
	const response = await axios.post(
		`${API_URL}/api/donors/complete-profile`,
		profileData
	);
	return response.data;
};
