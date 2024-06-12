import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../actions/auth';
import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      const data = response ? response : { token: '' };
      localStorage.setItem('token', data.token);
      navigate('/coins'); // Redirect to dashboard after successful login
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Box
        maxW="md"
        borderWidth="1px"
        borderRadius="lg"
        p="8"
        boxShadow="md"
        bg="white"
      >
        <Heading as="h2" mb="6" textAlign="center">
          Login
        </Heading>
        <FormControl>
          <FormLabel>Email address</FormLabel>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl mt="4">
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
      </Box>
    </Flex>
  );
};

export default Login;
