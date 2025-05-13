// Export all types from other files
export * from "./errors";
export * from "./user";

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
	documents?: string[];
	verified: boolean;
	createdAt?: string;
	updatedAt?: string;
}

// Auth form types
export interface SignupFormData {
	email: string;
	password: string;
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
