import axios from "axios";
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";

interface AuthUser {
	id: string;
	username: string;
	email: string;
	role: string;
	displayName?: string;
	photoURL?: string;
}

export function useAuth() {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				try {
					// Get the ID token
					const idToken = await firebaseUser.getIdToken();

					// Send to your backend
					const response = await axios.post("/api/auth/firebase", { idToken });

					// Set user state from your backend's response
					setUser(response.data.user);

					// Store JWT token
					localStorage.setItem("token", response.data.token);

					setLoading(false);
				} catch (err) {
					console.error("Backend authentication error:", err);
					setError("Failed to authenticate with backend");
					setLoading(false);
				}
			} else {
				setUser(null);
				localStorage.removeItem("token");
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, []);

	const registerWithEmail = async (
		email: string,
		password: string,
		role: string
	) => {
		try {
			setError(null);
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const idToken = await userCredential.user.getIdToken();

			// Register with your backend
			await axios.post("/api/auth/firebase", { idToken, role });
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const loginWithEmail = async (email: string, password: string) => {
		try {
			setError(null);
			await signInWithEmailAndPassword(auth, email, password);
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const loginWithGoogle = async (role?: string) => {
		try {
			setError(null);
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const idToken = await result.user.getIdToken();

			// Authenticate with your backend
			await axios.post("/api/auth/firebase", { idToken, role });
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	const logout = async () => {
		try {
			await signOut(auth);
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	return {
		user,
		loading,
		error,
		registerWithEmail,
		loginWithEmail,
		loginWithGoogle,
		logout,
	};
}
