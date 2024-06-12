// theme.ts
import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// Define your custom colors
const customColors = {
  brand: {
    100: '#EEEEEE',
    200: '#D65A31',
    300: '#393E46',
    400: '#222831',
  },
};

// Define your theme configuration
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Extend the theme with your custom colors
const theme = extendTheme({
  config,
  colors: customColors,
});

export default theme;
