import React, { useState } from 'react';
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
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { signup } from '../actions/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null); // State for password error
  const [error, setError] = useState<string | null>(null); // State for signup error
  const [isLoading, setIsLoading] = useState(false); // Loading state for signup process
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const handleSignup = async () => {
    if (password.length < 5) {
      setPasswordError('Password must be at least 5 characters long.');
      return;
    }
    setIsLoading(true); // Start loading

    try {
      const response = await signup(name, email, password);
      if (response) {
        navigate('/login'); // Redirect to login page after successful signup
      } else {
        setError('Signup failed. Please check your details and try again.');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      setError('Signup failed. Please try again later.');
    } finally {
      setIsLoading(false); // Stop loading, whether success or failure
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (e.target.value.length >= 5) {
      setPasswordError(null);
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
          Sign Up
        </Heading>
        {error && (
          <Alert status="error" mb="4">
            <AlertIcon />
            {error}
          </Alert>
        )}
        <FormControl>
          <FormLabel color={isDark ? 'white' : 'black'}>Name</FormLabel>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            bg={isDark ? 'gray.800' : 'white'}
            color={isDark ? 'white' : 'black'}
            borderColor={isDark ? 'gray.600' : 'gray.200'}
          />
        </FormControl>
        <FormControl mt="4">
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
            onChange={handlePasswordChange}
            bg={isDark ? 'gray.800' : 'white'}
            color={isDark ? 'white' : 'black'}
            borderColor={isDark ? 'gray.600' : 'gray.200'}
            isInvalid={passwordError !== null} // Highlight input if password is invalid
          />
          {passwordError && (
            <Text mt="2" fontSize="sm" color="red.500">
              {passwordError}
            </Text>
          )}
        </FormControl>
        <Button
          mt="6"
          colorScheme="blue"
          width="full"
          onClick={handleSignup}
          isLoading={isLoading} // Display loading state
          loadingText="Signing up..."
          disabled={isLoading || password.length < 5} // Disable button while loading or if password is invalid
        >
          Sign Up
        </Button>
        <Text mt="4" textAlign="center" color={isDark ? 'white' : 'black'}>
          Already have an account?{' '}
          <ChakraLink as={RouterLink} to="/login" color="blue.500">
            Login here
          </ChakraLink>
        </Text>
      </Box>
    </Flex>
  );
};

export default Signup;
