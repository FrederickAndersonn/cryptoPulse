import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  Input,
  Button,
  Select,
  Text,
  useColorModeValue,
  Spinner,
  VStack,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

const CryptoConverter = () => {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('bitcoin');
  const [result, setResult] = useState('');
  const [cryptoList, setCryptoList] = useState<{ id: string; symbol: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoList = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 50,
            page: 1,
          },
        });
        setCryptoList(response.data.map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
        })));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto list:', error);
        setLoading(false);
      }
    };

    fetchCryptoList();
  }, []);

  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount))) {
      setResult('Please enter a valid number.');
      return;
    }

    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${toCurrency}&vs_currencies=${fromCurrency.toLowerCase()}`;

    try {
      const response = await axios.get(apiUrl);
      const rate = response.data[toCurrency][fromCurrency.toLowerCase()];
      const conversionResult = parseFloat(amount) / rate;
      setResult(`${amount} ${fromCurrency} is equal to ${conversionResult.toFixed(8)} ${toCurrency}`);
    } catch (error) {
      setResult('Error: Unable to fetch exchange rate.');
      console.error(error);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Box p={8} bg={useColorModeValue('gray.50', 'gray.900')} minHeight="100vh" display="flex" justifyContent="center" alignItems="center">
      <Box maxW="md" w="full" p={8} bg={useColorModeValue('white', 'gray.700')} borderRadius="md" boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)">
        <Heading as="h1" mb={6} textAlign="center" fontSize="2xl" fontWeight="bold" color={useColorModeValue('black', 'white')}>
          Crypto Converter
        </Heading>
        <VStack spacing={4}>
          <FormControl id="amount">
            <FormLabel>Amount</FormLabel>
            <Input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter Amount"
              required
              size="lg"
              focusBorderColor="teal.400"
            />
          </FormControl>
          <FormControl id="fromCurrency">
            <FormLabel>From Currency</FormLabel>
            <Select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              size="lg"
              focusBorderColor="teal.400"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="INR">INR - India Rupee</option>
              <option value="NZD">NZD - New Zealand Dollar</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="BGN">BGN - Bulgarian Lev</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="HKD">HKD - Hong Kong Dollar</option>
              <option value="SEK">SEK - Swedish Krona</option>
              <option value="THB">THB - Thai Baht</option>
              <option value="HUF">HUF - Hungarian Forint</option>
              <option value="CNY">CNY - Chinese Yuan Renminbi</option>
              <option value="NOK">NOK - Norwegian Krone</option>
              <option value="MXN">MXN - Mexican Peso</option>
              <option value="GHS">GHS - Ghanaian Cedi</option>
              <option value="NGN">NGN - Nigerian Naira</option>
            </Select>
          </FormControl>
          {loading ? (
            <Spinner size="xl" color="teal.400" />
          ) : (
            <FormControl id="toCurrency">
              <FormLabel>To Currency</FormLabel>
              <Select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                size="lg"
                focusBorderColor="teal.400"
              >
                {cryptoList.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol.toUpperCase()})
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          <Button
            colorScheme="teal"
            onClick={handleConvert}
            width="full"
            size="lg"
            isDisabled={loading}
          >
            Convert
          </Button>
          {result && <Text mt={4} fontSize="lg" color={useColorModeValue('gray.700', 'gray.200')}>{result}</Text>}
        </VStack>
      </Box>
    </Box>
  );
};

export default CryptoConverter;
