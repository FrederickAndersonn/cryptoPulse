"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = 'aes-256-ctr';
const secretKey = 'e99a8f8427e4a72b8f4f5e30850ccf9c'; // Replace with your generated key
const iv = crypto_1.default.randomBytes(16);
const encrypt = (text) => {
    const cipher = crypto_1.default.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};
exports.encrypt = encrypt;
const decrypt = (hash) => {
    const [ivPart, encryptedPart] = hash.split(':');
    const ivBuffer = Buffer.from(ivPart, 'hex');
    const encryptedText = Buffer.from(encryptedPart, 'hex');
    const decipher = crypto_1.default.createDecipheriv(algorithm, secretKey, ivBuffer);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
};
exports.decrypt = decrypt;
