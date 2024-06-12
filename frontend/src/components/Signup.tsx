import React, { useState } from 'react';
import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';
import { signup } from '../actions/auth';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const response = await signup(name, email, password);
      const data = response ? response : { token: '' };
      localStorage.setItem('token', data.token);
      navigate('/coins');
    } catch (error) {
      console.error('Signup failed:', error);
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
          Sign Up
        </Heading>
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
        <FormControl mt="4">
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
          onClick={handleSignup}
        >
          Sign Up
        </Button>
      </Box>
    </Flex>
  );
};

export default Signup;
