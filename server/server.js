import 'dotenv/config'
import express from 'express';
import cors from 'cors';

import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import creditRouter from './routes/creditRoutes.js';
import { stripeWebhooks } from './controllers/webhooks.js';


const app = express();

await connectDB();
// Stripe Webhooks
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// ✅ middleware order IMPORTANT
app.use(cors());
app.use(express.json()); 
  // ⚠️ ye upar hona chahiye

// ✅ routes
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);
app.use('/api/credit', creditRouter);

app.get('/', (req, res) => {
    res.send("Server running..!");
    
});
console.log("KEY =>", process.env.GROQ_API_KEY)
console.log("JWT =>", process.env.JWT_SECRET)

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});