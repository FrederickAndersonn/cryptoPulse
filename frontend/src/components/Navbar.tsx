import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Flex, Link, IconButton, useColorMode } from '@chakra-ui/react';
import { FaMoon, FaSun, FaHome, FaCoins } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box bg={isDark ? 'gray.800' : 'teal.500'} color="white" px={4} py={2} width="100%">
      <Flex justify="space-between" align="center" maxWidth="1200px" mx="auto">
        <Flex align="center">
          <IconButton
            as={RouterLink}
            to="/"
            icon={<FaHome />}
            aria-label="Home"
            mr={4}
            bg="transparent"
            _hover={{ bg: 'teal.600' }}
          />
          <Link as={RouterLink} to="/" fontSize="lg" mr={4} _hover={{ textDecoration: 'none' }}>
            Home
          </Link>
          <IconButton
            as={RouterLink}
            to="/coins"
            icon={<FaCoins />}
            aria-label="Coins"
            mr={4}
            bg="transparent"
            _hover={{ bg: 'teal.600' }}
          />
          <Link as={RouterLink} to="/coins" fontSize="lg" _hover={{ textDecoration: 'none' }}>
            Coins
          </Link>
        </Flex>
        <IconButton
          icon={isDark ? <FaSun /> : <FaMoon />}
          aria-label="Toggle Dark Mode"
          onClick={toggleColorMode}
          bg="transparent"
          _hover={{ bg: 'teal.600' }}
        />
      </Flex>
    </Box>
  );
};

export default Navbar;
