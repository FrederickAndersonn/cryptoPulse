import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';

import userRoutes from './routes/userRoutes';
import loginRoutes from './routes/loginRoutes';
import walletDetailsRoutes from './routes/walletDetailsRoutes';
import userDetailsRoutes from './routes/userDetailsRoutes';

const mongourl = "mongodb+srv://public:public@cluster0.jcpik0t.mongodb.net/";

mongoose.connect(mongourl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Database connected!"))
  .catch(err => console.error("Database connection error:", err));

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => res.sendFile(path.resolve(__dirname, "build", "index.html")));

app.use(express.static(path.join(__dirname, "build")));
app.use("/register", userRoutes);
app.use("/login", loginRoutes);
app.use("/wallet", walletDetailsRoutes);
app.use("/user", userDetailsRoutes);

app.get("*", (req: Request, res: Response) => res.sendFile(path.resolve(__dirname, "build", "index.html")));

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log("CryptoPulse has started on port", PORT);
});

export { app, server };
