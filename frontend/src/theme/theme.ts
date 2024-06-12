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
        bg: mode('white', 'gray.800')(props),
        color: mode('gray.800', 'whiteAlpha.900')(props),
      },
    }),
  },
});

export default theme;