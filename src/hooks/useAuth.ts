"use client";

import { auth, googleProvider } from "@/lib/firebase";
import { RootState } from "@/store/store";
import { ApiError } from "@/types";
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useLoginWithEmailMutation,
  useLoginWithGoogleMutation,
  useLogoutMutation,
} from "@/store/api/authApi";
import { setUser, setLoading } from "@/store/slices/authSlice";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/select-role"];

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // RTK Query mutations
  const [loginWithEmailApi] = useLoginWithEmailMutation();
  const [loginWithGoogleApi] = useLoginWithGoogleMutation();
  const [logoutApi] = useLogoutMutation();

  // Debounce function to delay redirects
  const debounce = <T>(fn: (...args: T[]) => void, ms: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: T[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), ms);
    };
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    if (typeof window === "undefined") {
      console.log("Skipping Firebase auth listener during SSR");
      return;
    }

    console.log("Setting up Firebase auth listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        "Auth state changed:",
        user ? `User logged in: ${user.email}` : "User logged out"
      );
      setFirebaseUser(user);
      setAuthInitialized(true);

      const handleAuthState = debounce(async () => {
        // Don't redirect if on a public route
        if (PUBLIC_ROUTES.includes(pathname)) {
          console.log("On public route, skipping redirect");
          if (!user) {
            dispatch(setUser(null));
          }
          return;
        }

        if (user) {
          try {
            // Check if user exists in backend
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/check?email=${user.email}`
            );
            const userData = await response.json();

            if (!response.ok) {
              throw new Error(userData.message || "Failed to verify user");
            }

            console.log("User verified successfully:", userData);
            dispatch(setUser(userData));

            // Redirect based on profile completion
            if (!userData.profileCompleted) {
              console.log(
                "Profile not completed, redirecting to /complete-profile"
              );
              router.push("/complete-profile");
            } else if (pathname === "/login" || pathname === "/signup") {
              console.log("Already authenticated, redirecting to /dashboard");
              router.push("/dashboard");
            }
          } catch (error: unknown) {
            console.error("Auth error:", error);
            const apiError = error as ApiError;
            if (apiError.status === 404) {
              console.log(
                "User not found in backend, redirecting to /select-role"
              );
              router.push("/select-role");
            } else {
              dispatch(setUser(null));
              if (!PUBLIC_ROUTES.includes(pathname)) {
                console.log("Authentication failed, redirecting to /login");
                router.push("/login");
              }
            }
          }
        } else {
          dispatch(setUser(null));
          if (!PUBLIC_ROUTES.includes(pathname)) {
            console.log("No user, redirecting to /login");
            router.push("/login");
          }
        }
      }, 200);

      handleAuthState();
    });

    return () => {
      console.log("Cleaning up Firebase auth listener");
      unsubscribe();
    };
  }, [dispatch, router, pathname]);

  // Signup with email and password
  const signup = async (email: string, password: string, role: string) => {
    dispatch(setLoading(true));

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;
      console.log("Firebase user created:", firebaseUser.uid);

      // Create user in backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            firebaseUid: firebaseUser.uid,
            role,
          }),
        }
      );

      const userData = await response.json();

      if (!response.ok) {
        throw new Error(userData.message || "Failed to register");
      }

      console.log("Backend registration successful:", userData);
      dispatch(setUser(userData));

      if (!userData.profileCompleted) {
        console.log("Redirecting to /complete-profile after signup");
        router.push("/complete-profile");
      } else {
        console.log("Redirecting to /dashboard after signup");
        router.push("/dashboard");
      }

      return userData;
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const err = error as Error;
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Login with email and password
  const loginWithEmail = async (email: string, password: string) => {
    dispatch(setLoading(true));

    try {
      const result = await loginWithEmailApi({ email, password }).unwrap();

      // Fetch the full DbUser from backend using the email
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/check?email=${result.email}`
      );
      const userData = await response.json();

      if (!response.ok) {
        throw new Error(userData.message || "Failed to verify user");
      }

      dispatch(setUser(userData));

      if (!userData.profileCompleted) {
        console.log("Redirecting to /complete-profile after email login");
        router.push("/complete-profile");
      } else {
        console.log("Redirecting to /dashboard after email login");
        router.push("/dashboard");
      }

      return userData;
    } catch (error: unknown) {
      console.error("Login error:", error);
      const err = error as Error;
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    dispatch(setLoading(true));

    try {
      const result = await loginWithGoogleApi().unwrap();

      // Fetch the full DbUser from backend using the email
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/check?email=${result.email}`
      );
      const userData = await response.json();

      if (!response.ok) {
        throw new Error(userData.message || "Failed to verify user");
      }

      dispatch(setUser(userData));

      if (!userData.profileCompleted) {
        console.log("Redirecting to /complete-profile after Google login");
        router.push("/complete-profile");
      } else {
        console.log("Redirecting to /dashboard after Google login");
        router.push("/dashboard");
      }

      return userData;
    } catch (error: unknown) {
      console.error("Google login error:", error);
      const apiError = error as ApiError;

      if (apiError.status === 404) {
        console.log("User not found in backend, redirecting to /select-role");
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "pendingGoogleUser",
            JSON.stringify({
              uid: firebaseUser?.uid,
              email: firebaseUser?.email,
            })
          );
        }
        router.push("/select-role");
        return null;
      }

      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(setUser(null));
      console.log("Logged out successfully");
      router.push("/login");
    } catch (error: unknown) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    isAuthenticated,
    isLoading: loading,
    authInitialized,
    signup,
    loginWithEmail,
    loginWithGoogle,
    logout,
  };
};
