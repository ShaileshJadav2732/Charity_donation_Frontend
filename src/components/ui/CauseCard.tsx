import React from 'react';
import { Box, Typography, LinearProgress, Chip, Avatar } from '@mui/material';
import { MapPin, Target, Heart } from 'lucide-react';
import { colors, spacing } from '@/styles/theme';
import StandardCard from './StandardCard';

interface CauseCardData {
  id: string;
  title: string;
  description: string;
  targetAmount?: number;
  raisedAmount?: number;
  imageUrl?: string;
  organizationName?: string;
  location?: string;
  tags?: string[];
  acceptanceType?: 'money' | 'items' | 'both';
  acceptedDonationTypes?: string[];
  donationItems?: any[];
  status: 'active' | 'completed' | 'paused';
}

interface CauseCardProps {
  cause: CauseCardData;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
  showOrganization?: boolean;
  showTags?: boolean;
  showLocation?: boolean;
  actions?: React.ReactNode;
  onClick?: () => void;
}

const CauseCard: React.FC<CauseCardProps> = ({
  cause,
  variant = 'default',
  showProgress = true,
  showOrganization = true,
  showTags = true,
  showLocation = false,
  actions,
  onClick,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgress = () => {
    if (!cause.targetAmount || !cause.raisedAmount) return 0;
    return Math.min(100, (cause.raisedAmount / cause.targetAmount) * 100);
  };

  const getUrgencyLevel = () => {
    const progress = getProgress();
    if (progress < 30) return { level: 'High', color: colors.error.main };
    if (progress < 70) return { level: 'Medium', color: colors.warning.main };
    return { level: 'Low', color: colors.success.main };
  };

  const renderImage = () => {
    const urgency = getUrgencyLevel();
    
    return (
      <Box
        sx={{
          height: variant === 'compact' ? 120 : 180,
          position: 'relative',
          borderRadius: spacing.sm / 8,
          overflow: 'hidden',
          mb: spacing.md / 8,
        }}
      >
        {cause.imageUrl ? (
          <Box
            component="img"
            src={cause.imageUrl}
            alt={cause.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              background: `linear-gradient(45deg, ${urgency.color}20, ${urgency.color}40)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target size={48} color={urgency.color} />
          </Box>
        )}
        
        <Chip
          label={`${urgency.level} Priority`}
          size="small"
          sx={{
            position: 'absolute',
            top: spacing.sm / 8,
            right: spacing.sm / 8,
            backgroundColor: urgency.color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      </Box>
    );
  };

  const renderContent = () => (
    <Box>
      {/* Organization */}
      {showOrganization && cause.organizationName && (
        <Typography
          variant="body2"
          sx={{
            color: colors.text.secondary,
            fontWeight: 500,
            mb: spacing.xs / 8,
          }}
        >
          {cause.organizationName}
        </Typography>
      )}

      {/* Title */}
      <Typography
        variant={variant === 'compact' ? 'body1' : 'h6'}
        sx={{
          fontWeight: 600,
          color: colors.text.primary,
          mb: spacing.sm / 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {cause.title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          color: colors.text.secondary,
          mb: spacing.md / 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: variant === 'compact' ? 2 : 3,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.5,
        }}
      >
        {cause.description}
      </Typography>

      {/* Location */}
      {showLocation && cause.location && (
        <Box display="flex" alignItems="center" gap={spacing.xs / 8} mb={spacing.sm / 8}>
          <MapPin size={16} color={colors.text.secondary} />
          <Typography variant="caption" color={colors.text.secondary}>
            {cause.location}
          </Typography>
        </Box>
      )}

      {/* Progress */}
      {showProgress && cause.targetAmount && (
        <Box mb={spacing.md / 8}>
          <Box display="flex" justifyContent="space-between" mb={spacing.xs / 8}>
            <Typography variant="body2" color={colors.text.secondary}>
              Progress ({Math.round(getProgress())}%)
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(cause.raisedAmount || 0)} / {formatCurrency(cause.targetAmount)}
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={getProgress()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: getUrgencyLevel().color,
                borderRadius: 4,
              },
            }}
          />
        </Box>
      )}

      {/* Tags */}
      {showTags && cause.tags && cause.tags.length > 0 && (
        <Box display="flex" gap={spacing.xs / 8} flexWrap="wrap" mb={spacing.md / 8}>
          {cause.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                backgroundColor: colors.primary.main + '20',
                color: colors.primary.main,
                fontSize: '0.75rem',
                height: 24,
                fontWeight: 500,
              }}
            />
          ))}
          {cause.tags.length > 3 && (
            <Chip
              label={`+${cause.tags.length - 3} more`}
              size="small"
              sx={{
                backgroundColor: colors.grey[200],
                color: colors.text.secondary,
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          )}
        </Box>
      )}

      {/* Actions */}
      {actions && (
        <Box mt={spacing.md / 8}>
          {actions}
        </Box>
      )}
    </Box>
  );

  return (
    <StandardCard
      variant="outlined"
      hover={!!onClick}
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {variant !== 'compact' && renderImage()}
      {renderContent()}
    </StandardCard>
  );
};

export default CauseCard;
