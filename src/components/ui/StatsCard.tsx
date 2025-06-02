import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { colors, spacing } from '@/styles/theme';
import StandardCard from './StandardCard';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label?: string;
    period?: string;
  };
  variant?: 'default' | 'compact' | 'detailed';
  format?: 'number' | 'currency' | 'percentage' | 'text';
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = colors.primary.main,
  trend,
  variant = 'default',
  format = 'number',
  onClick,
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      
      case 'percentage':
        return `${val.toFixed(1)}%`;
      
      case 'number':
        return new Intl.NumberFormat('en-IN').format(val);
      
      default:
        return val.toString();
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) return <TrendingUp size={16} />;
    if (trend.value < 0) return <TrendingDown size={16} />;
    return <Minus size={16} />;
  };

  const getTrendColor = () => {
    if (!trend) return colors.text.secondary;
    
    if (trend.value > 0) return colors.success.main;
    if (trend.value < 0) return colors.error.main;
    return colors.text.secondary;
  };

  const renderIcon = () => (
    Icon && (
      <Avatar
        sx={{
          backgroundColor: iconColor + '20',
          color: iconColor,
          width: variant === 'compact' ? 40 : 48,
          height: variant === 'compact' ? 40 : 48,
        }}
      >
        <Icon size={variant === 'compact' ? 20 : 24} />
      </Avatar>
    )
  );

  const renderValue = () => (
    <Box>
      <Typography 
        variant={variant === 'compact' ? 'h5' : 'h4'} 
        component="div"
        sx={{ 
          color: colors.text.primary,
          fontWeight: 700,
          lineHeight: 1.2,
          mb: spacing.xs / 8,
        }}
      >
        {formatValue(value)}
      </Typography>
      
      <Typography 
        variant={variant === 'compact' ? 'body2' : 'body1'} 
        sx={{ 
          color: colors.text.secondary,
          fontWeight: 500,
          mb: subtitle ? spacing.xs / 8 : 0,
        }}
      >
        {title}
      </Typography>
      
      {subtitle && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: colors.text.secondary,
            display: 'block',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );

  const renderTrend = () => (
    trend && (
      <Box 
        display="flex" 
        alignItems="center" 
        gap={spacing.xs / 8}
        sx={{
          color: getTrendColor(),
          mt: spacing.sm / 8,
        }}
      >
        {getTrendIcon()}
        <Typography 
          variant="caption" 
          fontWeight={500}
          sx={{ color: getTrendColor() }}
        >
          {Math.abs(trend.value).toFixed(1)}%
          {trend.label && ` ${trend.label}`}
          {trend.period && ` ${trend.period}`}
        </Typography>
      </Box>
    )
  );

  if (variant === 'compact') {
    return (
      <StandardCard
        variant="outlined"
        size="small"
        hover={!!onClick}
        onClick={onClick}
      >
        <Box display="flex" alignItems="center" gap={spacing.md / 8}>
          {renderIcon()}
          <Box flex={1}>
            {renderValue()}
            {renderTrend()}
          </Box>
        </Box>
      </StandardCard>
    );
  }

  // Default variant
  return (
    <StandardCard
      variant="outlined"
      hover={!!onClick}
      onClick={onClick}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1}>
          {renderValue()}
          {renderTrend()}
        </Box>
        {renderIcon()}
      </Box>
    </StandardCard>
  );
};

export default StatsCard;
