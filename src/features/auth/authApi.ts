import axiosInstance from "@/services/axiosInstance";
import { ISignupData } from "@/types/user";

export const signupUser = async (data: ISignupData) => {
	const response = await axiosInstance.post("/auth/signup", data);
	return response.data;
};
