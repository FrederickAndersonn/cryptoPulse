import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWatchlist, removeFromWatchlist } from '../actions/watchlistService';
import { Coin } from '../models/coin';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Text,
  useColorModeValue,
  Flex,
  Button,
  useToast,
} from '@chakra-ui/react';

const WatchlistPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [coinDetails, setCoinDetails] = useState<Coin[]>([]);
  const navigate = useNavigate();
  const bg = useColorModeValue('gray.100', 'gray.900');
  const tableBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('black', 'white');
  const toast = useToast();

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

  useEffect(() => {
    if (watchlist.length > 0) {
      const fetchCoinDetails = async () => {
        const coinDetailsPromises = watchlist.map((coinId) =>
          fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&market_data=true&x_cg_demo_api_key=CG-KhUN8eMndGdbN9nkufuVPt1x`)
            .then((response) => response.json())
            .then((data) => ({
              id: data.id,
              symbol: data.symbol,
              name: data.name,
              image: data.image.small,
              current_price: data.market_data.current_price.usd,
              sparkline_in_7d: data.market_data.sparkline_7d,
            }))
        );
        const coinDetailsData = await Promise.all(coinDetailsPromises);
        setCoinDetails(coinDetailsData);
      };
      fetchCoinDetails();
    }
  }, [watchlist]);

  const handleRowClick = (id: string) => {
    navigate(`/coin/${id}`);
  };

  const handleRemoveFromWatchlist = async (e: React.MouseEvent, coinId: string) => {
    e.stopPropagation(); // Prevent the row click event
    const userId = localStorage.getItem('userId'); // Assuming user ID is stored in localStorage
    try {
      if (userId) {
        const updatedWatchlist = await removeFromWatchlist(userId, coinId);
        setWatchlist(updatedWatchlist);
        toast({
          title: "Coin removed from watchlist.",
          description: "The coin has been removed from your watchlist successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast({
        title: "Error removing coin from watchlist.",
        description: "There was an error removing the coin from your watchlist. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
        <Table variant="simple" bg={tableBg} borderRadius="lg" boxShadow="lg" minWidth="100%">
          <Thead>
            <Tr>
              <Th color={textColor}>Name</Th>
              <Th color={textColor}>Symbol</Th>
              <Th color={textColor}>Price in USD</Th>
              <Th color={textColor}>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {coinDetails.map((coin) => (
              <Tr
                key={coin.id}
                onClick={() => handleRowClick(coin.id)}
                cursor="pointer"
              >
                <Td>
                  <Flex align="center">
                    <Image src={coin.image} alt={`${coin.name} Icon`} boxSize="30px" mr={2} />
                    <Text color={textColor}>{coin.name}</Text>
                  </Flex>
                </Td>
                <Td color={textColor}>{coin.symbol ? coin.symbol.toUpperCase() : 'N/A'}</Td>
                <Td color={textColor}>${coin.current_price ? coin.current_price.toFixed(2) : 'N/A'}</Td>
                <Td>
                  <Button colorScheme="red" onClick={(e) => handleRemoveFromWatchlist(e, coin.id)}>
                    Remove
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </Box>
  );
};

export default WatchlistPage;
