import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import {
  Box,
  Heading,
  Text,
  Flex,
  Stack,
  Spinner,
  Input,
  useColorModeValue,
  Button,
  IconButton,
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
  votes: number;
  votedBy: { userId: string; vote: number }[];
}

const Forum: React.FC = () => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [searchWord, setSearchWord] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState<number>(1);
  const [votedPosts, setVotedPosts] = React.useState<{ [key: string]: number }>({});
  const postsPerPage = 10;
  const navigate = useNavigate();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const boxBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('black', 'white');

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

  const filterPosts = posts.filter((post) =>
    post.heading.toLowerCase().includes(searchWord.toLowerCase())
  );

  const displayedPosts = filterPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  const handleNextPage = () => {
    if (page * postsPerPage < filterPosts.length) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handlePostClick = (id: string) => {
    navigate(`/post/${id}`);
  };

  const handleVote = async (postId: string, vote: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, please login first.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5001/posts/${postId}/vote`,
        { vote },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update the post votes locally
      const updatedPost = response.data;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id ? updatedPost : post
        )
      );

      // Handle vote toggling
      setVotedPosts((prevVotedPosts) => {
        const currentVote = prevVotedPosts[postId];
        const newVote = currentVote === vote ? 0 : vote;
        return {
          ...prevVotedPosts,
          [postId]: newVote,
        };
      });
    } catch (error) {
      console.error('Failed to vote on post:', error);
    }
  };

  const truncateDescription = (description: string): string => {
    const words = description.split(' ');
    if (words.length > 30) {
      return words.slice(0, 30).join(' ') + ' ...';
    }
    return description;
  };

  if (loading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box width="100%" p={8} bg={bg} minHeight="100vh">
      <Heading as="h1" mb={4} textAlign="center" color={textColor}>
        Forum
      </Heading>
      <Box mb={4}>
        <Input
          placeholder="Search posts..."
          onChange={(event) => setSearchWord(event.target.value)}
          size="lg"
          width="100%"
          bg={boxBg}
          color={textColor}
        />
      </Box>
      <Stack spacing={4}>
        {displayedPosts.map((post) => (
          <Box
            key={post._id}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={boxBg}
            _hover={{ bg: hoverBg }}
            cursor="pointer"
            onClick={() => handlePostClick(post._id)}
          >
            <Heading fontSize="xl" color={textColor}>
              {post.heading}
            </Heading>
            <Text mt={4} color={textColor}>
              {truncateDescription(post.description)}
            </Text>
            <Text mt={4} fontSize="sm" color="gray.500">
              By {post.author.username} on {new Date(post.date).toLocaleDateString()}
            </Text>
            <Flex mt={2} justifyContent="space-between" alignItems="center">
              <Text fontSize="sm" color={textColor}>
                {post.votes} Votes
              </Text>
              <Flex>
                <IconButton
                  aria-label="Upvote post"
                  icon={<FaArrowUp />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post._id, 1);
                  }}
                  size="sm"
                  mr={2}
                  bg={votedPosts[post._id] === 1 ? 'teal.500' : undefined}
                  _hover={{ bg: 'teal.400' }}
                />
                <IconButton
                  aria-label="Downvote post"
                  icon={<FaArrowDown />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post._id, -1);
                  }}
                  size="sm"
                  bg={votedPosts[post._id] === -1 ? 'red.500' : undefined}
                  _hover={{ bg: 'red.400' }}
                />
              </Flex>
            </Flex>
          </Box>
        ))}
      </Stack>
      <Flex justifyContent="space-between" mt={4}>
        <Button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </Button>
        <Text color={textColor}>Page {page}</Text>
        <Button
          onClick={handleNextPage}
          disabled={page * postsPerPage >= filterPosts.length}
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default Forum;
