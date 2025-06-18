import React from 'react';

const views = ['month', 'week', 'day'];

const CalendarToolbar = ({ label, onNavigate, onView, view }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b pb-3">
      {/* Navigation Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onNavigate('PREV')}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md border hover:bg-gray-200 transition"
        >
          ← Prev
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 py-1 bg-blue-600 text-white rounded-md border hover:bg-blue-700 transition"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md border hover:bg-gray-200 transition"
        >
          Next →
        </button>
      </div>

      {/* Calendar Title */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
        📅 {label}
      </h2>

      {/* View Switcher */}
      <div className="flex space-x-2">
        {views.map(v => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-3 py-1 rounded-md border ${
              v === view
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarToolbar;
