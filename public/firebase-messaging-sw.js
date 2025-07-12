// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.5.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.5.2/firebase-messaging-compat.js');

firebase.initializeApp({
   apiKey: "AIzaSyDJOhz4n32-EwKZ_777Qoh61PID6-FqAU8",
  authDomain: "academiccompanionfcm.firebaseapp.com",
  projectId: "academiccompanionfcm",
  storageBucket: "academiccompanionfcm.appspot.com", // ✅ correct

  messagingSenderId: "702095500761",
  appId: "1:702095500761:web:2915bd6408cb46db70e5c8"

});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'  // optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
