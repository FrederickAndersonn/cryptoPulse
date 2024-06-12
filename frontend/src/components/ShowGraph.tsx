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
import { Box, Image, Heading, Table, Tbody, Tr, Td, Switch, Flex, useColorMode, Text, Center } from '@chakra-ui/react';

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
  const [chartData, setChartData] = useState<GraphData[]>([]); // State to hold the fetched data
  const [coinData, setCoinData] = useState<CoinDetails | null>(null); // State to hold the fetched data
  const { id } = useParams<{ id: string }>();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  useEffect(() => {
    if (id) {
      // Fetch data when the component mounts
      graphData(id)
        .then((data) => {
          // Set the fetched data to state
          setChartData(data.data);
          setCoinData(data.dataDetails);
        })
        .catch((error) => {
          console.error('Error fetching graph data:', error);
        });
    }
  }, [id]);

  return (
    <>
      <Flex direction="column" minHeight="100vh" bg={isDark ? "gray.900" : "gray.100"}>
        <Box display="flex" justifyContent="flex-end" p={4}>
          <Text>Dark Mode</Text>
          <Switch ml={2} isChecked={isDark} onChange={toggleColorMode} />
        </Box>
        <Box p={4} width="100%" maxWidth="1200px" mx="auto" textAlign="center">
          <Box mb={4} textAlign="center">
            {coinData && coinData.image && (
              <Image src={coinData.image.large} alt={coinData.name} boxSize="50px" mx="auto" />
            )}
            <Heading as="h1" size="xl">{coinData?.name} ({coinData?.symbol.toUpperCase()})</Heading>
          </Box>
          <Center mb={4}>
            {chartData.length > 0 && (
              <AreaChart
                width={800}
                height={400}
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date" />
                <YAxis />
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
