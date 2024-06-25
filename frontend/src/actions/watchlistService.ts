import axios from 'axios';

const API_URL = 'http://localhost:5001'; // Adjust based on your backend server URL

export const addToWatchlist = async (userId: string, coinId: string) => {
  try {
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
    const response = await axios.put(
      `${API_URL}/user/${userId}/watchlist`,
      { coinId },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

export const getWatchlist = async (userId: string) => {
  try {
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
    const response = await axios.get(
      `${API_URL}/user/${userId}/watchlist`,
      {
        headers: {
          'x-auth-token': token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (userId: string, coinId: string) => {
  try {
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
    const response = await axios.delete(
      `${API_URL}/user/${userId}/watchlist/${coinId}`,
      {
        headers: {
          'x-auth-token': token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};
