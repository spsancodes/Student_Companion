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

// 🚀 Send pending push notifications
export async function sendPendingNotifications() {
  console.log("\n=== 🚀 Starting notification processing ===");
  console.log("🔁 Checking for pending notifications...");

  // 🕒 Extensive time debugging
  const now = new Date();
  const nowISO = now.toISOString();
  const localTimeStr = now.toString();
  const utcTimeStr = now.toUTCString();
  
  console.log("\n=== ⏰ TIME DEBUGGING ===");
  console.log("🕒 Local server time:", localTimeStr);
  console.log("🌍 UTC time:", utcTimeStr);
  console.log("📅 ISO 8601 (UTC):", nowISO);
  console.log("⏱️ Timestamp (ms):", now.getTime());
  console.log("📊 Timezone Offset (min):", now.getTimezoneOffset());

  // 🧪 Debug: Check Supabase connection and all notifications first
  console.log("\n=== 🔍 DATABASE DEBUGGING ===");
  try {
    const { data: allNotifications, error: allError } = await supabase
      .from('notifications')
      .select('*')
      .order('send_at', { ascending: true });

    if (allError) {
      console.error('❌ Error fetching all notifications:', allError.message);
    } else {
      console.log(`📊 Total notifications in DB: ${allNotifications?.length || 0}`);
      console.log("🔍 First 5 notifications:");
      allNotifications?.slice(0, 5).forEach((n, i) => {
        console.log(`[${i + 1}] ID: ${n.id} | Title: "${n.title}" | Send At: ${n.send_at} | Sent: ${n.sent}`);
      });
    }
  } catch (err) {
    console.error('❌ Unexpected error in initial debug query:', err.message);
  }

  // 📝 Main query for pending notifications
  console.log("\n=== 🔎 QUERYING PENDING NOTIFICATIONS ===");
  console.log(`🔍 Query conditions: sent = false AND send_at <= ${nowISO}`);
  
  const windowMinutes = 1; // Allow 1-minute tolerance
const lowerBound = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
const upperBound = new Date(Date.now() + windowMinutes * 60 * 1000).toISOString();

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
  .gte('send_at', lowerBound)
  .lte('send_at', upperBound);


  if (error) {
    console.error('❌ Error fetching notifications:', error.message);
    return;
  }

  console.log(`📦 Found ${notifications?.length || 0} notifications to process`);
  
  // 📊 Detailed logging of each notification's timing
  if (notifications && notifications.length > 0) {
    console.log("\n=== 📅 NOTIFICATION TIMING ANALYSIS ===");
    notifications.forEach((n, i) => {
      const sendAt = new Date(n.send_at);
      const timeDiff = now.getTime() - sendAt.getTime();
      const minsLate = Math.floor(timeDiff / (1000 * 60));
      
      console.log(`\n🔔 [${i + 1}] ID: ${n.id}`);
      console.log(`📌 Title: "${n.title}"`);
      console.log(`⏰ Scheduled: ${n.send_at} (${sendAt.toString()})`);
      console.log(`⏱️ Current: ${nowISO} (${now.toString()})`);
      console.log(`⏳ Status: ${n.sent ? 'Sent' : 'Pending'}`);
      console.log(`⌛ Time difference: ${minsLate} minutes (${timeDiff} ms)`);
      console.log(`📱 Device token: ${n.profiles?.device_token ? 'Exists' : 'MISSING'}`);
    });
  } else {
    console.log('✅ No pending notifications to send at this time.');
    return;
  }

  // ✉️ Process each notification
  console.log("\n=== ✉️ PROCESSING NOTIFICATIONS ===");
  for (const notification of notifications) {
    const { id, title, body, send_at, profiles } = notification;
    const token = profiles?.device_token;
    
    console.log(`\n📨 Processing notification ID ${id}`);
    console.log(`📝 Title: "${title}"`);
    console.log(`📅 Scheduled: ${send_at}`);
    console.log(`🔑 Device token: ${token || 'MISSING'}`);

    if (!token) {
      console.warn(`⚠️ Skipping - No device token for user of notification ID ${id}`);
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
      console.log(`🚀 Attempting to send notification ID ${id}`);
      const response = await admin.messaging().send(message);
      console.log(`✅ Successfully sent notification ID ${id}:`, response);

      // Update sent status in database
      const updateResult = await supabase
        .from('notifications')
        .update({
          sent: true,
          sent_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateResult.error) {
        console.error(`❌ Failed to update sent status for ID ${id}:`, updateResult.error.message);
      } else {
        console.log(`📝 Successfully updated database for ID ${id}`);
        
        // Verify the update
        const { data: updatedRow, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error(`❌ Failed to fetch updated notification for ID ${id}:`, fetchError.message);
        } else {
          console.log(`🔍 Update verification for ID ${id}:`, {
            sent: updatedRow.sent,
            sent_at: updatedRow.sent_at
          });
        }
      }
    } catch (err) {
      console.error(`❌ Failed to send notification ID ${id}:`, err.message);
      console.error('Error details:', {
        name: err.name,
        code: err.code,
        stack: err.stack
      });
    }
  }

  console.log("\n=== 🏁 PROCESSING COMPLETE ===");
  console.log(`✅ Finished processing ${notifications?.length || 0} notifications`);
}