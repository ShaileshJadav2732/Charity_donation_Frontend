import { createTheme } from '@mui/material/styles';

// Unified Color Palette based on user preferences
export const colors = {
  // Primary teal-green shades (user preferred)
  primary: {
    main: '#2f8077',      // Main teal-green
    light: '#4a9b91',     // Lighter shade
    dark: '#1f5651',      // Darker shade
    contrastText: '#ffffff',
  },
  
  // Secondary teal-green shades
  secondary: {
    main: '#287068',      // Donation form preferred color
    light: '#3d8a7f',     // Lighter shade
    dark: '#1a4d45',      // Darker shade
    contrastText: '#ffffff',
  },
  
  // Accent colors
  accent: {
    main: '#2c7a72',      // Message header preferred color
    light: '#419289',     // Lighter shade
    dark: '#1e5550',      // Darker shade
  },
  
  // Status colors
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
  
  // Neutral colors
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Background colors
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    card: '#ffffff',
    section: '#f8f9fa',
  },
  
  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
    hint: '#9e9e9e',
  },
};

// Typography system
export const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  
  // Heading styles
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    color: colors.text.primary,
  },
  
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    color: colors.text.primary,
  },
  
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
    color: colors.text.primary,
  },
  
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4,
    color: colors.text.primary,
  },
  
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.4,
    color: colors.text.primary,
  },
  
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.4,
    color: colors.text.primary,
  },
  
  // Body text styles
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
    color: colors.text.primary,
  },
  
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
    color: colors.text.secondary,
  },
  
  // Caption and small text
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
    color: colors.text.secondary,
  },
  
  overline: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: colors.text.secondary,
  },
};

// Spacing system (8px base unit)
export const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 48,  // 48px
  xxxl: 64, // 64px
};

// Border radius system
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: '50%',
};

// Shadow system
export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xxl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// Create Material-UI theme
export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrastText,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrastText,
    },
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    grey: colors.grey,
    background: colors.background,
    text: colors.text,
  },
  
  typography: {
    fontFamily: typography.fontFamily,
    h1: typography.h1,
    h2: typography.h2,
    h3: typography.h3,
    h4: typography.h4,
    h5: typography.h5,
    h6: typography.h6,
    body1: typography.body1,
    body2: typography.body2,
    caption: typography.caption,
    overline: typography.overline,
  },
  
  spacing: (factor: number) => spacing.sm * factor,
  
  shape: {
    borderRadius: borderRadius.sm,
  },
  
  shadows: [
    'none',
    shadows.xs,
    shadows.sm,
    shadows.md,
    shadows.lg,
    shadows.xl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
    shadows.xxl,
  ],
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: borderRadius.sm,
          padding: `${spacing.sm}px ${spacing.md}px`,
        },
        contained: {
          boxShadow: shadows.sm,
          '&:hover': {
            boxShadow: shadows.md,
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          boxShadow: shadows.sm,
          '&:hover': {
            boxShadow: shadows.md,
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.sm,
          },
        },
      },
    },
  },
});

export default theme;
