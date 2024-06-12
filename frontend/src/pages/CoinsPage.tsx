import React from 'react';
import CoinTable from '../components/CoinTable';
import { Box, Heading, useColorModeValue } from '@chakra-ui/react';

const CoinsPage: React.FC = () => {
  // Define color mode values for background and text
  const bg = useColorModeValue('gray.100', 'gray.900');
  const textColor = useColorModeValue('black', 'white');

  return (
    <Box p={4} bg={bg} minHeight="100vh">
      <CoinTable />
    </Box>
  );
};

export default CoinsPage;
