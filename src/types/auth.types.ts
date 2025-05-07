export interface IUser {
	_id?: string; // MongoDB ObjectId

	email: string;
	role: UserRole;
	displayName?: string;
	photoURL?: string;
	firebaseUid?: string; // Firebase UID stored in MongoDB
	isNewUser?: boolean;
	emailVerified?: boolean;
	createdAt?: string;
	updatedAt?: string;
	isProfileCompleted?: boolean;
}

export type UserRole = "donor" | "organization" | "admin";

export interface FirebaseUserData {
	uid: string;
	email: string | null;
	emailVerified: boolean;
	displayName: string | null;
	photoURL: string | null;
}

export interface LoginRequest {
	idToken: string;
	userData?: FirebaseUserData; // Additional user data for MongoDB
}

export interface SignupRequest {
	idToken: string;
	role: UserRole;
	userData?: FirebaseUserData; // Additional user data for MongoDB
}

export interface AuthResponse {
	token: string;
	user: IUser;
	message: string;
}

export interface AuthState {
	user: IUser | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

export interface EmailLoginPayload {
	email: string;
	password: string;
}

export interface EmailSignupPayload {
	email: string;
	password: string;
	role: UserRole;
}

export interface FirebaseErrors {
	[code: string]: string;
}
