import React, { useEffect, useState } from 'react';
import { Coin } from '../models/coin';
import { coinData } from '../data/coinData';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Input,
  Text,
  Heading,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';

const CoinTable: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [searchWord, setSearchWord] = useState<string>('');
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const bg = useColorModeValue('gray.50', 'gray.800');
  const tableBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('black', 'white');

  useEffect(() => {
    coinData()
      .then((data) => {
        setCoins(data.trending);
        setBitcoinPrice(data.priceBtc);
      })
      .catch((error) => {
        console.error('Error setting coin data:', error);
      });
  }, []);

  const filterCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(searchWord.toLowerCase())
  );

  const handleRowClick = (id: string) => {
    navigate(`/coin/${id}`);
  };

  return (
    <Box width="100%" p={4} bg={bg} minHeight="100vh">
      <Heading as="h1" mb={4} textAlign="center" color={textColor}>All Coins</Heading>
      <Box mb={4}>
        <Input
          placeholder="Search..."
          onChange={(event) => setSearchWord(event.target.value)}
          size="lg"
          width="100%"
          bg={tableBg}
          color={textColor}
        />
      </Box>
      <Table variant="simple" bg={tableBg} borderRadius="lg" boxShadow="lg" width="100%">
        <Thead>
          <Tr>
            <Th color={textColor}>Name</Th>
            <Th color={textColor}>Symbol</Th>
            <Th color={textColor}>Price in BTC</Th>
            <Th color={textColor}>Price in USD</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filterCoins.map((coin) => (
            <Tr
              key={coin.id}
              onClick={() => handleRowClick(coin.id)}
              cursor="pointer"
              _hover={{ bg: hoverBg }}
            >
              <Td>
                <Box display="flex" alignItems="center">
                  <Image
                    src={coin.image}
                    alt={`${coin.name} Icon`}
                    boxSize="30px"
                    mr={2}
                  />
                  <Text color={textColor}>{coin.name}</Text>
                </Box>
              </Td>
              <Td color={textColor}>{coin.symbol.toUpperCase()}</Td>
              <Td color={textColor}>{bitcoinPrice ? (coin.current_price / bitcoinPrice).toFixed(12) : 'N/A'}</Td>
              <Td color={textColor}>${coin.current_price.toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default CoinTable;
