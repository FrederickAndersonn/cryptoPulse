import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WalletDetails = () => {
  const [walletInfo, setWalletInfo] = useState({
    balance: 'Loading...',
    publicKey: '',
    address: ''
  });

  useEffect(() => {
    const fetchWalletDetails = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const res = await axios.get('http://localhost:5001/wallet/details', config); // Adjust URL
        setWalletInfo(res.data);
        console.log('Wallet details:', res.data);
      } catch (err : any) {
        console.error('Error fetching wallet details:', err.response.data);

      }
    };

    fetchWalletDetails();
  }, []);

  return (
    <div>
      <h2>Wallet Details</h2>
      <div>
        <strong>Balance:</strong> {walletInfo.balance}
      </div>
      <div>
        <strong>Public Key:</strong> {walletInfo.publicKey}
      </div>
      <div>
        <strong>Address:</strong> {walletInfo.address}
      </div>
    </div>
  );
};

export default WalletDetails;
