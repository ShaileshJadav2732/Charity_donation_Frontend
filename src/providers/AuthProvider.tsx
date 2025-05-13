"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { setUser, setLoading } from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/select-role"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
   const dispatch = useDispatch();
   const router = useRouter();
   const pathname = usePathname();

   useEffect(() => {
      if (typeof window === "undefined") {
         return;
      }

      dispatch(setLoading(true));

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
         try {
            if (firebaseUser) {
               // User is signed in
               const token = await firebaseUser.getIdToken();

               // Store token in cookie
               Cookies.set("token", token, { expires: 7 });

               // Check if user exists in backend
               const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/auth/check?email=${firebaseUser.email}`,
                  {
                     headers: {
                        Authorization: `Bearer ${token}`
                     }
                  }
               );

               if (response.ok) {
                  const userData = await response.json();
                  dispatch(setUser(userData));

                  // Redirect based on profile completion
                  if (!userData.profileCompleted && !pathname.includes("/complete-profile")) {
                     router.push("/complete-profile");
                  } else if (PUBLIC_ROUTES.includes(pathname)) {
                     router.push("/dashboard");
                  }
               } else if (response.status === 404) {
                  // User exists in Firebase but not in our backend
                  if (!pathname.includes("/select-role")) {
                     router.push("/select-role");
                  }
               } else {
                  throw new Error("Failed to verify user");
               }
            } else {
               // User is signed out
               Cookies.remove("token");
               Cookies.remove("authToken");
               dispatch(setUser(null));

               if (!PUBLIC_ROUTES.includes(pathname)) {
                  router.push("/login");
               }
            }
         } catch (error) {
            console.error("Authentication error:", error);
            Cookies.remove("token");
            Cookies.remove("authToken");
            dispatch(setUser(null));

            if (!PUBLIC_ROUTES.includes(pathname)) {
               router.push("/login");
            }
         } finally {
            dispatch(setLoading(false));
         }
      });

      return () => unsubscribe();
   }, [dispatch, router, pathname]);

   return <>{children}</>;
}

export default AuthProvider; 