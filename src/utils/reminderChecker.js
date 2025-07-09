import { supabase } from "../supabaseClient";
import { showInstantNotification } from "./notify"; // this should use Notification API

export const checkAndSendReminders = async (userId) => {
  const now = new Date().toISOString();

  const { data: reminders, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("sent", false)
    .lte("send_at", now);

  if (error) {
    console.error("Reminder fetch error:", error);
    return;
  }

  for (const reminder of reminders) {
    // Show Push Notification
    showInstantNotification(reminder.title, reminder.body);

    // Mark as sent so it doesn't repeat
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ sent: true })
      .eq("id", reminder.id);

    if (updateError) console.error("Failed to mark as sent:", updateError);
  }
};
