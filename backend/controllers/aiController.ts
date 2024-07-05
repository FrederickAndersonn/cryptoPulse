import { Request, Response } from 'express';
import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';
import yahooFinance from 'yahoo-finance2';

export const formatDateToStartOfDay = (date: Date): string => {
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
};
  
export const fetchLastSequence = async (ticker: string, numDays: number): Promise<number[]> => {
    const period1 = formatDateToStartOfDay(new Date(Date.now() - numDays * 24 * 60 * 60 * 1000));
    const period2 = formatDateToStartOfDay(new Date()); // Fetch data until today
    const queryOptions = { period1, period2, interval: '1d' as const }; // Fetch daily data
    
    const result = await yahooFinance.historical(ticker, queryOptions);
  
    if (result.length < numDays) {
      throw new Error(`Not enough data to fetch the last ${numDays} days.`);
    }
  
    const closingPrices = result.slice(-numDays).map(data => data.close);
    return closingPrices;
};

class MinMaxScaler {
    private min: number | null;
    private max: number | null;
  
    constructor() {
      this.min = null;
      this.max = null;
    }
  
    fit(data: number[]): void {
      this.min = Math.min(...data);
      this.max = Math.max(...data);
    }
  
    transform(data: number[]): number[] {
      if (this.min === null || this.max === null) {
        throw new Error('Scaler has not been fitted yet.');
      }
      return data.map(value => (value - this.min!) / (this.max! - this.min!));
    }
  
    inverseTransform(data: number[]): number[] {
      if (this.min === null || this.max === null) {
        throw new Error('Scaler has not been fitted yet.');
      }
      return data.map(value => value * (this.max! - this.min!) + this.min!);
    }
}

let model: tf.LayersModel;

const loadModel = async () => {
    try {
      const modelPath = path.join(__dirname, '../tfjs_model/model.json');
      model = await tf.loadLayersModel(`file://${modelPath}`);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
    }
};
  
loadModel();
  
const predictFutureClose = async (
    lastSeq: number[], 
    model: tf.LayersModel, 
    scaler_X: MinMaxScaler, 
    scaler_y: MinMaxScaler,
    daysToPredict: number
): Promise<number[]> => {
    const futurePrices: number[] = [];
    let currentSeq = tf.tensor(lastSeq).reshape([1, lastSeq.length]);
  
    for (let i = 0; i < daysToPredict; i++) {
      const currentSeqArray: number[][] = currentSeq.arraySync() as number[][];
      if (!Array.isArray(currentSeqArray) || !Array.isArray(currentSeqArray[0])) {
        throw new Error('Unexpected tensor shape');
      }
  
      const currentSeqScaled = scaler_X.transform(currentSeqArray[0]);
      const currentSeqTensor = tf.tensor(currentSeqScaled).reshape([1, currentSeqScaled.length, 1]);
      const predictedCloseScaled = model.predict(currentSeqTensor) as tf.Tensor;
      const predictedCloseArray: number[][] | undefined = predictedCloseScaled.arraySync() as number[][];
  
      if (!predictedCloseArray || !Array.isArray(predictedCloseArray[0])) {
        throw new Error('Unexpected tensor shape');
      }
  
      const predictedClose = scaler_y.inverseTransform(predictedCloseArray[0])[0];
      futurePrices.push(predictedClose);
  
      // Remove the first element and append the predicted close price
      currentSeq = tf.tidy(() => {
        const shiftedSeq = currentSeq.slice([0, 1], [-1, (currentSeq.shape[1] ?? 0) - 1]);
        return shiftedSeq.concat(tf.tensor([predictedClose]).reshape([1, 1]), 1);
      });
    }
  
    return futurePrices;
};
  
export const predict = async (req: Request, res: Response) => {
    try {
      const ticker = req.query.ticker as string || 'BTC-USD'; 
      const numDays = parseInt(req.query.numDays as string, 10) || 10; 
      const daysToPredict = parseInt(req.query.daysToPredict as string, 10) || 7; // Default to 7 days
  
      const lastSeq = await fetchLastSequence(ticker, numDays);
  
      // Fit the scalers with inputData
      const scaler_X = new MinMaxScaler();
      scaler_X.fit(lastSeq);
      const scaler_y = scaler_X; // Assuming using the same scaler for X and y as an example
  
      const predictions = await predictFutureClose(lastSeq, model, scaler_X, scaler_y, daysToPredict);
      res.json({ predictions });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
};