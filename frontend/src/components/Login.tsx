import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { login } from '../actions/auth';
import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Link as ChakraLink,
  useColorMode,
  useToast,
} from '@chakra-ui/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  useEffect(() => {
    // Check if token is present in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/coins'); // Redirect to dashboard if user is already logged in
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      if (!response || !response.token) {
        throw new Error('Invalid credentials'); // Throw error if login failed
      }
      // Perform page refresh
      window.location.reload();
    } catch (error : any) {
      console.error('Login failed:', error.message);
      toast({
        title: 'Login Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center" bg={isDark ? 'gray.900' : 'gray.50'}>
      <Box
        minW="sm"
        maxW="xl"
        borderWidth="1px"
        borderRadius="lg"
        p="8"
        boxShadow="md"
        bg={isDark ? 'gray.700' : 'white'}
      >
        <Heading as="h2" mb="6" textAlign="center" color={isDark ? 'white' : 'black'}>
          Login
        </Heading>
        <FormControl>
          <FormLabel color={isDark ? 'white' : 'black'}>Email address</FormLabel>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            bg={isDark ? 'gray.800' : 'white'}
            color={isDark ? 'white' : 'black'}
            borderColor={isDark ? 'gray.600' : 'gray.200'}
          />
        </FormControl>
        <FormControl mt="4">
          <FormLabel color={isDark ? 'white' : 'black'}>Password</FormLabel>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            bg={isDark ? 'gray.800' : 'white'}
            color={isDark ? 'white' : 'black'}
            borderColor={isDark ? 'gray.600' : 'gray.200'}
          />
        </FormControl>
        <Button
          mt="6"
          colorScheme="blue"
          width="full"
          onClick={handleLogin}
        >
          Login
        </Button>
        <Text mt="4" textAlign="center" color={isDark ? 'white' : 'black'}>
          Don't have an account?{' '}
          <ChakraLink as={RouterLink} to="/signup" color="blue.500">
            Sign up here
          </ChakraLink>
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
