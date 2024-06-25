import React from 'react';
import { Box, Button, useColorModeValue, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import CoinTable from '../components/CoinTable';

const CoinsPage: React.FC = () => {
  const bg = useColorModeValue('gray.100', 'gray.900');
  const navigate = useNavigate();

  return (
    <Box p={8} bg={bg} minHeight="100vh">
      <Flex justifyContent="space-between" mb={4}>
        <Button onClick={() => navigate('/coins')}>All Coins</Button>
        <Button onClick={() => navigate('/watchlist')}>Watchlist</Button>
      </Flex>
      <CoinTable />
    </Box>
  );
};

export default CoinsPage;
