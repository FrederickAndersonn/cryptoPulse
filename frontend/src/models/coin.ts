export interface Coin {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
  }
  
  export interface CoinData {
    trending: Coin[];
    price: number;
    priceBtc: number;
  }
  