import axios from 'axios';

interface GraphData {
  Date: string;
  Price: number;
}

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

async function graphData(id: string): Promise<{ data: GraphData[], dataDetails: CoinDetails }> {
  try {
    const [graphResults, dataDetails] = await Promise.all([
      axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=360&x_cg_demo_api_key=CG-KhUN8eMndGdbN9nkufuVPt1x`),
      axios.get(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&market_data=true&x_cg_demo_api_key=CG-KhUN8eMndGdbN9nkufuVPt1x`)
    ]);

    const data = graphResults.data.prices.map((price: [number, number]) => {
      const [timestamp, p] = price;
      const date = new Date(timestamp).toLocaleDateString("en-US");
      return {
        Date: date,
        Price: p
      };
    });

    return {
      data: data,
      dataDetails: dataDetails.data
    };
  } catch (error) {
    console.error('Error fetching graph data:', error);
    throw error; // Rethrow the error for handling in the calling code
  }
}

export default graphData;
