"use client";

import { Box, TextField, TextFieldProps } from "@mui/material";
import { motion } from "framer-motion";
import React, { forwardRef } from "react";

interface FormInputProps extends Omit<TextFieldProps, "variant"> {
	icon?: React.ReactNode;
	description?: string;
	showCharCount?: boolean;
	maxLength?: number;
	variant?: "outlined" | "filled" | "standard";
}

const FormInput = forwardRef<HTMLDivElement, FormInputProps>(
	(
		{
			icon,
			description,
			showCharCount = false,
			maxLength,
			variant = "outlined",
			error,
			helperText,
			value,
			...props
		},
		ref
	) => {
		const currentLength = typeof value === "string" ? value.length : 0;
		const hasError = Boolean(error);

		return (
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Box sx={{ position: "relative", width: "100%" }}>
					<TextField
						ref={ref}
						variant={variant}
						error={hasError}
						value={value}
						{...props}
						sx={{
							width: "100%",
							"& .MuiOutlinedInput-root": {
								borderRadius: 2,
								backgroundColor: "background.paper",
								transition: "all 0.2s ease-in-out",
								"&:hover": {
									backgroundColor: "action.hover",
								},
								"&.Mui-focused": {
									backgroundColor: "background.paper",
									"& .MuiOutlinedInput-notchedOutline": {
										borderWidth: 2,
										borderColor: "primary.main",
									},
								},
								"&.Mui-error": {
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "error.main",
									},
								},
							},
							"& .MuiInputLabel-root": {
								fontWeight: 500,
								"&.Mui-focused": {
									color: "primary.main",
								},
								"&.Mui-error": {
									color: "error.main",
								},
							},
							"& .MuiFormHelperText-root": {
								marginLeft: 0,
								marginTop: 1,
								fontSize: "0.875rem",
								"&.Mui-error": {
									color: "error.main",
								},
							},
							...(icon && {
								"& .MuiOutlinedInput-root": {
									paddingLeft: 0,
								},
							}),
							...props.sx,
						}}
						InputProps={{
							...(icon && {
								startAdornment: (
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											width: 48,
											height: "100%",
											color: hasError ? "error.main" : "text.secondary",
											transition: "color 0.2s ease-in-out",
										}}
									>
										{icon}
									</Box>
								),
							}),
							...props.InputProps,
						}}
						helperText={
							hasError && helperText
								? helperText
								: description && !hasError
								? description
								: showCharCount && maxLength
								? `${currentLength}/${maxLength}`
								: undefined
						}
					/>
				</Box>
			</motion.div>
		);
	}
);

FormInput.displayName = "FormInput";

export default FormInput;
