import axios from 'axios';

export const fetchPredictions = async (ticker: string, numDays: number) => {
  try {
    const response = await axios.get(`http://localhost:5001/ai/predict`);
    return response.data;
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw error;
  }
};