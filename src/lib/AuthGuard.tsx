"use client";

import { auth } from "@/lib/firebase";
import { setCredentials, clearCredentials } from "@/store/slices/authSlice";
// import { setUser } from '@/redux/reducer/authReducer';
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useVerifyTokenMutation } from "@/store/api/authApi";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch();
	const [verifyToken] = useVerifyTokenMutation();

	// const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				try {
					const idToken = await firebaseUser.getIdToken();
					// Verify token with backend
					const response = await verifyToken({ idToken }).unwrap();
					dispatch(
						setCredentials({
							user: response.user,
							token: response.token,
						})
					);
				} catch (error) {
					dispatch(clearCredentials());
					router.replace("/login");
				}
			} else {
				dispatch(clearCredentials());
				router.replace("/login");
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, [dispatch, router, verifyToken]);

	if (loading) return <div>Loading...</div>;

	return <>{children}</>;
}
