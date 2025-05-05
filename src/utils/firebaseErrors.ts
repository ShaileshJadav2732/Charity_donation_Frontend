import { FirebaseErrors } from "../types/auth.types";

export const firebaseAuthErrors: FirebaseErrors = {
	"auth/email-already-in-use":
		"This email is already registered. Please log in instead.",
	"auth/invalid-email": "The email address is not valid.",
	"auth/user-disabled":
		"This user account has been disabled by an administrator.",
	"auth/user-not-found": "No account found with this email. Please sign up.",
	"auth/wrong-password": "Incorrect password. Please try again.",
	"auth/invalid-credential": "Invalid login credentials. Please try again.",
	"auth/weak-password":
		"Password is too weak. It should be at least 6 characters.",
	"auth/popup-closed-by-user":
		"Google sign-in was cancelled. Please try again.",
	"auth/operation-not-allowed":
		"This operation is not allowed. Contact support.",
	"auth/account-exists-with-different-credential":
		"An account already exists with the same email but different sign-in credentials.",
};

export const getFirebaseErrorMessage = (code: string): string => {
	return (
		firebaseAuthErrors[code] || "An unknown error occurred. Please try again."
	);
};
