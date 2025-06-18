import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const TaskListsSidebar = ({ userId, activeListId, setActiveListId }) => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const fetchLists = async () => {
    const { data, error } = await supabase
      .from('todo_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!error) setLists(data);
  };

  useEffect(() => {
    if (userId) fetchLists();
  }, [userId]);

  const handleAddList = async () => {
    if (!newListName.trim()) return;

    const { data, error } = await supabase.from('task_lists').insert({
      user_id: userId,
      name: newListName.trim()
    });

    if (!error) {
      setNewListName('');
      setShowInput(false);
      fetchLists();
    }
  };

  return (
    <div className="border-r border-gray-200 p-4 min-w-[200px]">
      <h2 className="text-lg font-semibold mb-4">🗂️ Your Lists</h2>

      <ul className="space-y-1">
        {lists.map((list) => (
          <li
            key={list.id}
            className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-100 ${
              list.id === activeListId ? 'bg-blue-100 text-blue-700 font-medium' : ''
            }`}
            onClick={() => setActiveListId(list.id)}
          >
            {list.name}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        {showInput ? (
          <div>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded"
              placeholder="New list name"
            />
            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                onClick={handleAddList}
              >
                Add
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-400"
                onClick={() => setShowInput(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="w-full mt-2 px-3 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm"
            onClick={() => setShowInput(true)}
          >
            + Add List
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskListsSidebar;
