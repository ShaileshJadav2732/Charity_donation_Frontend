"use client";

import React from "react";
import { 
  Button, 
  ButtonProps, 
  CircularProgress, 
  Box,
  useTheme
} from "@mui/material";
import { motion } from "framer-motion";

interface FormButtonProps extends Omit<ButtonProps, 'variant'> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
  fullWidth?: boolean;
}

const FormButton: React.FC<FormButtonProps> = ({
  children,
  loading = false,
  loadingText = "Loading...",
  icon,
  variant = 'primary',
  fullWidth = false,
  disabled,
  sx,
  ...props
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          variant: 'contained' as const,
          color: 'primary' as const,
          sx: {
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: `0 6px 16px ${theme.palette.primary.main}60`,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
        };
      case 'secondary':
        return {
          variant: 'contained' as const,
          color: 'secondary' as const,
          sx: {
            boxShadow: `0 4px 12px ${theme.palette.secondary.main}40`,
            '&:hover': {
              boxShadow: `0 6px 16px ${theme.palette.secondary.main}60`,
              transform: 'translateY(-1px)',
            },
          },
        };
      case 'outlined':
        return {
          variant: 'outlined' as const,
          sx: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
            },
          },
        };
      case 'danger':
        return {
          variant: 'contained' as const,
          color: 'error' as const,
          sx: {
            boxShadow: `0 4px 12px ${theme.palette.error.main}40`,
            '&:hover': {
              boxShadow: `0 6px 16px ${theme.palette.error.main}60`,
              transform: 'translateY(-1px)',
            },
          },
        };
      case 'text':
      default:
        return {
          variant: 'text' as const,
          sx: {
            '&:hover': {
              backgroundColor: `${theme.palette.primary.main}08`,
            },
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      style={{ width: fullWidth ? '100%' : 'auto' }}
    >
      <Button
        {...props}
        variant={variantStyles.variant}
        color={variantStyles.color}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        sx={{
          py: 1.5,
          px: 3,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '1rem',
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          position: 'relative',
          minHeight: 48,
          ...variantStyles.sx,
          ...sx,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress
              size={20}
              sx={{
                color: variant === 'outlined' || variant === 'text' 
                  ? 'primary.main' 
                  : 'inherit',
              }}
            />
            {loadingText}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            {children}
          </Box>
        )}
      </Button>
    </motion.div>
  );
};

export default FormButton;
