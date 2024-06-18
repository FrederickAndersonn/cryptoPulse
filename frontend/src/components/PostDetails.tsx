import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Box,
  Heading,
  Text,
  Flex,
  Stack,
  useColorMode,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';

interface Comment {
  _id: string;
  text: string;
  author: {
    id: string;
    username: string;
  };
  date: string;
}

interface Post {
  _id: string;
  heading: string;
  description: string;
  author: {
    id: string;
    username: string;
  };
  date: string;
  comments: Comment[];
}

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/posts/${id}`);
        setPost(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleAddComment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, please login first.');
      return;
    }

    const decoded: { user: { id: string } } = jwtDecode(token);
    const userId = decoded.user.id;

    try {
      await axios.post(
        'http://localhost:5001/comment/create',
        { text: comment, post: { id } },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            userid: userId,
            postid: id,
          },
        }
      );
      setComment('');
      // Re-fetch post to update comments
      const response = await axios.get(`http://localhost:5001/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (loading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!post) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Text>Post not found</Text>
      </Flex>
    );
  }

  return (
    <Box p={5}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={5}
        boxShadow="md"
        bg={isDark ? 'gray.700' : 'white'}
      >
        <Heading mb={6} textAlign="center" color={isDark ? 'white' : 'black'}>
          {post.heading}
        </Heading>
        <Text mt={4}>{post.description}</Text>
        <Text mt={4} fontSize="sm" color="gray.500">
          By {post.author.username} on {new Date(post.date).toLocaleDateString()}
        </Text>

        <Box mt={10}>
          <Heading size="md" mb={4} color={isDark ? 'white' : 'black'}>
            Comments
          </Heading>
          <Stack spacing={5}>
            {post.comments.map((comment) => (
              <Box
                key={comment._id}
                p={4}
                shadow="md"
                borderWidth="1px"
                borderRadius="md"
                bg={isDark ? 'gray.700' : 'white'}
              >
                <Text>{comment.text}</Text>
                <Text mt={2} fontSize="sm" color="gray.500">
                  By {comment.author.username} on {new Date(comment.date).toLocaleDateString()}
                </Text>
              </Box>
            ))}
          </Stack>

          <Box mt={6}>
            <Heading size="md" mb={4} color={isDark ? 'white' : 'black'}>
              Add a Comment
            </Heading>
            <FormControl>
              <FormLabel color={isDark ? 'white' : 'black'}>Comment</FormLabel>
              <Input
                type="text"
                placeholder="Enter your comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                bg={isDark ? 'gray.800' : 'white'}
                color={isDark ? 'white' : 'black'}
                borderColor={isDark ? 'gray.600' : 'gray.200'}
              />
            </FormControl>
            <Button mt={4} colorScheme="blue" onClick={handleAddComment}>
              Submit
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PostDetails;
