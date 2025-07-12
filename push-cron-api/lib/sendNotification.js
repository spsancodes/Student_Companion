import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function sendPendingNotifications() {
  console.log("🔁 Checking for pending notifications...");

  const now = new Date().toISOString();
  console.log("🕒 Current ISO timestamp:", now);

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

  if (error) {
    console.error('❌ Supabase error:', error.message);
    return;
  }

  if (!notifications || notifications.length === 0) {
    console.log('✅ No pending notifications to send.');
    return;
  }

  for (const notification of notifications) {
    const { id, title, body, profiles } = notification;
    const token = profiles?.device_token;

    if (!token) {
      console.warn(`⚠️ No token for notification ID ${id}`);
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
      console.log(`✅ Sent notification ID ${id}:`, response);

      await supabase
        .from('notifications')
        .update({
          sent: true,
          sent_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (err) {
      console.error(`❌ Failed to send ID ${id}:`, err.message);
    }
  }
}
