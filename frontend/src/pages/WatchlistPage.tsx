import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWatchlist } from '../actions/watchlistService';
import {
  Box,
  Heading,
  Flex,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import WatchlistTable from '../components/WatchlistTable'; // Adjust the path as needed

const WatchlistPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const navigate = useNavigate();
  const bg = useColorModeValue('gray.100', 'gray.900');
  const textColor = useColorModeValue('black', 'white');

  useEffect(() => {
    const userId = localStorage.getItem('userId'); // Assuming user ID is stored in localStorage
    if (userId) {
      getWatchlist(userId)
        .then((data) => {
          setWatchlist(data);
        })
        .catch((error) => {
          console.error('Error fetching watchlist:', error);
        });
    }
  }, []);

  return (
    <Box width="100%" p={4} bg={bg} minHeight="100vh">
      <Flex justifyContent="space-between" mb={4}>
        <Button onClick={() => navigate('/coins')}>All Coins</Button>
        <Button onClick={() => navigate('/watchlist')}>Watchlist</Button>
      </Flex>
      <Heading as="h1" mb={4} textAlign="center" color={textColor}>
        Watchlist
      </Heading>
      <div style={{ overflowX: 'auto' }}>
        <WatchlistTable watchlist={watchlist} setWatchlist={setWatchlist} />
      </div>
    </Box>
  );
};

export default WatchlistPage;
