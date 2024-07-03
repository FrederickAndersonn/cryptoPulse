import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Box, Center, Heading, Text, useColorMode } from '@chakra-ui/react';
import { fetchPredictions } from '../actions/predictionResult'; // Adjust the path as needed

interface GraphData {
  Date: string;
  Price: number;
}

const fetchCurrentBitcoinPrice = async () => {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  const data = await response.json();
  return data.bitcoin.usd;
};

const PredictionGraph: React.FC = () => {
  const [chartData, setChartData] = useState<GraphData[]>([]);
  const [originalChartData, setOriginalChartData] = useState<GraphData[]>([]);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [growthPercentage, setGrowthPercentage] = useState<number | null>(null);

  useEffect(() => {
    const ticker = 'BTC-USD';
    const numDays = 10;

    fetchPredictions(ticker, numDays)
      .then(prediction => {
        console.log('Prediction from backend:', prediction);
        const predictionData = prediction.predictions.map((price: number, index: number) => ({
          Date: `Day ${index + 1}`,
          Price: price
        }));
        setChartData(predictionData);
        setOriginalChartData(predictionData); // Store original data
      })
      .catch(error => {
        console.error('Error fetching graph data:', error);
      });

    fetchCurrentBitcoinPrice()
      .then(price => {
        setCurrentPrice(price);
      })
      .catch(error => {
        console.error('Error fetching current Bitcoin price:', error);
      });
  }, []);

  useEffect(() => {
    if (chartData.length > 0 && currentPrice !== null) {
      const lastPredictedPrice = chartData[chartData.length - 1].Price;
      const growth = ((lastPredictedPrice - currentPrice) / currentPrice) * 100;
      setGrowthPercentage(growth);
    }
  }, [chartData, currentPrice]);

  const prices = chartData.map((point) => point.Price);
  const minPrice = Math.floor(Math.min(...prices));
  const maxPrice = Math.ceil(Math.max(...prices));

  return (
    <Box minHeight="100vh" bg={isDark ? 'gray.900' : 'gray.100'}>
      <Box p={4} maxWidth="1200px" mx="auto" textAlign="center">
        <Heading as="h1" size="xl" mb={4}>Bitcoin Price Prediction</Heading>
        {currentPrice !== null && (
          <Text fontSize="xl" mb={4}>
            Current Bitcoin Price: ${currentPrice.toFixed(2)}
          </Text>
        )}
        {growthPercentage !== null && (
          <Text fontSize="xl" mb={4} color={growthPercentage >= 0 ? 'green.500' : 'red.500'}>
            {growthPercentage >= 0 ? `Growth 🚀: ${growthPercentage.toFixed(2)}%` : `Decline 📉: ${growthPercentage.toFixed(2)}%`}
          </Text>
        )}
        <Center mb={4}>
          {chartData.length > 0 && (
            <AreaChart
              width={1000}
              height={400}
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date" />
              <YAxis domain={[minPrice, maxPrice]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="Price"
                stroke={isDark ? '#82ca9d' : '#8884d8'}
                fill={isDark ? '#82ca9d' : '#8884d8'}
              />
            </AreaChart>
          )}
        </Center>
      </Box>
    </Box>
  );
}

export default PredictionGraph;