"use client";

import { LoginFormData } from "@/types";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FiArrowRight, FiLock, FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import { parseError } from "@/types/errors";
import { useRouter } from "next/navigation";
import { useLoginWithEmailMutation, useLoginWithGoogleMutation } from "@/store/api/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/authSlice";

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loginWithEmail, { isLoading: isEmailLoading }] = useLoginWithEmailMutation();
  const [loginWithGoogle, { isLoading: isGoogleLoading }] = useLoginWithGoogleMutation();
  const isLoading = isEmailLoading || isGoogleLoading;

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await loginWithEmail(formData).unwrap();
      dispatch(setUser(result));
      toast.success("Logged in successfully!");

      // Redirect is handled by the AuthProvider
    } catch (error: unknown) {
      console.error("Login error:", error);
      const parsedError = parseError(error);
      toast.error(parsedError.message || "Failed to log in");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      toast.loading("Signing in with Google...", { id: "google-login" });
      const result = await loginWithGoogle().unwrap();
      dispatch(setUser(result));
      toast.dismiss("google-login");
      toast.success("Logged in with Google!");

      // Redirect is handled by the AuthProvider
    } catch (error: unknown) {
      console.error("Google login error:", error);
      toast.dismiss("google-login");
      const parsedError = parseError(error);

      if (parsedError.status === 404) {
        // User exists in Firebase but not in our backend
        router.push("/select-role");
        return;
      }

      toast.error(parsedError.message || "Failed to log in with Google");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
        <div className="text-teal-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <svg
            className="h-12 w-12 text-teal-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to GreenGive
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Sign in to continue your journey of giving
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus("email")}
                  onBlur={handleBlur}
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2.5 rounded-md border ${focusedField === "email"
                      ? "border-teal-500 ring-1 ring-teal-200"
                      : "border-gray-200"
                    } focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
                  placeholder="you@example.com"
                  aria-describedby="email"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-500 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus("password")}
                  onBlur={handleBlur}
                  required
                  className={`appearance-none block w-full pl-10 pr-10 py-2.5 rounded-md border ${focusedField === "password"
                      ? "border-teal-500 ring-1 ring-teal-200"
                      : "border-gray-200"
                    } focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 placeholder-gray-400 text-gray-900 sm:text-sm bg-gray-50`}
                  placeholder="••••••••"
                  aria-describedby="password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FiEyeOff
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      aria-hidden="true"
                    />
                  ) : (
                    <FiEye
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                aria-describedby="remember-me"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-600"
              >
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-teal-400 disabled:cursor-not-allowed"
              aria-label="Log in"
            >
              {isEmailLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                <>
                  Sign In
                  <FiArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="px-6 py-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="px-6 pb-6 space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              aria-label="Continue with Google"
            >
              <FcGoogle className="h-5 w-5 mr-2" aria-hidden="true" />
              Sign in with Google
            </button>

            {/* Signup Link */}
            <div className="text-center text-sm">
              <p className="text-gray-600">
                New to GreenGive?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-teal-600 hover:text-teal-500 transition-colors duration-200"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
