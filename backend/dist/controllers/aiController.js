"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.predict = exports.fetchLastSequence = exports.formatDateToStartOfDay = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const path = __importStar(require("path"));
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const formatDateToStartOfDay = (date) => {
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
};
exports.formatDateToStartOfDay = formatDateToStartOfDay;
const fetchLastSequence = (ticker, numDays) => __awaiter(void 0, void 0, void 0, function* () {
    const period1 = (0, exports.formatDateToStartOfDay)(new Date(Date.now() - numDays * 24 * 60 * 60 * 1000));
    const period2 = (0, exports.formatDateToStartOfDay)(new Date()); // Fetch data until today
    const queryOptions = { period1, period2, interval: '1d' }; // Fetch daily data
    const result = yield yahoo_finance2_1.default.historical(ticker, queryOptions);
    if (result.length < numDays) {
        throw new Error(`Not enough data to fetch the last ${numDays} days.`);
    }
    const closingPrices = result.slice(-numDays).map(data => data.close);
    return closingPrices;
});
exports.fetchLastSequence = fetchLastSequence;
class MinMaxScaler {
    constructor() {
        this.min = null;
        this.max = null;
    }
    fit(data) {
        this.min = Math.min(...data);
        this.max = Math.max(...data);
    }
    transform(data) {
        if (this.min === null || this.max === null) {
            throw new Error('Scaler has not been fitted yet.');
        }
        return data.map(value => (value - this.min) / (this.max - this.min));
    }
    inverseTransform(data) {
        if (this.min === null || this.max === null) {
            throw new Error('Scaler has not been fitted yet.');
        }
        return data.map(value => value * (this.max - this.min) + this.min);
    }
}
let model;
const loadModel = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const modelPath = path.join(__dirname, '../tfjs_model/model.json');
        model = yield tf.loadLayersModel(`file://${modelPath}`);
        console.log('Model loaded successfully');
    }
    catch (error) {
        console.error('Error loading model:', error);
    }
});
loadModel();
const predictFutureClose = (lastSeq, model, scaler_X, scaler_y, daysToPredict) => __awaiter(void 0, void 0, void 0, function* () {
    const futurePrices = [];
    let currentSeq = tf.tensor(lastSeq).reshape([1, lastSeq.length]);
    for (let i = 0; i < daysToPredict; i++) {
        const currentSeqArray = currentSeq.arraySync();
        if (!Array.isArray(currentSeqArray) || !Array.isArray(currentSeqArray[0])) {
            throw new Error('Unexpected tensor shape');
        }
        const currentSeqScaled = scaler_X.transform(currentSeqArray[0]);
        const currentSeqTensor = tf.tensor(currentSeqScaled).reshape([1, currentSeqScaled.length, 1]);
        const predictedCloseScaled = model.predict(currentSeqTensor);
        const predictedCloseArray = predictedCloseScaled.arraySync();
        if (!predictedCloseArray || !Array.isArray(predictedCloseArray[0])) {
            throw new Error('Unexpected tensor shape');
        }
        const predictedClose = scaler_y.inverseTransform(predictedCloseArray[0])[0];
        futurePrices.push(predictedClose);
        // Remove the first element and append the predicted close price
        currentSeq = tf.tidy(() => {
            var _a;
            const shiftedSeq = currentSeq.slice([0, 1], [-1, ((_a = currentSeq.shape[1]) !== null && _a !== void 0 ? _a : 0) - 1]);
            return shiftedSeq.concat(tf.tensor([predictedClose]).reshape([1, 1]), 1);
        });
    }
    return futurePrices;
});
const predict = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticker = req.query.ticker || 'BTC-USD';
        const numDays = parseInt(req.query.numDays, 10) || 10;
        const daysToPredict = parseInt(req.query.daysToPredict, 10) || 7; // Default to 7 days
        const lastSeq = yield (0, exports.fetchLastSequence)(ticker, numDays);
        // Fit the scalers with inputData
        const scaler_X = new MinMaxScaler();
        scaler_X.fit(lastSeq);
        const scaler_y = scaler_X; // Assuming using the same scaler for X and y as an example
        const predictions = yield predictFutureClose(lastSeq, model, scaler_X, scaler_y, daysToPredict);
        res.json({ predictions });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});
exports.predict = predict;
