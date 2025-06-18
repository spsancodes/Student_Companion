import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import TaskItem from './TaskItem';

const TaskList = ({ userId, activeList, tasks, setTasks }) => {
  const [removedTask, setRemovedTask] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('list_id', activeList)
      .order('due_date', { ascending: true });

    if (!error) setTasks(data);
    else console.error(error);
  };

  useEffect(() => {
    if (userId && activeList) {
      fetchTasks();
    }
  }, [userId, activeList]);

  const handleTaskDelete = async (taskId) => {
    await supabase.from('todos').delete().eq('id', taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleTaskChecked = (task) => {
    setRemovedTask(task);
    setTasks(prev => prev.filter(t => t.id !== task.id));

    const timeout = setTimeout(async () => {
      await supabase.from('todos').delete().eq('id', task.id);
      setRemovedTask(null);
    }, 2500);

    setUndoTimeout(timeout);
  };

  const handleUndo = () => {
    clearTimeout(undoTimeout);
    setTasks(prev => [...prev, removedTask]);
    setRemovedTask(null);
  };

return (
  <div className="flex justify-center items-start px-4 mt-8">
    <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6">
      <h2 className="text-gray-700 font-semibold mb-4 text-lg">📋 My Tasks</h2>

      {tasks.length === 0 ? (
        <div className="text-gray-400 text-center">
          <img
            src="https://www.gstatic.com/tasks/assets/task_completion_dark.svg"
            alt="All done"
            className="mx-auto mb-4 max-w-[120px]"
          />
          <p className="text-base">All tasks complete</p>
          <small className="text-gray-500">Nice work!</small>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onTaskDelete={handleTaskDelete}
              showUndo={handleTaskChecked}
            />
          ))}
        </div>
      )}
    </div>

    {removedTask && (
      <div className="fixed bottom-4 left-4 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg flex items-center justify-between w-[280px]">
        ✅ Task completed
        <button
          className="ml-3 px-3 py-1 text-sm border border-white rounded hover:bg-white hover:text-gray-800"
          onClick={handleUndo}
        >
          Undo
        </button>
      </div>
    )}
  </div>
);

};

export default TaskList;