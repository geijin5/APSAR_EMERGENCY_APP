import {DefaultTheme} from 'react-native-paper';

export const colors = {
  // Emergency colors
  primary: '#D32F2F', // Emergency red
  secondary: '#FF6F00', // Warning orange
  accent: '#424242', // Dark gray
  background: '#FAFAFA', // Light background
  surface: '#FFFFFF', // White surface
  text: '#212121', // Dark text
  textSecondary: '#757575', // Secondary text
  error: '#F44336', // Error red
  warning: '#FF9800', // Warning orange
  success: '#4CAF50', // Success green
  info: '#2196F3', // Info blue
  
  // Map overlay colors
  restricted: '#D32F2F', // Red for restricted zones
  caution: '#FFC107', // Yellow for caution zones
  clear: '#4CAF50', // Green for clear zones
  searchZone: '#9C27B0', // Purple for search zones
  detour: '#FF9800', // Orange for detours
  
  // Status colors
  active: '#4CAF50',
  inactive: '#9E9E9E',
  pending: '#FF9800',
  
  // Background variations
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  darkGray: '#424242',
  
  // Transparency
  overlay: 'rgba(0, 0, 0, 0.5)',
  lightOverlay: 'rgba(0, 0, 0, 0.2)',
};

export const typography = {
  // Headers
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  
  // Emergency specific
  emergencyText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    lineHeight: 24,
    color: colors.primary,
  },
  alertText: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    error: colors.error,
  },
  roundness: borderRadius.md,
};

// Add shadows to the colors object for backward compatibility
export const colorsWithShadows = {
  ...colors,
  shadows,
};
