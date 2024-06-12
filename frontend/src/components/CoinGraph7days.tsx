import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useColorMode } from '@chakra-ui/react';

interface CoinGraph7DaysProps {
  data: { Date: string; Price: number }[];
}

const CoinGraph7Days: React.FC<CoinGraph7DaysProps> = ({ data }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Find the min and max prices for setting the Y-axis domain
  const prices = data.map((point) => point.Price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <AreaChart
      width={150}
      height={50}
      data={data}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="Date" hide />
      <YAxis domain={[minPrice, maxPrice]} hide />
      <Tooltip />
      <Area
        type="monotone"
        dataKey="Price"
        stroke={isDark ? "#82ca9d" : "#8884d8"}
        fill={isDark ? "#82ca9d" : "#8884d8"}
      />
    </AreaChart>
  );
};

export default CoinGraph7Days;
