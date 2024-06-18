import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
} from '@chakra-ui/react';

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

  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  useEffect(() => {
    const fetchWalletDetails = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch wallet details
        const walletDetailsRes = await axios.get<Partial<WalletInfo>>(
          'http://localhost:5001/wallet/details',
          config
        );
        setWalletInfo((prevState) => ({
          ...prevState,
          balance: walletDetailsRes.data.balance || '', // Ensure balance is not undefined
          publicKey: walletDetailsRes.data.publicKey || '', // Ensure publicKey is not undefined
          address: walletDetailsRes.data.address || '', // Ensure address is not undefined
        }));

        // Fetch transactions associated with the wallet
        const transactionsRes = await axios.get<Transaction[]>(
          'http://localhost:5001/wallet/transactions',
          config
        );
        setWalletInfo((prevState) => ({
          ...prevState,
          transactions: transactionsRes.data,
        }));
      } catch (err : any) {
        console.error('Error fetching wallet details or transactions:', err.response ? err.response.data : err.message);
      }
    };

    fetchWalletDetails();
  }, []);

  return (
    <Flex direction="column" p={4} minHeight="100vh" bg={isDark ? 'gray.900' : 'gray.50'}>
      <Flex align="center" justify="space-between">
        <Heading size="lg" color={isDark ? 'white' : 'black'}>
          Wallet Details
        </Heading>
      </Flex>

      <Box mt={4} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" bg={isDark ? 'gray.700' : 'white'} color={isDark ? 'white' : 'black'}>
        <Text>
          <strong>Balance:</strong> {walletInfo.balance}
        </Text>
        <Text mt={2}>
          <strong>Address:</strong> {walletInfo.address}
        </Text>
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
