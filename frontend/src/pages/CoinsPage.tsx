import React from 'react';
import CoinTable from '../components/CoinTable';
import { Box, Heading, useColorModeValue } from '@chakra-ui/react';

const CoinsPage: React.FC = () => {
  const bg = useColorModeValue('gray.100', 'gray.900');

  return (
    <Box p={8} bg={bg} minHeight="100vh">
      <CoinTable />
    </Box>
  );
};

export default CoinsPage;
