import React, { useEffect, useState } from 'react';
import { Coin } from '../models/coin';
import { coinData } from '../data/coinData';
import { Link } from 'react-router-dom';

const CoinTable: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [searchWord, setSearchWord] = useState<string>('');
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);

  useEffect(() => {
    coinData()
      .then((data) => {
        setCoins(data.trending);
        setBitcoinPrice(data.priceBtc);
      })
      .catch((error) => {
        console.error('Error setting coin data:', error);
      });
  }, []);

  const filterCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(searchWord.toLowerCase())
  );

  return (
    <div className="coin-table">
      <div className='cryptoHeader'>
        <input
          className='searchBar'
          type='text'
          placeholder='Search...'
          onChange={(event) => setSearchWord(event.target.value)}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Symbol</th>
            <th>Price in BTC</th>
            <th>Price in USD</th>
          </tr>
        </thead>
        <tbody>
          {filterCoins.map((coin) => (
            <tr key={coin.id}>
              <td className='coin-cell'>
                <Link to={`/${coin.id}`} className='coin-link'>
                  <img
                    src={coin.image}
                    alt={`${coin.name} Icon`}
                    className='coin-icon'
                  />
                  <span className='coin-name'>{coin.name}</span>
                </Link>
              </td>
              <td>{coin.symbol.toUpperCase()}</td>
              <td>{(coin.current_price / bitcoinPrice).toFixed(12)}</td>
              <td>${coin.current_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinTable;
