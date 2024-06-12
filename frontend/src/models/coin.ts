export interface Coin {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    sparkline_in_7d: { price: number[] };
    last_7_days?: { Date: string; Price: number }[]; 
  }
  
  export interface CoinData {
    trending: Coin[];
    price: number;
    priceBtc: number;
  }
  