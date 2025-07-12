// src/components/NotificationSetup.jsx
import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ✅ Firebase config (must match the one in your firebase-messaging-sw.js)
const firebaseConfig = {
  apiKey: "AIzaSyDJOhz4n32-EwKZ_777Qoh61PID6-FqAU8",
  authDomain: "academiccompanionfcm.firebaseapp.com",
  projectId: "academiccompanionfcm",
  storageBucket: "academiccompanionfcm.appspot.com", // ✅ correct

  messagingSenderId: "702095500761",
  appId: "1:702095500761:web:2915bd6408cb46db70e5c8"
};

// ✅ Initialize Firebase App and Messaging
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

const NotificationSetup = () => {
  useEffect(() => {
    const initNotifications = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) {
        console.warn('⚠️ No user logged in, skipping notification setup.');
        return;
      }

      const permission = await Notification.requestPermission();
      console.log("🔐 Notification permission:", permission);

      if (permission === 'granted') {
        try {
          // ✅ Register service worker first
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log("🛠️ Service worker registered:", registration);

          // ✅ Get token with service worker registration
          const token = await getToken(messaging, {
            vapidKey: 'BD2zq2XuyHwNiPw8e8ApvGnrGExRlrLf9HXN--c3AfRvQMtnkd93fzxNdIxL8RuXrIRJe1vJQ0-tMajQ9v_QkdE',
            serviceWorkerRegistration: registration,
          });

          console.log("📲 FCM Token:", token);

          if (token) {
            const { error } = await supabase
              .from('profiles')
              .update({ device_token: token })
              .eq('id', userId);

            if (error) {
              console.error('🔴 Error saving device token:', error.message);
            } else {
              console.log('✅ Device token saved to Supabase!');
            }
          } else {
            console.warn('⚠️ Token was null. Check if the service worker is correctly registered.');
          }

        } catch (err) {
          console.error('🔴 Error retrieving FCM token:', err); // full error object
        }
      } else {
        console.log('🔕 Notification permission denied by user.');
      }
    };

    initNotifications();

    // ✅ Foreground message handling
    onMessage(messaging, (payload) => {
      console.log("📥 Foreground message received:", payload);
      const { title, body } = payload?.notification || {};

      if (title && body) {
        new Notification(title, {
          body,
          icon: '/logo.png', // replace with your icon if needed
        });
      }
    });

  }, []);

  return null; // This component doesn’t render anything
};

export default NotificationSetup;
