import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import {
  Box,
  Heading,
  Text,
  Flex,
  Stack,
  useColorModeValue,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  Button,
  IconButton,
} from '@chakra-ui/react';

interface Comment {
  _id: string;
  text: string;
  author: {
    id: string;
    username: string;
  };
  date: string;
  likes: number;
}

interface Post {
  _id: string;
  heading: string;
  description: string;
  author: {
    id: string;
    username: string;
    publicKey: string;
  };
  date: string;
  comments: Comment[];
}

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const bg = useColorModeValue('gray.50', 'gray.900');
  const boxBg = useColorModeValue('white', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('black', 'white');
  const formLabelColor = useColorModeValue('black', 'white');
  const navigate = useNavigate();

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

  const handleDonate = () => {
    if (post && post.author.publicKey) {
      navigate('/sendfunds', { state: { destinationAddress: post.author.publicKey } });
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      // Trim the comment to ensure no empty spaces are submitted
      return;
    }

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

  const handleLike = async (commentId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, please login first.');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5001/comment/${commentId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Re-fetch post to update comments
      const response = await axios.get(`http://localhost:5001/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleUnlike = async (commentId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, please login first.');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5001/comment/${commentId}/unlike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Re-fetch post to update comments
      const response = await axios.get(`http://localhost:5001/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to unlike comment:', error);
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
    <Box p={8} bg={bg} minHeight="100vh">
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={5}
        boxShadow="md"
        bg={boxBg}
      >
        <Heading mb={6} textAlign="center" color={textColor}>
          {post.heading}
        </Heading>
        <Text mt={4} color={textColor}>
          {post.description}
        </Text>
        <Text mt={4} fontSize="sm" color="gray.500">
          By {post.author.username} on {new Date(post.date).toLocaleDateString()}
        </Text>
        <Button mt={4} colorScheme="teal" onClick={handleDonate}>
          Donate
        </Button>

        <Box mt={6}>
          <Heading size="md" mb={4} color={textColor}>
            Add a Comment
          </Heading>
          <FormControl>
            <FormLabel color={formLabelColor}>Comment</FormLabel>
            <Input
              type="text"
              placeholder="Enter your comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              bg={inputBg}
              color={textColor}
              borderColor={borderColor}
            />
          </FormControl>
          {comment.trim() && (  // Only show the button if there is non-empty input
            <Flex justifyContent="flex-end">
              <Button mt={4} colorScheme="blue" onClick={handleAddComment}>
                Submit
              </Button>
            </Flex>
          )}
        </Box>

        <Box mt={10}>
          <Heading size="md" mb={4} color={textColor}>
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
                bg={boxBg}
              >
                <Text color={textColor}>{comment.text}</Text>
                <Text mt={2} fontSize="sm" color="gray.500">
                  By {comment.author.username} on {new Date(comment.date).toLocaleDateString()}
                </Text>
                <Flex mt={2} justifyContent="space-between" alignItems="center">
                  <Flex>
                    <IconButton
                      aria-label="Like comment"
                      icon={<FaThumbsUp />}
                      onClick={() => handleLike(comment._id)}
                      size="sm"
                      mr={2}
                    />
                    <IconButton
                      aria-label="Unlike comment"
                      icon={<FaThumbsDown />}
                      onClick={() => handleUnlike(comment._id)}
                      size="sm"
                    />
                  </Flex>
                  <Text color={textColor}>{comment.likes} Likes</Text>
                </Flex>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default PostDetails;
