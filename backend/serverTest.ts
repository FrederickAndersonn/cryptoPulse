import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import userDetailsRoutes from './routes/userDetailsRoutes';
import userRoutes from './routes/userRoutes';
import loginRoutes from './routes/loginRoutes';
import walletDetailsRoutes from './routes/walletDetailsRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';

const TEST_DB_URL = "mongodb://localhost:27017/Cryptopulse_test";

mongoose.connect(TEST_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Test Database connected!"))
  .catch(err => console.error("Test Database connection error:", err));

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "build")));
app.use("/register", userRoutes);
app.use("/login", loginRoutes);
app.use("/wallet", walletDetailsRoutes);
app.use("/", postRoutes);
app.use("/comment", commentRoutes);
app.use("/user", userDetailsRoutes);

const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  console.log("CryptoPulse test server has started on port", PORT);
});

export { app, server };
