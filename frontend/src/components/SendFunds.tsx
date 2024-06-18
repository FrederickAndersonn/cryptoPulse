import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, useToast } from '@chakra-ui/react';
import axios from 'axios';

const SendFundsForm: React.FC = () => {
  const [destinationID, setDestinationID] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState(''); // State for memo string
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token'); // Assume the token is stored in localStorage
      const response = await axios.post(
        'http://localhost:5001/wallet/sendfunds',
        { destinationID, amount, memo }, // Include memo in the data sent to backend
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Success',
        description: 'Funds sent successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Clear form fields
      setDestinationID('');
      setAmount('');
      setMemo('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send funds.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={4} borderWidth={1} borderRadius="md" boxShadow="md">
      <form onSubmit={handleSubmit}>
        <FormControl id="destinationID" mb={4}>
          <FormLabel>Destination Address</FormLabel>
          <Input
            type="text"
            value={destinationID}
            onChange={(e) => setDestinationID(e.target.value)}
            isRequired
          />
        </FormControl>

        <FormControl id="amount" mb={4}>
          <FormLabel>Amount</FormLabel>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            isRequired
          />
        </FormControl>

        <FormControl id="memo" mb={4}>
          <FormLabel>Memo</FormLabel>
          <Input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="teal"
          isLoading={loading}
          isDisabled={loading}
        >
          Send Funds
        </Button>
      </form>
    </Box>
  );
};

export default SendFundsForm;
