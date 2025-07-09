import React, { useState } from 'react';

const EventForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    category: '',
    semester: '',
    event_scope: '',
    is_public: true,
    reminder_time: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto py-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Add New Academic Event</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Event Title*</label>
            <input 
              id="title"
              name="title" 
              placeholder="Midterm Exam, Project Submission, etc." 
              value={formData.title} 
              onChange={handleChange} 
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required 
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              id="description"
              name="description" 
              placeholder="Additional details about the event..." 
              value={formData.description} 
              onChange={handleChange} 
              rows={3}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
              <input 
                id="date"
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required 
              />
            </div>
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">Start Time*</label>
              <input 
                id="start_time"
                type="time" 
                name="start_time" 
                value={formData.start_time} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                 
              />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">End Time*</label>
              <input 
                id="end_time"
                type="time" 
                name="end_time" 
                value={formData.end_time} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
            <select 
              id="category"
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required
            >
              <option value="">Select a category</option>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="lab">Lab Session</option>
              <option value="lecture">Lecture</option>
              <option value="holiday">Holiday</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select 
              id="semester"
              name="semester" 
              value={formData.semester} 
              onChange={handleChange} 
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>

          {/* Event Scope */}
          <div>
            <label htmlFor="event_scope" className="block text-sm font-medium text-gray-700 mb-1">Event Scope</label>
            <select 
              id="event_scope"
              name="event_scope" 
              value={formData.event_scope} 
              onChange={handleChange} 
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select scope</option>
              <option value="all">All Students</option>
              <option value="batch">Specific Batch</option>
              <option value="class">Specific Class</option>
              <option value="department">Department-wide</option>
              <option value="faculty">Faculty-only</option>
            </select>
          </div>

          {/* Public Event */}
          <div className="flex items-center">
            <input 
              id="is_public"
              type="checkbox" 
              name="is_public" 
              checked={formData.is_public} 
              onChange={handleChange} 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
              Public Event (visible to all students)
            </label>
          </div>

          {/* Reminder */}
          <div>
            <label htmlFor="reminder_time" className="block text-sm font-medium text-gray-700 mb-1">Set Reminder</label>
            <input 
              id="reminder_time"
              type="datetime-local" 
              name="reminder_time" 
              value={formData.reminder_time} 
              onChange={handleChange} 
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;