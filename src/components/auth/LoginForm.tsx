"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoginFormData, parseError } from "@/types";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import {
	Box,
	Typography,
	Divider,
	IconButton,
	InputAdornment,
	// Alert, // Unused
} from "@mui/material";
import {
	Email as EmailIcon,
	Lock as LockIcon,
	Visibility,
	VisibilityOff,
	ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import FormContainer from "@/components/ui/FormContainer";
import FormInput from "@/components/ui/FormInput";
import FormButton from "@/components/ui/FormButton";
import { motion } from "framer-motion";

const LoginForm = () => {
	const { loginWithEmail, loginWithGoogle, isLoading, authInitialized } =
		useAuth();

	const [formData, setFormData] = useState<LoginFormData>({
		email: "",
		password: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password.trim()) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

<<<<<<< Updated upstream
  const handleGoogleLogin = async () => {
    try {
      console.log("LoginForm: Attempting Google login");
      toast.loading("Signing in with Google...", { id: "google-login" });

      // Check if browser supports popups
      const popupBlocked = window.innerWidth < 1 || window.innerHeight < 1;
      if (popupBlocked) {
        toast.dismiss("google-login");
        toast.error("Please allow popups for this site to use Google login");
        return;
      }

      await loginWithGoogle();
      console.log(
        "LoginForm: Google login successful, relying on useAuth for redirect"
      );
      toast.dismiss("google-login");
      toast.success("Logged in with Google!");
    } catch (error: unknown) {
      console.error("LoginForm: Google login error:", error);
      toast.dismiss("google-login");
      const parsedError = parseError(error);

      // Provide more user-friendly error messages
      if (parsedError.message?.includes("popup")) {
        toast.error("Google login popup was blocked. Please allow popups for this site.");
      } else if (parsedError.message?.includes("network")) {
        toast.error("Network error. Please check your internet connection and try again.");
      } else if (parsedError.message?.includes("cancelled")) {
        toast.error("Google login was cancelled. Please try again.");
      } else {
        toast.error(parsedError.message || "Failed to log in with Google");
      }
    }
  };
=======
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
>>>>>>> Stashed changes

		if (!validateForm()) {
			return;
		}

		try {
			console.log("LoginForm: Attempting login with email", formData.email);
			await loginWithEmail(formData);
			console.log(
				"LoginForm: Login successful, relying on useAuth for redirect"
			);
			toast.success("Welcome back!");
		} catch (error: unknown) {
			console.error("LoginForm: Login error:", error);
			const parsedError = parseError(error);
			toast.error(parsedError.message || "Failed to log in");
		}
	};

<<<<<<< Updated upstream
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
=======
	const handleGoogleLogin = async () => {
		try {
			console.log("LoginForm: Attempting Google login");
			toast.loading("Signing in with Google...", { id: "google-login" });

			// Check if browser supports popups
			const popupBlocked = window.innerWidth < 1 || window.innerHeight < 1;
			if (popupBlocked) {
				toast.dismiss("google-login");
				toast.error("Please allow popups for this site to use Google login");
				return;
			}
>>>>>>> Stashed changes

			await loginWithGoogle();
			console.log(
				"LoginForm: Google login successful, relying on useAuth for redirect"
			);
			toast.dismiss("google-login");
			toast.success("Logged in with Google!");
		} catch (error: unknown) {
			console.error("LoginForm: Google login error:", error);
			toast.dismiss("google-login");
			const parsedError = parseError(error);

			// Provide more user-friendly error messages
			if (parsedError.message?.includes("popup")) {
				toast.error(
					"Google login popup was blocked. Please allow popups for this site."
				);
			} else if (parsedError.message?.includes("network")) {
				toast.error(
					"Network error. Please check your internet connection and try again."
				);
			} else if (parsedError.message?.includes("cancelled")) {
				toast.error("Google login was cancelled. Please try again.");
			} else {
				toast.error(parsedError.message || "Failed to log in with Google");
			}
		}
	};

	if (!authInitialized) {
		return (
			<Box
				sx={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
				}}
			>
				<Typography color="primary.main">Loading...</Typography>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
				py: 4,
			}}
		>
			<FormContainer
				title="Welcome Back"
				subtitle="Sign in to continue your journey of giving"
				maxWidth={480}
				headerContent={
					<Box sx={{ textAlign: "center", mb: 2 }}>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.5, type: "spring" }}
						>
							<Box
								sx={{
									width: 64,
									height: 64,
									borderRadius: "50%",
									background:
										"linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									mx: "auto",
									mb: 2,
									boxShadow: "0 8px 32px rgba(20, 184, 166, 0.3)",
								}}
							>
								<EmailIcon sx={{ color: "white", fontSize: 32 }} />
							</Box>
						</motion.div>
					</Box>
				}
			>
				<Box
					component="form"
					onSubmit={handleSubmit}
					sx={{ display: "flex", flexDirection: "column", gap: 3 }}
				>
					{/* Email Field */}
					<FormInput
						name="email"
						type="email"
						label="Email Address"
						value={formData.email}
						onChange={handleChange}
						error={Boolean(errors.email)}
						helperText={errors.email}
						icon={<EmailIcon />}
						placeholder="you@example.com"
						autoComplete="email"
						required
						fullWidth
					/>

					{/* Password Field */}
					<Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 1,
							}}
						>
							<Typography variant="body2" sx={{ fontWeight: 500 }}>
								Password
							</Typography>
							<Link href="/forgot-password" style={{ textDecoration: "none" }}>
								<Typography
									variant="body2"
									sx={{
										color: "primary.main",
										"&:hover": { color: "primary.dark" },
										transition: "color 0.2s",
									}}
								>
									Forgot password?
								</Typography>
							</Link>
						</Box>
						<FormInput
							name="password"
							type={showPassword ? "text" : "password"}
							label="Password"
							value={formData.password}
							onChange={handleChange}
							error={Boolean(errors.password)}
							helperText={errors.password}
							icon={<LockIcon />}
							placeholder="••••••••"
							autoComplete="current-password"
							required
							fullWidth
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={togglePasswordVisibility}
											edge="end"
											aria-label={
												showPassword ? "Hide password" : "Show password"
											}
										>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>
					</Box>

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
					<FormButton
						type="submit"
						variant="primary"
						loading={isLoading}
						loadingText="Signing in..."
						fullWidth
						icon={<ArrowForwardIcon />}
					>
						Sign In
					</FormButton>
				</Box>

				{/* Divider */}
				<Box sx={{ my: 3 }}>
					<Divider>
						<Typography variant="body2" color="text.secondary">
							Or continue with
						</Typography>
					</Divider>
				</Box>

				{/* Google Login Button */}
				<FormButton
					variant="outlined"
					onClick={handleGoogleLogin}
					loading={isLoading}
					loadingText="Connecting..."
					fullWidth
					icon={<FcGoogle style={{ fontSize: 20 }} />}
				>
					Sign in with Google
				</FormButton>

				{/* Signup Link */}
				<Box sx={{ textAlign: "center", mt: 3 }}>
					<Typography variant="body2" color="text.secondary">
						New to GreenGive?{" "}
						<Link href="/signup" style={{ textDecoration: "none" }}>
							<Typography
								component="span"
								variant="body2"
								sx={{
									color: "primary.main",
									fontWeight: 600,
									"&:hover": { color: "primary.dark" },
									transition: "color 0.2s",
								}}
							>
								Create an account
							</Typography>
						</Link>
					</Typography>
				</Box>
			</FormContainer>
		</Box>
	);
};

export default LoginForm;
