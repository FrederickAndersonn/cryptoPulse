import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useParams } from 'react-router-dom';
import graphData from "../data/graphData";
import { Box, Image, Heading, Table, Tbody, Tr, Td, Flex, useColorMode, Center, ButtonGroup, Button } from '@chakra-ui/react';

interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_24h: number;
    price_change_percentage_1y: number;
    circulating_supply: number;
    total_supply: number;
    market_cap: { usd: number };
    market_cap_rank: number;
  };
}

interface GraphData {
  Date: string;
  Price: number;
}

const ShowGraph: React.FC = () => {
  const [chartData, setChartData] = useState<GraphData[]>([]);
  const [originalChartData, setOriginalChartData] = useState<GraphData[]>([]);
  const [coinData, setCoinData] = useState<CoinDetails | null>(null);
  const { id } = useParams<{ id: string }>();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [chartInterval, setChartInterval] = useState<string>('all'); // State for chart interval selection

  useEffect(() => {
    if (id) {
      graphData(id)
        .then((data) => {
          setChartData(data.data);
          setOriginalChartData(data.data); // Store original data
          setCoinData(data.dataDetails);
        })
        .catch((error) => {
          console.error('Error fetching graph data:', error);
        });
    }
  }, [id]);

  // Function to filter chart data based on selected interval
  const filterChartData = (data: GraphData[], interval: string): GraphData[] => {
    const today = new Date();
    switch (interval) {
      case '1w':
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        return data.filter(item => new Date(item.Date) >= oneWeekAgo);
      case '1m':
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        return data.filter(item => new Date(item.Date) >= oneMonthAgo);
      case '1y':
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        return data.filter(item => new Date(item.Date) >= oneYearAgo);
      case 'all':
      default:
        return data;
    }
  };

  // Handler for interval change
  const handleIntervalChange = (interval: string) => {
    setChartInterval(interval);
    const filteredData = filterChartData(originalChartData, interval);
    setChartData(filteredData);
  };

  const prices = chartData.map((point) => point.Price);
  const minPrice = Math.floor(Math.min(...prices));
  const maxPrice = Math.ceil(Math.max(...prices));


  return (
    <>
      <Flex direction="column" minHeight="100vh" bg={isDark ? "gray.900" : "gray.100"}>
        <Box p={4} width="100%" maxWidth="1200px" mx="auto" textAlign="center">
          <Box mb={4} textAlign="center">
            {coinData && coinData.image && (
              <Image src={coinData.image.large} alt={coinData.name} boxSize="50px" mx="auto" />
            )}
            <Heading as="h1" size="xl">{coinData?.name} ({coinData?.symbol.toUpperCase()})</Heading>
          </Box>
          <Center mb={4}>
            <ButtonGroup variant="outline" spacing="4">
              <Button onClick={() => handleIntervalChange('1w')}>1 W</Button>
              <Button onClick={() => handleIntervalChange('1m')}>1 M</Button>
              <Button onClick={() => handleIntervalChange('1y')}>1 Y</Button>
              <Button onClick={() => handleIntervalChange('all')}>All</Button>
            </ButtonGroup>
          </Center>
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
                  stroke={isDark ? "#82ca9d" : "#8884d8"}
                  fill={isDark ? "#82ca9d" : "#8884d8"}
                />
              </AreaChart>
            )}
          </Center>
          {coinData?.market_data && (
            <Center>
              <Box bg={isDark ? "gray.700" : "white"}
                color={isDark ? "white" : "black"} p={4} borderRadius="md" boxShadow="md" textAlign="center">
                <Heading as="h2" size="lg" mb={4}>{coinData.name} Price Statistics</Heading>
                <Table variant="simple">
                  <Tbody>
                    <Tr>
                      <Td>Current Price</Td>
                      <Td fontWeight="bold">${coinData.market_data.current_price.usd}</Td>
                    </Tr>
                    <Tr>
                      <Td>24 Hour High</Td>
                      <Td fontWeight="bold">${coinData.market_data.high_24h.usd}</Td>
                    </Tr>
                    <Tr>
                      <Td>24 Hour Low</Td>
                      <Td fontWeight="bold">${coinData.market_data.low_24h.usd}</Td>
                    </Tr>
                    <Tr>
                      <Td>24 Hour Price Change</Td>
                      <Td fontWeight="bold">${coinData.market_data.price_change_24h.toFixed(2)}</Td>
                    </Tr>
                    <Tr>
                      <Td>1 Year Change</Td>
                      <Td fontWeight="bold">{coinData.market_data.price_change_percentage_1y.toFixed(2)}%</Td>
                    </Tr>
                    <Tr>
                      <Td>Circulating Supply</Td>
                      <Td fontWeight="bold">{coinData.market_data.circulating_supply}</Td>
                    </Tr>
                    <Tr>
                      <Td>Total Supply</Td>
                      <Td fontWeight="bold">{coinData.market_data.total_supply}</Td>
                    </Tr>
                    <Tr>
                      <Td>Market Cap</Td>
                      <Td fontWeight="bold">${coinData.market_data.market_cap.usd}</Td>
                    </Tr>
                    <Tr>
                      <Td>Market Cap Rank</Td>
                      <Td fontWeight="bold">{coinData.market_data.market_cap_rank}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            </Center>
          )}
        </Box>
      </Flex>
    </>
  );
}

export default ShowGraph;
