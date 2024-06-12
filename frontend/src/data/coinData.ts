import axios from 'axios';
import { Coin, CoinData } from '../models/coin';

async function coinData(page: number = 1): Promise<CoinData> {
  try {
    const [trendingResults, priceResults] = await Promise.all([
      axios.get<Coin[]>(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=${page}&sparkline=true&locale=en&x_cg_demo_api_key=CG-KhUN8eMndGdbN9nkufuVPt1x`),
      axios.get<{ bitcoin: { usd: number } }>('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&x_cg_demo_api_key=CG-KhUN8eMndGdbN9nkufuVPt1x')
    ]);

    const btcPrice = priceResults.data.bitcoin.usd;

    const trendingWithPrices = trendingResults.data.map((coin: Coin) => {
      const last_7_days = coin.sparkline_in_7d?.price.slice(-7).map((price: number, index: number) => ({
        Date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US"),
        Price: price,
      })) || [];

      return {
        ...coin,
        last_7_days,
      };
    });

    return {
      trending: trendingWithPrices,
      price: btcPrice,
      priceBtc: btcPrice
    };
  } catch (error) {
    console.error('Error fetching graph data:', error);
    throw error;
  }
}

export { coinData };
