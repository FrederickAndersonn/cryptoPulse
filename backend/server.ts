import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';

import userRoutes from './routes/userRoutes';
import loginRoutes from './routes/loginRoutes';

const mongourl = "mongodb://localhost:27017/cryptoPulse_db";

mongoose.connect(mongourl, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true // Add this line
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

app.get("*", (req: Request, res: Response) => res.sendFile(path.resolve(__dirname, "build", "index.html")));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log("Cryptex has started on port", PORT);
});
