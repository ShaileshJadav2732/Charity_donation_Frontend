import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Divider } from '@mui/material';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { colors, spacing } from '@/styles/theme';
import { useRouter } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  backButton?: {
    label: string;
    href: string;
  };
  actions?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'detailed';
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  backButton,
  actions,
  children,
  variant = 'default',
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (backButton?.href) {
      router.push(backButton.href);
    } else {
      router.back();
    }
  };

  const renderBreadcrumbs = () => (
    breadcrumbs && breadcrumbs.length > 0 && (
      <Breadcrumbs
        separator={<ChevronRight size={16} color={colors.text.secondary} />}
        sx={{ mb: spacing.sm / 8 }}
      >
        {breadcrumbs.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            underline="hover"
            color={index === breadcrumbs.length - 1 ? colors.text.primary : colors.text.secondary}
            sx={{
              fontSize: '0.875rem',
              fontWeight: index === breadcrumbs.length - 1 ? 500 : 400,
              cursor: item.href ? 'pointer' : 'default',
              '&:hover': item.href ? {
                color: colors.primary.main,
              } : {},
            }}
            onClick={(e) => {
              if (item.href) {
                e.preventDefault();
                router.push(item.href);
              }
            }}
          >
            {item.label}
          </Link>
        ))}
      </Breadcrumbs>
    )
  );

  const renderBackButton = () => (
    backButton && (
      <Box 
        display="flex" 
        alignItems="center" 
        gap={spacing.xs / 8}
        sx={{
          cursor: 'pointer',
          color: colors.primary.main,
          mb: spacing.sm / 8,
          '&:hover': {
            color: colors.primary.dark,
          },
        }}
        onClick={handleBackClick}
      >
        <ArrowLeft size={20} />
        <Typography variant="body2" fontWeight={500}>
          {backButton.label}
        </Typography>
      </Box>
    )
  );

  const renderHeader = () => (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
      <Box flex={1}>
        <Typography 
          variant={variant === 'minimal' ? 'h5' : 'h4'} 
          component="h1"
          sx={{ 
            color: colors.text.primary,
            fontWeight: 700,
            mb: subtitle ? spacing.xs / 8 : 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        
        {subtitle && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: colors.text.secondary,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      
      {actions && (
        <Box ml={spacing.lg / 8} display="flex" gap={spacing.sm / 8}>
          {actions}
        </Box>
      )}
    </Box>
  );

  if (variant === 'minimal') {
    return (
      <Box mb={spacing.lg / 8}>
        {renderBackButton()}
        {renderBreadcrumbs()}
        {renderHeader()}
        {children}
      </Box>
    );
  }

  if (variant === 'detailed') {
    return (
      <Box 
        sx={{
          backgroundColor: colors.background.paper,
          borderRadius: spacing.sm / 8,
          p: spacing.xl / 8,
          mb: spacing.lg / 8,
          border: `1px solid ${colors.grey[200]}`,
        }}
      >
        {renderBackButton()}
        {renderBreadcrumbs()}
        {renderHeader()}
        
        {children && (
          <>
            <Divider sx={{ my: spacing.lg / 8 }} />
            {children}
          </>
        )}
      </Box>
    );
  }

  // Default variant
  return (
    <Box 
      sx={{
        mb: spacing.xl / 8,
        pb: spacing.lg / 8,
        borderBottom: `1px solid ${colors.grey[200]}`,
      }}
    >
      {renderBackButton()}
      {renderBreadcrumbs()}
      {renderHeader()}
      
      {children && (
        <Box mt={spacing.lg / 8}>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
