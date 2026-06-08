export const theme = {
  colors: {
    primary: '#0C60B5',        // Sidebar blue
    primaryLight: '#E8F1FC',   // Light active blue
    headerBg: '#000000',       // Dark top header
    bg: '#F4F5F7',             // Canvas beige/grey background
    cardBg: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    white: '#FFFFFF',
    
    // Status colors
    maintenance: '#E2B93B',    // Amber
    repair: '#D9534F',         // Red
    inspection: '#4CAF50',     // Green
    all: '#3F51B5',            // Indigo
    
    // Shadow
    shadow: '#94A3B8',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    round: 9999,
  },
  typography: {
    h1: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: '#1E293B',
    },
    h2: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: '#1E293B',
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#1E293B',
    },
    subtext: {
      fontSize: 12,
      fontWeight: '400' as const,
      color: '#64748B',
    },
    button: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: '#FFFFFF',
    },
  },
};
