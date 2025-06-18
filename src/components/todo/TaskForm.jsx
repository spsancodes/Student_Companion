import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const TaskForm = ({ userId, activeList, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [status, setStatus] = useState('');

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setStatus('Task title is required');
      return;
    }

    if (!userId || !activeList) {
      setStatus('User or task list not available');
      return;
    }

    try {
      const taskData = {
        title,
        user_id: userId,
        list_id: activeList,
        due_date: dueDate ? `${dueDate}T${dueTime || '12:00'}` : null,
      };

      const { error } = await supabase.from('todos').insert(taskData);
      if (error) throw error;

      setTitle('');
      setDueDate('');
      setDueTime('');
      setStatus('Task added successfully!');
      onTaskAdded();
    } catch (error) {
      console.error('Error adding task:', error);
      setStatus('Failed to add task');
    }
  };

  return (
    <form onSubmit={handleAddTask} className="mt-4 px-2 text-sm">
      <div className="rounded border border-gray-300 p-4 shadow-sm bg-white">
        <div className="mb-3">
          <input
            className="w-full rounded border border-gray-300 p-2"
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 rounded border border-gray-300 p-2"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <input
            className="flex-1 rounded border border-gray-300 p-2"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            disabled={!dueDate}
          />
        </div>

        <button
  type="submit"
  className="w-full rounded bg-gray-900 text-white p-2 hover:bg-gray-800"
>
  Add Task
</button>

        {status && (
          <div className={`mt-2 text-center text-${status.includes('Failed') ? 'red-600' : 'green-600'}`}>
            {status}
          </div>
        )}
      </div>
    </form>
  );
};

export default TaskForm;