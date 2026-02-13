export const theme = {
  colors: {
    // Primary colors - Champagne/Gold acetinado mais suave e elegante
    primary: '#C9A962',           // Dourado champagne suave (antes: #f4c025)
    primaryLight: '#F5EFE0',      // Champagne claro para backgrounds
    primaryDark: '#9A7B3C',       // Dourado escuro acetinado

    // Background colors - Tons champagne/pergaminho
    backgroundLight: '#FAF7F2',   // Champagne claro texturizado (padronizado)
    backgroundDark: '#1A1814',    // Escuro quente

    // Surface colors
    surfaceLight: '#FFFFFF',
    surfaceDark: '#242018',

    // Text colors
    textMain: '#2D2A24',          // Cinza quente escuro
    textMuted: '#7A7164',         // Cinza quente médio
    roseGrey: '#A69B8C',          // Rosé acinzentado

    // Border colors
    champagneBorder: '#E8E3D9',   // Borda champagne

    // Status colors
    success: '#6B9080',           // Verde suave elegante
    error: '#C17B7B',             // Vermelho rosé suave
    warning: '#D4A574',           // Laranja champagne

    // Accent colors - Rosé bronze para detalhes
    roseBronze: '#B8A090',        // Rosé bronze
    roseLight: '#E8DDD4',         // Rosé claro

    // Dark mode specific
    darkBorder: 'rgba(255, 255, 255, 0.08)',
    darkSurface: '#2A2620',
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fonts: {
    sans: 'System',
    display: 'System',
  },
  shadows: {
    soft: {
      shadowColor: '#C9A962',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 4,
    },
    card: {
      shadowColor: '#2D2A24',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    elevated: {
      shadowColor: '#2D2A24',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};
