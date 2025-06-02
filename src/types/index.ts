// Export all types from other files
export * from "./errors";
export * from "./user";
export * from "./donation";
export * from "./forms";
export * from "./payment";
export * from "./analytics";
export * from "./cause";
export * from "./profile";
export * from "./campaigns";
export * from "./message";

// User types
export interface User {
	id: string;
	email: string;
	role: "donor" | "organization" | "admin";
	profileCompleted: boolean;
}

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

// Profile types
export interface DonorProfile {
	userId: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	profileImage?: string;
	cloudinaryPublicId?: string;
	coverImage?: string;
	coverImageCloudinaryId?: string;
	bio?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface OrganizationProfile {
	userId: string;
	name: string;
	description: string;
	phoneNumber: string;
	email: string;
	website?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	logo?: string;
	coverImage?: string;
	coverImageCloudinaryId?: string;
	documents?: string[];
	verified: boolean;
	createdAt?: string;
	updatedAt?: string;
}

// Auth form types
export interface SignupFormData {
	email: string;
	password: string;
	confirmPassword: string;
	role: "donor" | "organization";
}

export interface LoginFormData {
	email: string;
	password: string;
}

// Profile form types
export interface DonorProfileFormData {
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	profileImage?: string;
	cloudinaryPublicId?: string;
	bio?: string;
}

export interface OrganizationProfileFormData {
	name: string;
	description: string;
	phoneNumber: string;
	email: string;
	website?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
}
