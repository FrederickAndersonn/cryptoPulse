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
app.use("/comment",commentRoutes);
app.use("/user", userDetailsRoutes);
app.use('/ai', aiRoutes);


const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log("CryptoPulse has started on port", PORT);
});

export { app, server };
