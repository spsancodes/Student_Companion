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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
        <h2 className="text-xl font-semibold">Add New Event</h2>

        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded" required />

        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" />

        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border p-2 rounded" required />
        
        <div className="flex gap-2">
          <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="flex-1 border p-2 rounded" required />
          <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="flex-1 border p-2 rounded" required />
        </div>

        <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded" required>
          <option value="">Select Category</option>
          <option value="exam">Exam</option>
          <option value="assignment">Assignment</option>
          <option value="lab">Lab</option>
          <option value="other">Other</option>
        </select>

        <select name="semester" value={formData.semester} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="">All Semesters</option>
          <option value="1">Sem 1</option>
          <option value="2">Sem 2</option>
          <option value="3">Sem 3</option>
          <option value="4">Sem 4</option>
          <option value="5">Sem 5</option>
          <option value="6">Sem 6</option>
          <option value="7">Sem 7</option>
          <option value="8">Sem 8</option>
        </select>

        <select name="event_scope" value={formData.event_scope} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="">Scope</option>
          <option value="all">All Students</option>
          <option value="batch">Specific Batch</option>
          <option value="class">Specific Class</option>
        </select>

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} />
          <span>Public Event</span>
        </label>

        <input type="datetime-local" name="reminder_time" value={formData.reminder_time} onChange={handleChange} className="w-full border p-2 rounded" />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onClose} className="text-gray-600 hover:underline">Cancel</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
