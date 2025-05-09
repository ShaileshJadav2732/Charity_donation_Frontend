// Firebase user type
export interface FirebaseUserInfo {
  uid: string;
  email: string;
}

// Role type
export type UserRole = 'donor' | 'organization' | 'admin';

// Registration data type
export interface RegistrationData {
  email: string;
  firebaseUid: string;
  role: UserRole;
}

// Registration response type
export interface RegistrationResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    profileCompleted: boolean;
  };
  token: string;
}

// Login data type
export interface LoginData {
  firebaseUid: string;
}

// Login response type (same as registration response)
export type LoginResponse = RegistrationResponse;

// Token verification data type
export interface TokenVerificationData {
  idToken: string;
}

// Token verification response type (same as registration response)
export type TokenVerificationResponse = RegistrationResponse;
