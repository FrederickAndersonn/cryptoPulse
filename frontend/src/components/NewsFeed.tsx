import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { NewsData, fetchAllNewsData } from '../data/newsData';

const NewsFeed: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { colorMode } = useColorMode();
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const bgColorDarkMode = useColorModeValue('gray.900', 'gray.900');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await fetchAllNewsData();
        setNewsList(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  // Pagination logic
  const indexOfLastNews = currentPage * 12;
  const indexOfFirstNews = indexOfLastNews - 12;
  const currentNews = newsList.slice(indexOfFirstNews, indexOfLastNews);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <Box p={4} bg={colorMode === 'light' ? bgColor : bgColorDarkMode}>
      <Heading mb={4}>Latest News</Heading>
      <Flex flexDirection="column">
        {currentNews.map((news) => (
          <Flex
            key={news.id}
            p={4}
            mb={4}
            alignItems="center"
            borderWidth="1px"
            borderRadius="md"
            bgColor={colorMode === 'light' ? bgColor : bgColorDarkMode}
            transition="all 0.3s"
            _hover={{ shadow: 'md' }}
          >
            <Image
              src={news.image_url}
              alt={news.title}
              borderRadius="md"
              cursor="pointer"
              objectFit="cover"
              height="100px"
              width="150px"
              onClick={() => window.open(news.article_url, '_blank')}
            />
            <Box ml={4} flex="1">
              <Heading as="h2" size="sm" mb={1}>
                <a href={news.article_url} target="_blank" rel="noopener noreferrer">
                  {news.title}
                </a>
              </Heading>
              <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} mb={2}>
                Published on {new Date(news.published_utc).toLocaleString()}
              </Text>
            </Box>
            <Button
              colorScheme="blue"
              size="xs"
              onClick={() => window.open(news.article_url, '_blank')}
            >
              Read More
            </Button>
          </Flex>
        ))}
      </Flex>
      <Flex justifyContent="center" alignItems="center" mt={4}>
        <Button colorScheme="blue" onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <Text mx={4} fontSize="lg">
          Page {currentPage}
        </Text>
        <Button
          colorScheme="blue"
          onClick={handleNextPage}
          disabled={indexOfLastNews >= newsList.length}
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default NewsFeed;
