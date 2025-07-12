import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

import NotesUploader from './components/NotesUploader';
import NotesViewer from './components/NotesViewer';
import Chatbot from './pages/Chatbot';
import Links from './pages/links';
import ToDo from './pages/ToDo';
import Timer from './pages/Timer';
import Calendar from './pages/Calendar';
import ReminderSettings from './pages/ReminderSettings';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NotificationSetup from './components/NotificationSetup'; // ✅ new import

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const initialize = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUser({ id: profile.id });
        setRole(profile.role);
      }
    }

    setLoading(false);
  };

  initialize();

  // ✅ Add service worker registration here
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('✅ Firebase service worker registered:', registration);
      })
      .catch((err) => {
        console.error('❌ Service worker registration failed:', err);
      });
  }

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            setUser({ id: profile.id });
            setRole(profile.role);
          }
        });
    } else {
      setUser(null);
      setRole(null);
    }
  });

  return () => listener.subscription.unsubscribe();
}, []);

  const handleLogin = async (user) => {
    if (!user?.id) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUser({ id: profile.id });
      setRole(profile.role);
    }
  };

  const handleSignup = (userId, role) => {
    setUser({ id: userId });
    setRole(role);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      {/* ✅ Push Notification Setup when user is logged in */}
      {user && <NotificationSetup />}

      <Routes>
        {!user && (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}

        {user && (
          <>
            <Route path="/dashboard" element={<Dashboard role={role} />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            <Route path="/notes/upload" element={<NotesUploader />} />
            <Route path="/notes/view" element={<NotesViewer />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/links" element={<Links />} />
            <Route path="/todo" element={<ToDo />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/calendar" element={<Calendar role={role} />} />
            <Route path="/reminder-settings" element={<ReminderSettings />} />

            <Route path="*" element={<Navigate to={role === 'admin' ? "/admin-dashboard" : "/dashboard"} />} />
          </>
        )}
      </Routes>

      <ToastContainer position="top-right" autoClose={5000} />
    </Router>
  );
}

export default App;
