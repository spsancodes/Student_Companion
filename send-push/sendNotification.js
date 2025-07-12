// sendNotification.js

import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config(); // Load environment variables

// 🔐 Load Firebase service account key
const serviceAccount = JSON.parse(
  fs.readFileSync('./firebase-key.json')
);

// 🔐 Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 🧠 Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const debugDump = await supabase
  .from('notifications')
  .select('*');

console.log("🧾 DEBUG: All notifications (no filters):", debugDump);

// 🚀 Send pending push notifications
export async function sendPendingNotifications() {
  console.log("🔁 Checking for pending notifications...");

  const now = new Date().toISOString();
  console.log("🕒 Current ISO timestamp:", now);

  // ✅ JOIN profiles to get device_token for each user
  const { data: notifications, error } = await supabase
  .from('notifications')
  .select(`
    id,
    user_id,
    event_id,
    title,
    body,
    send_at,
    sent,
    profiles:profiles (
      device_token
    )
  `)
  .eq('sent', false)
  .lte('send_at', now);

    console.log("Supabase connection test:", { notifications, error });


  console.log("🧪 Raw notifications result:", notifications);
  

  if (error) {
    console.error('❌ Error fetching notifications:', error.message);
    return;
  }

  if (!notifications || notifications.length === 0) {
    console.log('✅ No pending notifications to send at this time.');
    return;
  }

  for (const notification of notifications) {
    const { id, title, body, send_at, profiles } = notification;

    console.log(`📨 Processing notification ID ${id} scheduled for ${send_at}`);

    const token = profiles?.device_token;

    if (!token) {
      console.warn(`⚠️ No device token for user of notification ID ${id}`);
      continue;
    }

    const message = {
      token,
      notification: { title, body },
      webpush: {
        headers: { Urgency: 'high' },
        notification: {
          icon: '/logo.png',
          badge: '/logo.png',
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log(`✅ Notification sent for ID ${id}:`, response);

      await supabase
        .from('notifications')
        .update({
          sent: true,
          sent_at: new Date().toISOString(),
        })
        .eq('id', id);

    } catch (err) {
      console.error(`❌ Failed to send notification ID ${id}:`, err.message);
    }
  }
}
