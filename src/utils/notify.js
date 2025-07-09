// src/utils/notify.js

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function showInstantNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/vite.svg" });
  }
}
