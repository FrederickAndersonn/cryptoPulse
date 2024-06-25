import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeFromWatchlist } from '../actions/watchlistService';
import { Coin, CoinData } from '../models/coin';
import { coinData } from '../data/coinData';
import {
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
import CoinGraph7Days from '../components/CoinGraph7days'; // Import the CoinGraph7Days component

interface WatchlistTableProps {
  watchlist: string[];
  setWatchlist: React.Dispatch<React.SetStateAction<string[]>>;
}

const WatchlistTable: React.FC<WatchlistTableProps> = ({ watchlist, setWatchlist }) => {
  const [coinDetails, setCoinDetails] = useState<Coin[]>([]);
  const navigate = useNavigate();
  const tableBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('black', 'white');
  const toast = useToast();

  useEffect(() => {
    if (watchlist.length > 0) {
      const fetchWatchlistCoins = async () => {
        try {
          const coinDataResult: CoinData = await coinData();
          const watchlistCoins = coinDataResult.trending.filter((coin: Coin) =>
            watchlist.includes(coin.id)
          );
          setCoinDetails(watchlistCoins);
        } catch (error) {
          console.error('Error fetching watchlist coins:', error);
        }
      };
      fetchWatchlistCoins();
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
    <Table variant="simple" bg={tableBg} borderRadius="lg" boxShadow="lg" minWidth="100%">
      <Thead>
        <Tr>
          <Th color={textColor}>Name</Th>
          <Th color={textColor}>Symbol</Th>
          <Th color={textColor}>Price in USD</Th>
          <Th color={textColor}>Last 7 Days</Th>
          <Th color={textColor}>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {coinDetails.map((coin) => (
          <Tr
            key={coin.id}
            onClick={() => handleRowClick(coin.id)}
            cursor="pointer"
            _hover={{ bg: hoverBg }}
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
              <CoinGraph7Days data={coin.last_7_days || []} /> {/* Add the graph component */}
            </Td>
            <Td>
              <Button colorScheme="red" onClick={(e) => handleRemoveFromWatchlist(e, coin.id)}>
                Remove
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default WatchlistTable;
