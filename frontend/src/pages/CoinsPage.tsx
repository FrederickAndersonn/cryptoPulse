import React from 'react';
import CoinTable from '../components/CoinTable';
import { Box, Heading } from '@chakra-ui/react';

const CoinsPage: React.FC = () => {
  return (
    <Box p={4}>
      <Heading mb={4}>All Coins</Heading>
      <CoinTable />
    </Box>
  );
};

export default CoinsPage;
