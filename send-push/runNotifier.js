// runNotifier.js
import { sendPendingNotifications } from './sendNotification.js';
import cron from 'node-cron';

console.log("🔁 Notification cron job started...");

// Every 1 minute
cron.schedule('* * * * *', async () => {
  console.log("⏰ Checking for pending notifications...");
  await sendPendingNotifications();
});
