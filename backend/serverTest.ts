import { app } from './server';
import mongoose from 'mongoose';

const TEST_DB_URL = "mongodb://localhost:27017/FWE/Cryptopulse_test";

mongoose.connect(TEST_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Test Database connected!"))
  .catch(err => console.error("Test Database connection error:", err));

const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
  console.log("CryptoPulse test server has started on port", PORT);
});

export { app, server };
