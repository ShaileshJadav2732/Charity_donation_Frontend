import React from 'react';
import { Box, Card, CardContent, Typography, SxProps, Theme } from '@mui/material';
import { colors, spacing, borderRadius, shadows } from '@/styles/theme';

interface StandardCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
  onClick?: () => void;
  hover?: boolean;
}

const StandardCard: React.FC<StandardCardProps> = ({
  title,
  subtitle,
  children,
  action,
  variant = 'default',
  size = 'medium',
  sx,
  onClick,
  hover = false,
}) => {
  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: borderRadius.md,
      transition: 'all 0.2s ease-in-out',
      cursor: onClick ? 'pointer' : 'default',
    };

    const sizeStyles = {
      small: { padding: spacing.md },
      medium: { padding: spacing.lg },
      large: { padding: spacing.xl },
    };

    const variantStyles = {
      default: {
        boxShadow: shadows.sm,
        '&:hover': hover ? { boxShadow: shadows.md, transform: 'translateY(-2px)' } : {},
      },
      elevated: {
        boxShadow: shadows.md,
        '&:hover': hover ? { boxShadow: shadows.lg, transform: 'translateY(-2px)' } : {},
      },
      outlined: {
        border: `1px solid ${colors.grey[200]}`,
        boxShadow: 'none',
        '&:hover': hover ? { 
          borderColor: colors.primary.main, 
          boxShadow: shadows.sm,
          transform: 'translateY(-1px)' 
        } : {},
      },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };
  };

  return (
    <Card sx={{ ...getCardStyles(), ...sx }} onClick={onClick}>
      <CardContent sx={{ padding: 0, '&:last-child': { paddingBottom: 0 } }}>
        {(title || subtitle || action) && (
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="flex-start" 
            mb={children ? spacing.md / 8 : 0}
          >
            <Box>
              {title && (
                <Typography 
                  variant="h6" 
                  component="h3"
                  sx={{ 
                    color: colors.text.primary,
                    fontWeight: 600,
                    mb: subtitle ? spacing.xs / 8 : 0,
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colors.text.secondary,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            {action && (
              <Box ml={spacing.md / 8}>
                {action}
              </Box>
            )}
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default StandardCard;
