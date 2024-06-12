import React from 'react';
import CoinTable from '../components/CoinTable';

const CoinsPage: React.FC = () => {
  return (
    <div className="coins-page">
      <h1>All Coins</h1>
      <CoinTable />
    </div>
  );
};

export default CoinsPage;
