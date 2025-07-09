import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ReminderSettings() {
  const [offsets, setOffsets] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadPreferences = async () => {
      const { data } = await supabase.from("user_preferences").select("reminder_offsets").single();
      if (data?.reminder_offsets) {
        setOffsets(data.reminder_offsets.join(", "));
      }
    };

    loadPreferences();
  }, []);

  const savePreferences = async () => {
    const parsed = offsets
      .split(",")
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !isNaN(v));

    const user = (await supabase.auth.getUser()).data.user;

    const { error } = await supabase.from("user_preferences").upsert({
      user_id: user.id,
      reminder_offsets: parsed,
    });

    if (error) {
      setStatus("❌ Failed to save preferences.");
    } else {
      setStatus("✅ Preferences saved!");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">📅 Reminder Settings</h2>
      <label className="block mb-2 text-gray-600 text-sm">
        Set how early you'd like reminders (in hours, comma-separated):
      </label>
      <input
        type="text"
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        placeholder="e.g., 5, 2, 0.166"
        value={offsets}
        onChange={(e) => setOffsets(e.target.value)}
      />
      <button
        onClick={savePreferences}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Preferences
      </button>
      {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}
    </div>
  );
}
