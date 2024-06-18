import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    name: string;
  };
  date: string;
}

const Forum: React.FC = () => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const navigate = useNavigate();

  React.useEffect(() => {
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
            onClick={() => navigate(`/post/${post._id}`)} // Navigate to PostDetails
            cursor="pointer"
          >
            <Heading fontSize="xl">{post.heading}</Heading>
            <Text mt={4}>{post.description}</Text>
            <Text mt={4} fontSize="sm" color="gray.500">
              By {post.author.name} on {new Date(post.date).toLocaleDateString()}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default Forum;
