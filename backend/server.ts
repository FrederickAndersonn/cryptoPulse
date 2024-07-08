import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';

import userDetailsRoutes from './routes/userDetailsRoutes';
import userRoutes from './routes/userRoutes';
import loginRoutes from './routes/loginRoutes';
import walletDetailsRoutes from './routes/walletDetailsRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import aiRoutes from './routes/aiRoutes';

const mongourl = "mongodb+srv://public:public@cluster0.jcpik0t.mongodb.net/cryptoPulse";

mongoose.connect(mongourl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Database connected!"))
  .catch(err => console.error("Database connection error:", err));

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
app.use('/ai', aiRoutes);

const PORT = parseInt(process.env.PORT || '5001', 10);
const HOST = '0.0.0.0';

const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`CryptoPulse has started on ${HOST}:${PORT}`);
});

export { app, server };
