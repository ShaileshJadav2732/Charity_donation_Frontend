"use client";

import React from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  useTheme, 
  useMediaQuery,
  Container
} from "@mui/material";
import { motion } from "framer-motion";

interface FormContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: number | string;
  elevation?: number;
  showDivider?: boolean;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  title,
  subtitle,
  maxWidth = 600,
  elevation = 3,
  showDivider = true,
  headerContent,
  footerContent,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth={false} sx={{ py: { xs: 2, sm: 4 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <Paper
          elevation={elevation}
          sx={{
            maxWidth,
            mx: 'auto',
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            boxShadow: theme.shadows[elevation],
          }}
        >
          {/* Header */}
          {(title || subtitle || headerContent) && (
            <Box
              sx={{
                p: { xs: 3, sm: 4 },
                pb: showDivider ? { xs: 2, sm: 3 } : { xs: 3, sm: 4 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.main}04 100%)`,
              }}
            >
              {title && (
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: subtitle ? 1 : 0,
                  }}
                >
                  {title}
                </Typography>
              )}
              
              {subtitle && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mb: headerContent ? 2 : 0,
                    lineHeight: 1.6,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
              
              {headerContent}
            </Box>
          )}

          {/* Divider */}
          {showDivider && (title || subtitle || headerContent) && (
            <Divider sx={{ borderColor: 'divider' }} />
          )}

          {/* Content */}
          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              pt: (title || subtitle || headerContent) && showDivider ? { xs: 3, sm: 4 } : 0,
            }}
          >
            {children}
          </Box>

          {/* Footer */}
          {footerContent && (
            <>
              <Divider sx={{ borderColor: 'divider' }} />
              <Box
                sx={{
                  p: { xs: 3, sm: 4 },
                  pt: { xs: 2, sm: 3 },
                  backgroundColor: 'background.default',
                }}
              >
                {footerContent}
              </Box>
            </>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
};

export default FormContainer;
