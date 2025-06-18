import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const SidebarListSelector = ({ lists, setLists, activeList, setActiveList, userId }) => {
  const [newListName, setNewListName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const inputRef = useRef(null);

  const handleCreateList = async () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from('todo_lists')
      .insert([{ name: trimmed, user_id: userId }])
      .select();

    if (!error && data?.length > 0) {
      setLists(prev => [...prev, data[0]]);
      setActiveList(data[0].id);
      setNewListName('');
      setShowAddForm(false);
    } else {
      console.error('List creation failed:', error);
    }
  };

  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddForm]);

  return (
    <div className="min-w-[220px] bg-gray-100 h-full px-4 py-6 shadow-inner">
      <h2 className="text-gray-800 text-lg font-semibold mb-4">🗂️ My Lists</h2>

      <div className="flex flex-col gap-2">
        {lists.map(list => (
          <button
            key={list.id}
            onClick={() => setActiveList(list.id)}
            className={`text-left px-4 py-2 rounded-md transition-all
              ${activeList === list.id
                ? 'bg-gray-600 text-white font-medium'
                : 'bg-white text-gray-700 hover:bg-gray-200'}
            `}
          >
            {list.name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {showAddForm ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              ref={inputRef}
              className="w-full px-3 py-2 text-black rounded border border-gray-300"
              placeholder="New list name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
            />
            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={handleCreateList}
                disabled={!newListName.trim()}
              >
                Add
              </button>
              <button
                className="text-gray-600 hover:text-red-500 text-sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="w-full mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => setShowAddForm(true)}
          >
            + New List
          </button>
        )}
      </div>
    </div>
  );
};

export default SidebarListSelector;
