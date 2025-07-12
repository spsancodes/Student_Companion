import express from 'express';
import { sendPendingNotifications } from './lib/sendNotification.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/send-now', async (req, res) => {
  try {
    await sendPendingNotifications();
    res.status(200).send('✅ Notifications sent (if any)');
  } catch (err) {
    console.error('❌ Error in send-now:', err.message);
    res.status(500).send('❌ Failed to send notifications');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/send-now`);
});
