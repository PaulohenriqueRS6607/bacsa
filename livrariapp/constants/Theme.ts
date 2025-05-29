// Definição do tema da aplicação
export const Theme = {
  colors: {
    primary: '#493628', // Dark brown
    secondary: '#AB886D', // Medium brown
    tertiary: '#D6C0B3', // Light brown
    background: '#E4E0E1', // Light gray
    white: '#FFFFFF',
    black: '#000000',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    accent: '#FF6B00', // Nova cor accent
    highlight: '#E57C23', // Nova cor highlight
    text: '#212121',
    lightBackground: '#F5F5F5',
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    pill: 50,
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    },
  },
  shadow: {
    light: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    heavy: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};
