import axios from 'axios';
import { Coin, CoinData } from '../models/coin';

async function coinData(page: number = 1): Promise<CoinData> {
    try {
        const [trendingResults, priceResults] = await Promise.all([
            axios.get<Coin[]>(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=${page}&sparkline=false&locale=en&x_cg_demo_api_key=CG-KhUN8eMndGdbN9nkufuVPt1x`),
            axios.get<{ bitcoin: { usd: number } }>('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&x_cg_demo_api_key=CG-KhUN8eMndGdbN9nkufuVPt1x')
        ]);
        const btcPrice = priceResults.data.bitcoin.usd;
        return {
            trending: trendingResults.data,
            price: btcPrice,
            priceBtc: btcPrice
        }
    } catch (error) {
        console.error('Error fetching coin data:', error);
        throw error;
    }
}

export { coinData };
