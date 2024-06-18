import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  Flex,
  Stack,
  useColorMode,
  Spinner,
} from '@chakra-ui/react';

interface Post {
  _id: string;
  heading: string;
  description: string;
  author: {
    id: string;
    username: string;
  };
  date: string;
}

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/posts');
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={5}>
      <Heading mb={6} textAlign="center" color={isDark ? 'white' : 'black'}>
        Forum
      </Heading>
      <Stack spacing={5}>
        {posts.map((post) => (
          <Box
            key={post._id}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            bg={isDark ? 'gray.700' : 'white'}
          >
            <Heading fontSize="xl">{post.heading}</Heading>
            <Text mt={4}>{post.description}</Text>
            <Text mt={4} fontSize="sm" color="gray.500">
              By {post.author.username} on {new Date(post.date).toLocaleDateString()}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default Forum;
