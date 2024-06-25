import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flex,
  Box,
  Text,
  Heading,
  List,
  ListItem,
  VStack,
  Divider,
  useColorMode,
  Button,
} from '@chakra-ui/react';
import { fetchWalletDetails, fetchTransactions } from '../actions/wallet'; // Adjust the path as per your project structure

interface Transaction {
  id: string;
  memo: string;
  fee_charged: string;
  created_at: string;
}

interface WalletInfo {
  balance: string;
  publicKey: string;
  address: string;
  transactions: Transaction[];
}

const WalletDetails: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    balance: 'Loading...',
    publicKey: '',
    address: '',
    transactions: [],
  });

  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        if (!token) {
          navigate('/login'); // Redirect to login if token is not present
          return;
        }

        const walletDetails = await fetchWalletDetails(token);
        const transactions = await fetchTransactions(token);

        setWalletInfo({
          balance: walletDetails.balance || '',
          publicKey: walletDetails.publicKey || '',
          address: walletDetails.address || '',
          transactions,
        });
      } catch (error : any) {
        console.error('Error fetching wallet details or transactions:', error.message);
      }
    };

    fetchData();
  }, []);

  const handleTransfer = () => {
    navigate('/sendfunds'); // Redirect to /sendfunds route using navigate
  };

  return (
    <Flex height="100vh" p={4} bg={isDark ? 'gray.900' : 'gray.50'} direction="column">
      <Flex align="center" justify="space-between">
        <Heading size="lg" color={isDark ? 'white' : 'black'}>
          Wallet Details
        </Heading>
      </Flex>

      <Box mt={4} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" bg={isDark ? 'gray.700' : 'white'} color={isDark ? 'white' : 'black'} textAlign="center">
        <Text fontSize="sm">Total Balance</Text>
        <Text fontSize="3xl" fontWeight="bold" mt={1}>
          {walletInfo.balance}
        </Text>
        <Text mt={2}>
          <strong>Address:</strong> {walletInfo.address}
        </Text>
        <Button mt={4} colorScheme="teal" onClick={handleTransfer}>
          Transfer
        </Button>
      </Box>

      <Box mt={4} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" bg={isDark ? 'gray.700' : 'white'} color={isDark ? 'white' : 'black'}>
        <Heading size="md" mb={2} color={isDark ? 'white' : 'black'}>
          Transactions
        </Heading>
        <Divider mb={2} />
        
        <List spacing={3}>
          {walletInfo.transactions.map((transaction) => (
            <ListItem key={transaction.id} mb={3} p={3} bg={isDark ? 'gray.600' : 'gray.100'} borderRadius="md">
              <VStack align="start">
                <Text>
                  <strong>ID:</strong> {transaction.id}
                </Text>
                <Text>
                  <strong>Memo:</strong> {transaction.memo}
                </Text>
                <Text>
                  <strong>Fee Charged:</strong> {transaction.fee_charged}
                </Text>
                <Text>
                  <strong>Created At:</strong> {transaction.created_at}
                </Text>
              </VStack>
            </ListItem>
          ))}
        </List>
      </Box>
    </Flex>
  );
};

export default WalletDetails;
