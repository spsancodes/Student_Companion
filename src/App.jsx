import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Auth Pages
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css'

// Main Dashboard
import Dashboard from './components/Dashboard';

// Student Features (Pages)
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
      <Routes>
        {/* Public Routes */}
        {!user && (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}

        {/* Private Routes */}
        {user && (
          <>
            <Route path="/" element={<Dashboard role={role} />} />
            <Route path="/notes/upload" element={<NotesUploader />} />
            <Route path="/notes/view" element={<NotesViewer />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/links" element={<Links />} />
            <Route path="/todo" element={<ToDo />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/calendar" element={<Calendar role={role} />} />
            <Route path="/reminder-settings" element={<ReminderSettings />} />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
  return (
    <>
      {/* Your routes/components */}
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
}


export default App;
