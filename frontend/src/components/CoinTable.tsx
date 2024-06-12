import React, { useEffect, useState } from 'react';
import { Coin } from '../models/coin';
import { coinData } from '../data/coinData';
import { Link } from 'react-router-dom';
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
  Link as ChakraLink,
} from '@chakra-ui/react';

const CoinTable: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [searchWord, setSearchWord] = useState<string>('');
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);

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

  return (
    <Box width="100%" p={4} bg="gray.50" minHeight="100vh">
      <Box mb={4}>
        <Input
          placeholder="Search..."
          onChange={(event) => setSearchWord(event.target.value)}
          size="lg"
        />
      </Box>
      <Table variant="simple" bg="white" borderRadius="lg" boxShadow="lg">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Symbol</Th>
            <Th>Price in BTC</Th>
            <Th>Price in USD</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filterCoins.map((coin) => (
            <Tr key={coin.id}>
              <Td>
                <ChakraLink as={Link} to={`/${coin.id}`} display="flex" alignItems="center">
                  <Image
                    src={coin.image}
                    alt={`${coin.name} Icon`}
                    boxSize="30px"
                    mr={2}
                  />
                  <Text>{coin.name}</Text>
                </ChakraLink>
              </Td>
              <Td>{coin.symbol.toUpperCase()}</Td>
              <Td>{(coin.current_price / bitcoinPrice).toFixed(12)}</Td>
              <Td>${coin.current_price.toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default CoinTable;
