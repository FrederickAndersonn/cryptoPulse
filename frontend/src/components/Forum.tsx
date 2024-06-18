import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Flex,
  Stack,
  Spinner,
  Input,
  useColorModeValue,
  Button
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
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [searchWord, setSearchWord] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState<number>(1);
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
  }, [page]);

  const filterPosts = posts.filter((post) =>
    post.heading.toLowerCase().includes(searchWord.toLowerCase())
  );

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handlePostClick = (id: string) => {
    navigate(`/post/${id}`);
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
    <Box width="100%" p={4} bg={bg} minHeight="100vh">
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
        {filterPosts.map((post) => (
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
          </Box>
        ))}
      </Stack>
      <Flex justifyContent="space-between" mt={4}>
        <Button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </Button>
        <Text color={textColor}>Page {page}</Text>
        <Button onClick={handleNextPage}>Next</Button>
      </Flex>
    </Box>
  );
};

export default Forum;
