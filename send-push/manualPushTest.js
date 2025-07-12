// send-push/manualPushTest.js

import admin from 'firebase-admin';
import fs from 'fs';

// ✅ Read credentials
const serviceAccount = JSON.parse(
  fs.readFileSync('./firebase-key.json')  // Make sure the path is correct
);

// ✅ Initialize admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ Paste your device token here (copy from Supabase > profiles.device_token)
const deviceToken = 'eBTnsR9UUGHbon9yiPaZF-:APA91bG4-BECqCghzDqUeo2jfDEDY9R1aQBLVCgQCeG-gKTvKI7kBIZ4K7EEKBvHtKNqcMvYn3OomSPuynDD_UlOKFOseA-_GXUsRwYczalBgdYDPdH3e0g';

const message = {
  token: deviceToken,
  notification: {
    title: '🔔 Manual Push Test',
    body: 'If you see this on your device, everything works!',
  },
  webpush: {
    headers: { Urgency: 'high' },
    notification: {
      icon: '/logo.png',
      badge: '/logo.png',
    },
  },
};

// ✅ Send it
admin.messaging().send(message)
  .then((response) => {
    console.log('✅ Notification sent:', response);
  })
  .catch((error) => {
    console.error('❌ Failed to send notification:', error);
  });
