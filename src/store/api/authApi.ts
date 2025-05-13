import { auth, googleProvider } from "@/lib/firebase";
import { axiosInstance } from "@/utils/axiosInstance";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
  getIdToken,
} from "firebase/auth";
import Cookies from "js-cookie";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/auth/`,
    prepareHeaders: (headers) => {
      const token = Cookies.get("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Firebase email/password login
    loginWithEmail: builder.mutation<User, { email: string; password: string }>(
      {
        queryFn: async ({ email, password }) => {
          try {
            const userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );

            // Get the token and store it in a cookie
            const token = await userCredential.user.getIdToken();
            Cookies.set("token", token, { expires: 7 });

            // Check if user exists in backend
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/check?email=${email}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            if (!response.ok) {
              throw new Error("Failed to verify user");
            }

            const userData = await response.json();
            return { data: userData };
          } catch (error: any) {
            return { error: { status: 401, data: error.message } };
          }
        },
      }
    ),

    // Google login
    loginWithGoogle: builder.mutation<User, void>({
      queryFn: async () => {
        try {
          const userCredential = await signInWithPopup(auth, googleProvider);
          const token = await userCredential.user.getIdToken();
          const email = userCredential.user.email;

          // Store token in cookie
          Cookies.set("token", token, { expires: 7 });

          try {
            // Check if user exists in backend
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/check?email=${email}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            if (response.ok) {
              const userData = await response.json();
              return { data: userData };
            } else if (response.status === 404) {
              // User exists in Firebase but not in backend
              return {
                error: {
                  status: 404,
                  data: {
                    message: "User not found in backend",
                    firebaseUser: {
                      uid: userCredential.user.uid,
                      email: userCredential.user.email
                    }
                  }
                }
              };
            } else {
              throw new Error("Failed to verify user");
            }
          } catch (err: any) {
            return {
              error: {
                status: err?.response?.status || 500,
                data: err?.response?.data || err.message,
              },
            };
          }
        } catch (err: any) {
          return {
            error: {
              status: err?.response?.status || 500,
              data: err?.response?.data || err.message,
            },
          };
        }
      },
    }),

    // Logout
    logout: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          await firebaseSignOut(auth);
          // Clear cookies
          Cookies.remove("token");
          Cookies.remove("authToken");
          return { data: undefined };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    }),
  }),
});

export const {
  useLoginWithEmailMutation,
  useLoginWithGoogleMutation,
  useLogoutMutation,
} = authApi;
