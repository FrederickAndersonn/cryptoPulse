import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { GlobalStyleProps, mode } from '@chakra-ui/theme-tools';

// Define your custom colors
const customColors = {
  brand: {
    100: '#EEEEEE',
    200: '#D65A31',
    300: '#393E46',
    400: '#222831',
  },
};

// Define your custom fonts
const fonts = {
  heading: 'Space Mono',
  body: 'Space Mono',
};

// Define your theme configuration
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Extend the theme with your custom colors and fonts
const theme = extendTheme({
  config,
  colors: customColors,
  fonts,
  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        bg: mode('brand.100', 'brand.400')(props), // Use brand colors for background
        color: mode('brand.400', 'brand.100')(props), // Use brand colors for text
      },
    }),
  },
});

export default theme;