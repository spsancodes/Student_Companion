import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-purple-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl">🔔</div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 text-center mb-10">
        Welcome, {role === 'authority' ? 'Teacher/CR' : 'Student'}!
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => navigate(opt.path)}
            className="bg-white hover:bg-blue-100 transition duration-200 text-gray-800 text-lg font-medium py-5 px-6 rounded-xl shadow-md hover:shadow-lg text-left"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
