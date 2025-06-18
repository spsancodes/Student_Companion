import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { FaTrash } from 'react-icons/fa';

const TaskItem = ({ task, onTaskUpdate, onTaskDelete, showUndo }) => {
  const [checked, setChecked] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleCheckboxChange = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount === 1) {
      setChecked(true);
      showUndo(task); // Trigger undo toast logic
    } else {
      permanentlyDelete();
    }
  };

  const permanentlyDelete = async () => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', task.id);

    if (!error) {
      onTaskDelete(task.id);
    } else {
      console.error('Error deleting task:', error);
    }
  };

  const handleDeleteClick = () => {
    permanentlyDelete();
  };

  const dueToday = new Date(task.due_date).toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center justify-between rounded border border-gray-300 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-0"
        />
        <span
          className={`text-sm ${checked ? 'line-through text-gray-400' : 'text-gray-800'}`}
        >
          {task.title}
        </span>
      </div>

      <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
        <span>
          📅 {new Date(task.due_date).toLocaleDateString()}
          {dueToday && (
            <> ⏰ {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
          )}
        </span>
        <FaTrash
          onClick={handleDeleteClick}
          className="cursor-pointer text-red-500 hover:text-red-700"
          title="Delete task"
        />
      </div>
    </div>
  );
};

export default TaskItem;
