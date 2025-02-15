import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaAddressCard, FaDollarSign, FaStickyNote } from "react-icons/fa";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  useColorMode,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";

const SendFundsForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { destinationAddress } = location.state || { destinationAddress: "" };
  const [destinationID, setDestinationID] = useState(destinationAddress);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  useEffect(() => {
    console.log('Received destinationAddress:', destinationAddress);
    setDestinationID(destinationAddress);
  }, [destinationAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      toast({
        title: "Success",
        description: "Funds sent successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setDestinationID("");
      setAmount("");
      setMemo("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send funds.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Flex
      height="100vh"
      alignItems="center"
      bg={isDark ? "gray.900" : "gray.50"}
    >
      <Box
        maxW="md"
        mx="auto"
        p={4}
        borderWidth={1}
        borderRadius="md"
        boxShadow="md"
        bg={isDark ? "gray.700" : "white"}
        color={isDark ? "white" : "black"}
        width="40%"
        data-testid="send-funds-box"
      >
        <Heading as="h1" size="lg" mb={4} textAlign="center" data-testid="send-funds-heading">
          Send Funds
        </Heading>
        <Text mb={6} textAlign="center">
          Enter the details below to send funds to another account.
        </Text>
        <form onSubmit={handleSubmit} data-testid="send-funds-form">
          <FormControl id="destinationID" mb={4}>
            <FormLabel><FaAddressCard />Destination Address</FormLabel>
            <Input
              type="text"
              value={destinationID}
              onChange={(e) => setDestinationID(e.target.value)}
              isRequired
              bg={isDark ? "gray.800" : "white"}
              color={isDark ? "white" : "black"}
              _placeholder={{ color: isDark ? "gray.400" : "gray.600" }}
              data-testid="send-funds-destination-id"
            />
          </FormControl>

          <FormControl id="amount" mb={4}>
            <FormLabel><FaDollarSign />Amount</FormLabel>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              isRequired
              bg={isDark ? "gray.800" : "white"}
              color={isDark ? "white" : "black"}
              _placeholder={{ color: isDark ? "gray.400" : "gray.600" }}
              data-testid="send-funds-amount"
            />
          </FormControl>

          <FormControl id="memo" mb={4}>
            <FormLabel><FaStickyNote />Memo</FormLabel>
            <Input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              bg={isDark ? "gray.800" : "white"}
              color={isDark ? "white" : "black"}
              _placeholder={{ color: isDark ? "gray.400" : "gray.600" }}
              data-testid="send-funds-memo"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            isLoading={loading}
            isDisabled={loading}
            mt={4}
            bg={isDark ? "teal.600" : undefined} // Optional: Adjust button background for dark mode
            _hover={{ bg: isDark ? "teal.700" : "teal.500" }} // Optional: Adjust hover background for dark mode
            data-testid="send-funds-button"
          >
            Send Funds
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default SendFundsForm;