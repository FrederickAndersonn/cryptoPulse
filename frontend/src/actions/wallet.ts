import axios, { AxiosError } from 'axios';

interface WalletInfo {
  balance: string;
  publicKey: string;
  address: string;
}

interface Transaction {
  id: string;
  memo: string;
  fee_charged: string;
  created_at: string;
}

export const fetchWalletDetails = async (token: string): Promise<Partial<WalletInfo>> => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get<Partial<WalletInfo>>('http://localhost:5001/wallet/details', config);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data || error.message);
    }
    throw new Error('An unknown error occurred');
  }
};

export const fetchTransactions = async (token: string): Promise<Transaction[]> => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get<Transaction[]>('http://localhost:5001/wallet/transactions', config);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data || error.message);
    }
    throw new Error('An unknown error occurred');
  }
};