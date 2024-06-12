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
      'html, body, #root': {
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0,
      },
      body: {
        bg: mode('brand.100', 'brand.300')(props), // Light mode: brand.100, Dark mode: brand.400
        color: mode('brand.400', 'brand.100')(props), // Light mode: brand.400, Dark mode: brand.100
      },
    }),
  },
  components: {
    Button: {
      baseStyle: (props: GlobalStyleProps) => ({
        bg: mode('brand.200', 'brand.300')(props), // Light mode: brand.200, Dark mode: brand.300
        color: mode('brand.400', 'brand.100')(props), // Light mode: brand.400, Dark mode: brand.100
        _hover: {
          bg: mode('brand.300', 'brand.200')(props), // Light mode: brand.300, Dark mode: brand.200
        },
      }),
    },
  },
});

export default theme;
