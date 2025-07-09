import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import { requestNotificationPermission } from "../utils/notify";
import { checkAndSendReminders } from "../utils/reminderChecker";

const Dashboard = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    } else {
      console.error('Logout failed:', error.message);
    }
  };
  const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);

  const studentOptions = [
    { label: '📤 Upload Notes', path: '/notes/upload' },
    { label: '📚 View Notes', path: '/notes/view' },
    { label: '🤖 Chatbot / AI Assistant', path: '/chatbot' },
    { label: '🔗 Save Links', path: '/links' },
    { label: '📝 To-Do List', path: '/todo' },
    { label: '⏱️ Set Timer', path: '/timer' },
    { label: '🗓️ Academic Calendar', path: '/calendar' },
  ];

  const teacherOptions = [
    { label: '🗓️ Academic Calendar', path: '/calendar' },
  ];

  const options = role === 'authority' ? teacherOptions : studentOptions;


 useEffect(() => {
  let interval;

  const setupNotifications = async () => {
    if (role === "authority") return; // 🛑 CR/Teacher should not get reminders

    const granted = await requestNotificationPermission();
    if (!granted) {
      console.warn("🚫 Notification permission denied");
      return;
    } else {
      console.log("✅ Notification permission granted");
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      interval = setInterval(() => {
        checkAndSendReminders(user.id);
      }, 60000); // every 60s
    }
  };

  setupNotifications();

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error) {
      setNotifications(data);
    } else {
      console.error("🔔 Notification fetch failed:", error.message);
    }
  };

  fetchNotifications();
}, []);



  return (
  <div className="p-6 min-h-screen bg-gray-50">
    {/* Header: Notifications + Logout */}
    <div className="flex justify-between items-center mb-6 relative">
      {/* 🔔 Notification icon */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="text-2xl hover:text-blue-600 transition"
          title="Notifications"
        >
          🔔
        </button>

        {/* Dropdown Notification List */}
        {showNotifications && (
          <div className="absolute left-0 mt-2 w-72 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
            <div className="p-3 font-semibold text-gray-700 border-b">Notifications</div>
            {notifications.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto divide-y">
                {notifications.map((note) => (
                  <li
                    key={note.id}
                    className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                  >
                    {note.message}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No new notifications</div>
            )}
          </div>
        )}
      </div>

      {/* ⚙️ Settings + 🔴 Logout */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/reminder-settings')}
          title="Reminder Preferences"
          className="text-xl text-gray-600 hover:text-blue-600 transition"
        >
          ⚙️
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>

    {/* 📋 Main Dashboard Options */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {options.map((opt) => (
        <button
          key={opt.path}
          onClick={() => navigate(opt.path)}
          className="bg-white border border-gray-200 rounded-lg p-6 text-lg shadow hover:shadow-md hover:border-blue-500 transition"
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

};

export default Dashboard;
