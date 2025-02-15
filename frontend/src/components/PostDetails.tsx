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
  likedBy: string[];
  dislikedBy: string[];
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
  const token = localStorage.getItem('token');
  const decoded: { user: { id: string } } | null = token ? jwtDecode(token) : null;
  const userId = decoded?.user.id || '';

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`https://cryptopulse-n0ol.onrender.com/posts/${id}`);
        console.log('Fetched post:', response.data); // Log the fetched post
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

    if (!token) {
      console.error('No token found, please login first.');
      return;
    }

    try {
      await axios.post(
        'https://cryptopulse-n0ol.onrender.com/comment/create',
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
      const response = await axios.get(`https://cryptopulse-n0ol.onrender.com/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!token) {
      console.error('No token found, please login first.');
      return;
    }

    try {
      await axios.post(
        `https://cryptopulse-n0ol.onrender.com/comment/${commentId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update the comment likes count locally
      if (post) {
        const updatedComments = post.comments.map(comment => {
          if (comment._id === commentId) {
            const isLiked = comment.likedBy.includes(userId);
            const isDisliked = comment.dislikedBy.includes(userId);

            if (isLiked) {
              return { ...comment, likes: comment.likes - 1, likedBy: comment.likedBy.filter(id => id !== userId) };
            } else {
              if (isDisliked) {
                return { ...comment, likes: comment.likes + 2, likedBy: [...comment.likedBy, userId], dislikedBy: comment.dislikedBy.filter(id => id !== userId) };
              } else {
                return { ...comment, likes: comment.likes + 1, likedBy: [...comment.likedBy, userId] };
              }
            }
          }
          return comment;
        });
        setPost({ ...post, comments: updatedComments });
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleUnlike = async (commentId: string) => {
    if (!token) {
      console.error('No token found, please login first.');
      return;
    }

    try {
      await axios.post(
        `https://cryptopulse-n0ol.onrender.com/comment/${commentId}/unlike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update the comment likes count locally
      if (post) {
        const updatedComments = post.comments.map(comment => {
          if (comment._id === commentId) {
            const isLiked = comment.likedBy.includes(userId);
            const isDisliked = comment.dislikedBy.includes(userId);

            if (isDisliked) {
              return { ...comment, likes: comment.likes + 1, dislikedBy: comment.dislikedBy.filter(id => id !== userId) };
            } else {
              if (isLiked) {
                return { ...comment, likes: comment.likes - 2, likedBy: comment.likedBy.filter(id => id !== userId), dislikedBy: [...comment.dislikedBy, userId] };
              } else {
                return { ...comment, likes: comment.likes - 1, dislikedBy: [...comment.dislikedBy, userId] };
              }
            }
          }
          return comment;
        });
        setPost({ ...post, comments: updatedComments });
      }
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

  post.comments.sort((a, b) => b.likes - a.likes);

  return (
    <Box p={8} bg={bg} minHeight="100vh" data-testid="post-details-page">
    <Box borderWidth="1px" borderRadius="lg" p={5} boxShadow="md" bg={boxBg}>
      <Heading mb={6} textAlign="center" color={textColor} data-testid="post-heading">
        {post.heading}
      </Heading>
      <Text mt={4} color={textColor} data-testid="post-description">
        {post.description}
      </Text>
      <Text mt={4} fontSize="sm" color="gray.500" data-testid="post-author">
        By {post.author.username} on {new Date(post.date).toLocaleDateString()}
      </Text>
      <Flex mt={4} justifyContent="space-between" alignItems="center">
        <Button colorScheme="teal" onClick={handleDonate} data-testid="donate-button">
          Donate
        </Button>
      </Flex>

      <Box mt={6} data-testid="add-comment-section">
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
            data-testid="comment-input"
          />
        </FormControl>
        {comment.trim() && (
          <Flex justifyContent="flex-end">
            <Button mt={4} colorScheme="blue" onClick={handleAddComment} data-testid="submit-comment-button">
              Submit
            </Button>
          </Flex>
        )}
      </Box>

      <Box mt={10} data-testid="comments-section">
        <Heading size="md" mb={4} color={textColor}>
          Comments
        </Heading>
        <Stack spacing={5}>
          {post.comments.map(comment => (
            <Box key={comment._id} p={4} shadow="md" borderWidth="1px" borderRadius="md" bg={boxBg} data-testid={`comment-${comment._id}`}>
              <Text color={textColor} data-testid={`comment-text-${comment._id}`}>{comment.text}</Text>
              <Text mt={2} fontSize="sm" color="gray.500" data-testid={`comment-author-${comment._id}`}>
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
                    colorScheme={comment.likedBy.includes(userId) ? 'green' : undefined}
                    data-testid={`like-button-${comment._id}`}
                  />
                  <IconButton
                    aria-label="Unlike comment"
                    icon={<FaThumbsDown />}
                    onClick={() => handleUnlike(comment._id)}
                    size="sm"
                    colorScheme={comment.dislikedBy.includes(userId) ? 'red' : undefined}
                    data-testid={`unlike-button-${comment._id}`}
                  />
                </Flex>
                <Text color={textColor} data-testid={`comment-likes-${comment._id}`}>{comment.likes} Likes</Text>
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
