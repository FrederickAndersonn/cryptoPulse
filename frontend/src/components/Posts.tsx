import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Textarea,
  useColorMode,
} from '@chakra-ui/react';

interface DecodedToken {
  user: {
    id: string;
  };
}

const CreatePost: React.FC = () => {
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState({ id: '', username: '' });
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      const userId = decoded.user.id;
      setAuthor((prevState) => ({ ...prevState, id: userId }));

      axios.get(`http://localhost:5001/register/user/${userId}`)
        .then(response => {
          setAuthor({ id: userId, username: response.data.name });
        })
        .catch(error => {
          console.error('Failed to fetch user details:', error);
        });
    }
  }, []);

  const handleCreatePost = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, please login first.');
      return;
    }

    const newPost = {
      heading,
      description,
      date: new Date(),
      author: {
        id: author.id,
        username: author.username,
      },
    };

    try {
      await axios.post('http://localhost:5001/posts', newPost, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/posts'); // Redirect to posts list after successful creation
    } catch (error) {
      console.error('Failed to create post:', error);
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
          Create Post
        </Heading>
        <FormControl>
          <FormLabel color={isDark ? 'white' : 'black'}>Heading</FormLabel>
          <Input
            type="text"
            placeholder="Enter post heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            bg={isDark ? 'gray.800' : 'white'}
            color={isDark ? 'white' : 'black'}
            borderColor={isDark ? 'gray.600' : 'gray.200'}
          />
        </FormControl>
        <FormControl mt="4">
          <FormLabel color={isDark ? 'white' : 'black'}>Description</FormLabel>
          <Textarea
            placeholder="Enter post description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            bg={isDark ? 'gray.800' : 'brand.100'}
            color={isDark ? 'white' : 'black'}
            borderColor={isDark ? 'gray.600' : 'gray.200'}
          />
        </FormControl>
        <Button
          mt="6"
          colorScheme="blue"
          width="full"
          onClick={handleCreatePost}
        >
          Create Post
        </Button>
      </Box>
    </Flex>
  );
};

export default CreatePost;
