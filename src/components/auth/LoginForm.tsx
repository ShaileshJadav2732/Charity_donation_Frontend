"use client";

import FormButton from "@/components/ui/FormButton";
import FormContainer from "@/components/ui/FormContainer";
import FormInput from "@/components/ui/FormInput";
import { useAuth } from "@/hooks/useAuth";
import { LoginFormData, parseError } from "@/types";
import {
	ArrowForward as ArrowForwardIcon,
	Email as EmailIcon,
	Lock as LockIcon,
} from "@mui/icons-material";
import {
	Box,
	Checkbox,
	Divider,
	FormControlLabel,
	Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

const LoginForm = () => {
	const { loginWithEmail, loginWithGoogle, isInitialized } = useAuth();

	const [formData, setFormData] = useState<LoginFormData>({
		email: "",
		password: "",
	});

	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [emailLoading, setEmailLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const emailInputRef = useRef<HTMLInputElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateForm()) return;

		try {
			setEmailLoading(true);
			await loginWithEmail(formData);
			toast.success("Welcome back!");
		} catch (error: unknown) {
			const parsedError = parseError(error);
			toast.error(parsedError.message || "Failed to log in");
		} finally {
			setEmailLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		try {
			setGoogleLoading(true);
			toast.loading("Signing in with Google...", { id: "google-login" });

			const popupBlocked = window.innerWidth < 1 || window.innerHeight < 1;
			if (popupBlocked) {
				toast.dismiss("google-login");
				toast.error("Please allow popups for this site to use Google login");
				return;
			}

			await loginWithGoogle();

			toast.dismiss("google-login");
			toast.success("Logged in with Google!");
		} catch (error: unknown) {
			toast.dismiss("google-login");
			const parsedError = parseError(error);

			if (parsedError.message?.includes("popup")) {
				toast.error("Google login popup was blocked. Please allow popups.");
			} else if (parsedError.message?.includes("network")) {
				toast.error("Check your internet connection and try again.");
			} else if (parsedError.message?.includes("cancelled")) {
				toast.error("Google login was cancelled.");
			} else {
				toast.error(parsedError.message || "Failed to log in with Google");
			}
		} finally {
			setGoogleLoading(false);
		}
	};

	if (!isInitialized) {
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
					noValidate // Prevents browser validation from interfering with styling
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
						fullWidth
						inputRef={emailInputRef}
					/>

					{/* Password Field */}
					<Box>
						<FormInput
							name="password"
							type={"password"}
							label="Password"
							value={formData.password}
							onChange={handleChange}
							error={Boolean(errors.password)}
							helperText={errors.password}
							icon={<LockIcon />}
							placeholder="••••••••"
							autoComplete="current-password"
							fullWidth
						/>
					</Box>

					{/* Remember Me */}
					<FormControlLabel
						control={
							<Checkbox
								id="remember-me"
								name="remember-me"
								color="primary"
								sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}
							/>
						}
						label={
							<Typography variant="body2" color="text.secondary">
								Remember me
							</Typography>
						}
						sx={{ alignSelf: "flex-start" }}
					/>

					{/* Submit Button */}
					<FormButton
						type="submit"
						variant="primary"
						loading={emailLoading}
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
					loading={googleLoading}
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
