import React, { useEffect, useState } from 'react';
import { Coin } from '../models/coin';
import { coinData } from '../data/coinData';
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
  Button,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';

const CoinTable: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [searchWord, setSearchWord] = useState<string>('');
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    coinData(page)
      .then((data) => {
        setCoins(data.trending);
        setBitcoinPrice(data.priceBtc);
      })
      .catch((error) => {
        console.error('Error setting coin data:', error);
      });
  }, [page]);

  const filterCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(searchWord.toLowerCase())
  );

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <Box width="100%" p={4} bg={useColorModeValue('gray.50', 'gray.800')} minHeight="100vh">
      <Heading as="h1" mb={4} textAlign="center">All Coins</Heading>
      <Box mb={4}>
        <Input
          placeholder="Search..."
          onChange={(event) => setSearchWord(event.target.value)}
          size="lg"
          width="100%"
        />
      </Box>
      <Table variant="simple" bg="white" borderRadius="lg" boxShadow="lg" width="100%">
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
            <Tr key={coin.id} cursor="pointer" _hover={{ bg: "gray.200" }}>
              <Td>
                <Box display="flex" alignItems="center">
                  <Image
                    src={coin.image}
                    alt={`${coin.name} Icon`}
                    boxSize="30px"
                    mr={2}
                  />
                  <Text>{coin.name}</Text>
                </Box>
              </Td>
              <Td>{coin.symbol.toUpperCase()}</Td>
              <Td>{bitcoinPrice ? (coin.current_price / bitcoinPrice).toFixed(12) : 'N/A'}</Td>
              <Td>${coin.current_price.toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Flex justifyContent="space-between" mt={4}>
        <Button onClick={handlePreviousPage} disabled={page === 1}>Previous</Button>
        <Text>Page {page}</Text>
        <Button onClick={handleNextPage}>Next</Button>
      </Flex>
    </Box>
  );
};

export default CoinTable;
