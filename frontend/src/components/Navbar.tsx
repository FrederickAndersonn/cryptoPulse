import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Flex, Link, IconButton, useColorMode, Spacer } from '@chakra-ui/react';
import { FaMoon, FaSun, FaHome, FaCoins } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box bg={isDark ? 'gray.800' : 'brand.300'} color="white" px={4} py={2} width="100%">
      <Flex justify="space-between" align="center" maxWidth="1200px" mx="auto">
        <Flex align="center">
          <Link as={RouterLink} to="/" display="flex" alignItems="center" mr={4} _hover={{ textDecoration: 'none', bg: 'teal.600', borderRadius: 'md' }} p={2}>
            <IconButton
              icon={<FaHome />}
              aria-label="Home"
              bg="transparent"
              _hover={{ bg: 'transparent' }}
              isRound
              size="sm"
              pointerEvents="none"
            />
            <Box as="span" ml={2} fontSize="lg">Home</Box>
          </Link>
          <Link as={RouterLink} to="/coins" display="flex" alignItems="center" _hover={{ textDecoration: 'none', bg: 'teal.600', borderRadius: 'md' }} p={2}>
            <IconButton
              icon={<FaCoins />}
              aria-label="Coins"
              bg="transparent"
              _hover={{ bg: 'transparent' }}
              isRound
              size="sm"
              pointerEvents="none"
            />
            <Box as="span" ml={2} fontSize="lg">Coins</Box>
          </Link>
        </Flex>
        <Flex align="center">
          <Spacer />
          <Link as={RouterLink} to="/login" color="white" mr={4} _hover={{ textDecoration: 'none', bg: 'teal.600', borderRadius: 'md' }} p={2}>
            Login
          </Link>
          <Link as={RouterLink} to="/signup" color="white" _hover={{ textDecoration: 'none', bg: 'teal.600', borderRadius: 'md' }} p={2}>
            Sign Up
          </Link>
          <IconButton
            icon={isDark ? <FaSun /> : <FaMoon />}
            aria-label="Toggle Dark Mode"
            onClick={toggleColorMode}
            bg="transparent"
            _hover={{ bg: 'teal.600' }}
            ml={4}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
